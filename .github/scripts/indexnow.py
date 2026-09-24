"""Submit sitemap URLs only after verifying the corresponding Pages deployment."""

import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET


ENDPOINT = 'https://api.indexnow.org/indexnow'


class VerificationPending(Exception):
    pass


def report(message):
    print(message, flush=True)
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a', encoding='utf-8') as output:
            output.write(message + '\n\n')


def request(url, *, payload=None, headers=None):
    body = None if payload is None else json.dumps(payload).encode('utf-8')
    request_headers = {'User-Agent': 'VirtualBuddy-IndexNow'}
    request_headers.update(headers or {})
    if body is not None:
        request_headers['Content-Type'] = 'application/json; charset=utf-8'
    req = urllib.request.Request(url, data=body, headers=request_headers,
                                 method='GET' if body is None else 'POST')
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.geturl() != url:
                raise ValueError(f'Unexpected redirect for {url}')
            return response.getcode(), response.read()
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read()


def github_json(path):
    status, body = request('https://api.github.com' + path, headers={
        'Authorization': 'Bearer ' + os.environ['GITHUB_TOKEN'],
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    })
    if status != 200:
        raise ValueError(f'GitHub deployment check failed: HTTP {status}')
    return json.loads(body)


def git(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args],
                                   text=True, encoding='utf-8').strip()


def sitemap_urls(xml):
    return {node.text.strip() for node in ET.fromstring(xml).findall(
        './/{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
        if node.text and node.text.strip()}


def validate_urls(urls, host):
    for url in urls:
        parsed = urllib.parse.urlsplit(url)
        if parsed.scheme != 'https' or parsed.netloc != host or parsed.fragment:
            raise ValueError(f'URL outside the configured HTTPS host: {url}')
    if len(urls) > 10000:
        raise ValueError('IndexNow permits at most 10000 URLs per request')
    return sorted(urls)


def changed_urls(root, previous, current, origin, current_urls):
    if not previous:
        return current_urls
    subprocess.run(['git', '-C', str(root), 'merge-base', '--is-ancestor',
                    previous, current], check=True)
    previous_urls = sitemap_urls(git(root, 'show', f'{previous}:sitemap.xml'))
    urls = current_urls ^ previous_urls
    for filename in git(root, 'diff', '--name-only', '--no-renames', previous, current).splitlines():
        if not filename.endswith('.html'):
            continue
        relative = filename[:-10] if filename.endswith('index.html') else filename
        url = origin + '/' + relative
        if url in current_urls | previous_urls:
            urls.add(url)
    return urls


def last_accepted_commit(repository):
    # Artifact names record the actual deployed commit. The event's default
    # branch SHA can instead refer to a newer, still unpublished commit.
    page = 1
    while True:
        artifacts = github_json(f'/repos/{repository}/actions/artifacts?per_page=100&page={page}')['artifacts']
        for artifact in artifacts:
            match = re.fullmatch(r'indexnow-accepted-([0-9a-f]{40})', artifact.get('name', ''))
            if (match and not artifact.get('expired')
                    and artifact.get('workflow_run', {}).get('head_branch') == 'main'):
                return match.group(1)
        if len(artifacts) < 100:
            return None
        page += 1


def record_acceptance(expected, requested):
    # A single-URL probe must never acknowledge the entire deployment.
    if not requested and os.environ.get('ACK_PATH'):
        Path(os.environ['ACK_PATH']).write_text(json.dumps({'commit': expected}), encoding='utf-8')


def require_deployed(repository, expected):
    latest = github_json(f'/repos/{repository}/pages/builds/latest')
    if latest.get('status') != 'built' or latest.get('commit') != expected:
        raise ValueError('The expected commit is not the latest completed Pages deployment: '
                         f"expected {expected}, observed {latest.get('commit')} ({latest.get('status')})")


def verify_public_key(origin, key):
    key_url = f'{origin}/{key}.txt'
    status, body = request(key_url)
    if status != 200 or body != key.encode('utf-8'):
        raise ValueError(f'Public key check failed (HTTP {status}); expected the exact '
                         'UTF-8 key without BOM or newline')
    return key_url


def main():
    root = Path(os.environ['GITHUB_WORKSPACE'])
    repository = os.environ['GITHUB_REPOSITORY']
    expected = os.environ['TARGET_SHA']
    event_name = os.environ['GITHUB_EVENT_NAME']
    if not re.fullmatch(r'[0-9a-f]{40}', expected) or git(root, 'rev-parse', 'HEAD') != expected:
        raise ValueError('The checkout does not match the expected deployment commit')
    if event_name == 'page_build':
        event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text(encoding='utf-8'))
        if (event.get('build', {}).get('status') != 'built'
                or event.get('build', {}).get('commit') != expected
                or event.get('repository', {}).get('full_name') != repository):
            raise ValueError('Only successful Pages deployments from this repository main branch are accepted')
    elif event_name != 'workflow_dispatch':
        raise ValueError(f'Unsupported event: {event_name}')

    config = json.loads((root / '.github/indexnow.json').read_text(encoding='utf-8'))
    host, key = config['host'], config['key']
    if not re.fullmatch(r'[a-z0-9.-]+', host) or not re.fullmatch(r'[A-Za-z0-9-]{8,128}', key):
        raise ValueError('Invalid IndexNow host or key format')
    origin = 'https://' + host
    if (root / f'{key}.txt').read_bytes() != key.encode('utf-8'):
        raise ValueError('Repository key file must contain exactly the configured key')
    require_deployed(repository, expected)
    key_url = verify_public_key(origin, key)
    report(f'Published commit verified: {expected}. Public key file matches exactly.')

    if event_name == 'page_build' and config.get('automatic', True) is not True:
        raise VerificationPending('Automatic submissions paused for controlled key verification; use a manual single-URL run')

    current_urls = sitemap_urls((root / 'sitemap.xml').read_bytes())
    validate_urls(current_urls, host)
    requested = os.environ.get('REQUESTED_URL', '').strip()
    submit_all = os.environ.get('SUBMIT_ALL', '').lower() == 'true'
    if requested:
        if submit_all or requested not in current_urls:
            raise ValueError('Select either one current sitemap URL or submit_all')
        urls = {requested}
    elif submit_all:
        urls = current_urls
    elif event_name == 'page_build':
        previous = last_accepted_commit(repository)
        urls = changed_urls(root, previous, expected, origin, current_urls)
    else:
        raise ValueError('Manual runs require a sitemap URL or submit_all=true')
    urls = validate_urls(urls, host)
    if not urls:
        report('No changed sitemap URLs; nothing to submit.')
        record_acceptance(expected, requested)
        return

    payload = {'host': host, 'key': key, 'keyLocation': key_url, 'urlList': urls}
    for attempt in range(3):
        if attempt:
            report('HTTP 202: key verification is pending. Rechecking after five minutes.')
            time.sleep(300)
            require_deployed(repository, expected)
            verify_public_key(origin, key)
        status, body = request(ENDPOINT, payload=payload)
        report(f'IndexNow response: HTTP {status}; {len(urls)} URL(s).')
        if status == 200:
            report('IndexNow accepted the URLs (HTTP 200). Indexing is not guaranteed.')
            record_acceptance(expected, requested)
            return
        if status == 202:
            continue
        detail = body.decode('utf-8', errors='replace')[:1000]
        if status == 403:
            raise ValueError('IndexNow rejected key verification (HTTP 403) despite successful '
                             f'public preflight. No automatic retry. Response: {detail}')
        raise ValueError(f'IndexNow submission failed: HTTP {status}. Response: {detail}')
    raise VerificationPending('HTTP 202 persists after two rechecks; key verification remains unconfirmed')


if __name__ == '__main__':
    try:
        main()
    except VerificationPending as exc:
        report(f'::warning::{exc}')
        sys.exit(2)
    except (ValueError, KeyError, OSError, urllib.error.URLError,
            subprocess.CalledProcessError, ET.ParseError) as exc:
        report(f'::error::{exc}')
        sys.exit(1)
