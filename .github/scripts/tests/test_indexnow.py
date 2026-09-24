import contextlib
import io
import json
import os
from pathlib import Path
import runpy
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import urllib.error


ROOT = Path(__file__).resolve().parents[3]
KEY = '19b049e8-41d8-4ef8-8278-5a3bf442da72'
ORIGIN = 'https://virtualbuddy.ai'


class Response(io.BytesIO):
    def __init__(self, body, status=200, url=''):
        super().__init__(body)
        self.status = status
        self.url = url
        self.headers = {'Content-Type': 'text/plain; charset=utf-8'}

    def getcode(self):
        return self.status

    def geturl(self):
        return self.url


class IndexNowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.repo = Path(cls.temp.name)
        def git(*args):
            return subprocess.check_output(['git', '-C', str(cls.repo), *args], text=True, stderr=subprocess.DEVNULL).strip()
        cls.git = staticmethod(git)
        git('init')
        git('config', 'user.name', 'IndexNow Test')
        git('config', 'user.email', 'test@example.invalid')
        git('config', 'core.autocrlf', 'false')
        git('config', 'core.excludesFile', str(cls.repo / 'empty-ignore'))
        (cls.repo / 'empty-ignore').write_text('')
        (cls.repo / '.github').mkdir()
        (cls.repo / '.github' / 'indexnow.json').write_text(json.dumps({'host': 'virtualbuddy.ai', 'key': KEY}))
        (cls.repo / f'{KEY}.txt').write_bytes(KEY.encode())
        (cls.repo / 'index.html').write_text('home')
        (cls.repo / 'old').mkdir()
        (cls.repo / 'old' / 'index.html').write_text('old')
        cls.write_sitemap(['/', '/old/'])
        git('add', '.')
        git('commit', '-qm', 'previous published site')
        cls.before = git('rev-parse', 'HEAD')
        (cls.repo / 'old' / 'index.html').unlink()
        (cls.repo / 'branchen').mkdir()
        (cls.repo / 'branchen' / 'index.html').write_text('new')
        cls.write_sitemap(['/', '/branchen/'])
        git('add', '-A')
        git('commit', '-qm', 'new site')
        cls.current = git('rev-parse', 'HEAD')

    @classmethod
    def write_sitemap(cls, paths):
        (cls.repo / 'sitemap.xml').write_text('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(f'<url><loc>{ORIGIN}{p}</loc></url>' for p in paths) + '</urlset>')

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def execute(self, *, deployment='built', deployed_sha=None, key_body=None, statuses=(200,), submit_all=True, event='workflow_dispatch', requested_url='', accepted_sha=None, artifacts_present=True, previous_deployment=None):
        calls, delays = [], []
        codes = iter(statuses)
        last = statuses[-1]
        def urlopen(request, timeout=30):
            nonlocal last
            url = request.full_url if hasattr(request, 'full_url') else request
            method = request.get_method() if hasattr(request, 'get_method') else 'GET'
            calls.append((method, url, getattr(request, 'data', None), dict(getattr(request, 'headers', {}))))
            if url.endswith('/pages/builds/latest'):
                return Response(json.dumps({'status': deployment, 'commit': deployed_sha or self.current}).encode(), url=url)
            if '/pages/builds?' in url:
                return Response(json.dumps([{'status': 'built', 'commit': self.current}, {'status': 'built', 'commit': previous_deployment or self.before}]).encode(), url=url)
            if '/actions/artifacts?' in url:
                artifacts = [{'name': 'indexnow-accepted-' + (accepted_sha or self.before), 'expired': False, 'workflow_run': {'head_branch': 'main'}}] if artifacts_present else []
                return Response(json.dumps({'artifacts': artifacts}).encode(), url=url)
            if url == f'{ORIGIN}/{KEY}.txt':
                return Response(KEY.encode() if key_body is None else key_body, url=url)
            if method != 'POST' or url != 'https://api.indexnow.org/indexnow':
                raise AssertionError(f'Unexpected network request: {method} {url}')
            last = next(codes, last)
            if last >= 400:
                raise urllib.error.HTTPError(url, last, 'rejected', {}, io.BytesIO(b'{"errorCode":"UserForbiddedToAccessSite"}'))
            return Response(b'', status=last, url=url)
        event_file = self.repo / 'event.json'
        event_file.write_text(json.dumps({'workflow_run': {'head_sha': self.current, 'head_branch': 'main', 'conclusion': 'success', 'head_repository': {'full_name': 'owner/site'}}}))
        self.ack_path = self.repo / 'ack.json'
        self.ack_path.unlink(missing_ok=True)
        env = {'GITHUB_WORKSPACE': str(self.repo), 'GITHUB_REPOSITORY': 'owner/site', 'GITHUB_TOKEN': 'test-token', 'GITHUB_SHA': self.current, 'TARGET_SHA': self.current, 'GITHUB_EVENT_NAME': event, 'GITHUB_EVENT_PATH': str(event_file), 'SUBMIT_ALL': str(submit_all).lower(), 'REQUESTED_URL': requested_url, 'GITHUB_STEP_SUMMARY': str(self.repo / 'summary.md'), 'ACK_PATH': str(self.ack_path)}
        code = 0
        stdout = io.StringIO()
        old_cwd = Path.cwd()
        try:
            os.chdir(self.repo)
            with patch.dict(os.environ, env), patch('urllib.request.urlopen', side_effect=urlopen), patch('time.sleep', side_effect=delays.append), contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stdout):
                try:
                    runpy.run_path(str(ROOT / '.github/scripts/indexnow.py'), run_name='__main__')
                except SystemExit as exc:
                    code = exc.code if isinstance(exc.code, int) else 1
        finally:
            os.chdir(old_cwd)
        return code, calls, delays, stdout.getvalue()

    def posts(self, calls):
        return [c for c in calls if c[0] == 'POST']

    def test_build_in_progress_prevents_any_submission(self):
        code, calls, _, _ = self.execute(deployment='building')
        self.assertNotEqual(code, 0)
        self.assertEqual(self.posts(calls), [])

    def test_different_deployed_commit_prevents_any_submission(self):
        code, calls, _, _ = self.execute(deployed_sha=self.before)
        self.assertNotEqual(code, 0)
        self.assertEqual(self.posts(calls), [])

    def test_wrong_public_key_prevents_any_submission(self):
        code, calls, _, _ = self.execute(key_body=b'wrong-key')
        self.assertNotEqual(code, 0)
        self.assertEqual(self.posts(calls), [])

    def test_trailing_newline_is_not_accepted_as_exact_key(self):
        code, calls, _, _ = self.execute(key_body=(KEY + '\n').encode())
        self.assertNotEqual(code, 0)
        self.assertEqual(self.posts(calls), [])

    def test_403_stops_without_blind_retries(self):
        code, calls, delays, _ = self.execute(statuses=(403,))
        self.assertNotEqual(code, 0)
        self.assertEqual(len(self.posts(calls)), 1)
        self.assertEqual(delays, [])

    def test_202_without_verified_response_does_not_report_success(self):
        code, calls, delays, _ = self.execute(statuses=(202,))
        self.assertNotEqual(code, 0)
        self.assertEqual(len(self.posts(calls)), 3)
        self.assertEqual(delays, [300, 300])

    def test_202_is_rechecked_before_success(self):
        code, calls, delays, _ = self.execute(statuses=(202, 200))
        self.assertEqual(code, 0)
        self.assertEqual(len(self.posts(calls)), 2)
        self.assertEqual(delays, [300])

    def test_valid_release_submits_expected_urls_without_github_token(self):
        code, calls, _, _ = self.execute()
        self.assertEqual(code, 0)
        posts = self.posts(calls)
        self.assertEqual(len(posts), 1)
        self.assertEqual(json.loads(posts[0][2]), {'host': 'virtualbuddy.ai', 'key': KEY, 'keyLocation': f'{ORIGIN}/{KEY}.txt', 'urlList': [ORIGIN + '/', ORIGIN + '/branchen/']})
        public_calls = [c for c in calls if not c[1].startswith('https://api.github.com/')]
        self.assertTrue(all('test-token' not in str(c) for c in public_calls))

    def test_automatic_submission_includes_added_and_removed_urls(self):
        code, calls, _, _ = self.execute(submit_all=False, event='workflow_run')
        self.assertEqual(code, 0)
        self.assertEqual([json.loads(c[2])['urlList'] for c in self.posts(calls)], [[ORIGIN + '/branchen/', ORIGIN + '/old/']])

    def test_unsubmitted_changes_survive_a_later_documentation_deployment(self):
        # The last Pages deployment already contained the new HTML, but its
        # IndexNow notification failed. Only the older acceptance is authoritative.
        code, calls, _, _ = self.execute(submit_all=False, event='workflow_run', previous_deployment=self.current)
        self.assertEqual(code, 0)
        self.assertEqual([json.loads(c[2])['urlList'] for c in self.posts(calls)], [[ORIGIN + '/branchen/', ORIGIN + '/old/']])
        self.assertEqual(json.loads(self.ack_path.read_text())['commit'], self.current)

    def test_first_automatic_run_backfills_the_current_sitemap(self):
        code, calls, _, _ = self.execute(submit_all=False, event='workflow_run', artifacts_present=False)
        self.assertEqual(code, 0)
        self.assertEqual([json.loads(c[2])['urlList'] for c in self.posts(calls)], [[ORIGIN + '/', ORIGIN + '/branchen/']])

    def test_one_url_success_does_not_advance_full_submission_checkpoint(self):
        code, calls, _, _ = self.execute(submit_all=False, requested_url=ORIGIN + '/branchen/')
        self.assertEqual(code, 0)
        self.assertEqual(len(self.posts(calls)), 1)
        self.assertFalse(self.ack_path.exists())

    def test_failed_submission_does_not_advance_checkpoint(self):
        code, _, _, _ = self.execute(statuses=(403,))
        self.assertNotEqual(code, 0)
        self.assertFalse(self.ack_path.exists())


if __name__ == '__main__':
    unittest.main()
