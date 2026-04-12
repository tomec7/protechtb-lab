#!/usr/bin/env python3
import argparse
import os
import re
import subprocess
import sys
import tarfile
import time
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

WORKSPACE = Path('/home/lenovo/.openclaw/workspace')
LAB2 = WORKSPACE / 'kb-design-lab2'
LAB3 = WORKSPACE / 'kb-design-lab3'
MEMORY = WORKSPACE / 'memory'

PROD_MARKERS = ['kb-design-lab3', 'krasnyexterier.sk']
LAB_BASE = '/kb-design-lab2'
LAB_URL_BASE = 'https://tomec7.github.io/kb-design-lab2'


def run(cmd, cwd=None, check=True):
    p = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    if check and p.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{p.stdout}\n{p.stderr}")
    return p


def backup_lab2() -> Path:
    MEMORY.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    out = MEMORY / f'kb-design-lab2-backup-before-sync-script-{ts}.tar.gz'
    with tarfile.open(out, 'w:gz') as tar:
        tar.add(LAB2, arcname='.')
    return out


def rsync_prod_to_lab2():
    run(['rsync', '-a', '--delete', '--exclude', '.git', '--exclude', 'CNAME', f'{LAB3}/', f'{LAB2}/'])


def patch_html_files():
    for html in LAB2.rglob('*.html'):
        s = html.read_text(encoding='utf-8', errors='ignore')

        s = s.replace("var BASE = '';", "var BASE = '/kb-design-lab2';")

        s = re.sub(r'src="/assets/', 'src="/kb-design-lab2/assets/', s)
        s = re.sub(r'href="/assets/', 'href="/kb-design-lab2/assets/', s)
        s = re.sub(r'href="/logo-ke\.png"', 'href="/kb-design-lab2/logo-ke.png"', s)
        s = re.sub(r'src="/logo-ke\.png"', 'src="/kb-design-lab2/logo-ke.png"', s)

        if re.search(r'<link[^>]+rel="manifest"', s, flags=re.I):
            s = re.sub(r'<link[^>]+rel="manifest"[^>]*>', '  <link rel="manifest" href="/kb-design-lab2/site.webmanifest" />', s, count=1, flags=re.I)
        else:
            s = s.replace('</head>', '  <link rel="manifest" href="/kb-design-lab2/site.webmanifest" />\n</head>')

        html.write_text(s, encoding='utf-8')


def write_manifest():
    manifest = LAB2 / 'site.webmanifest'
    manifest.write_text(
        '{\n'
        '  "name": "Krásny Exteriér",\n'
        '  "short_name": "Krásny Exteriér",\n'
        '  "start_url": "/kb-design-lab2/",\n'
        '  "scope": "/kb-design-lab2/",\n'
        '  "display": "standalone",\n'
        '  "background_color": "#f8fafc",\n'
        '  "theme_color": "#0f172a",\n'
        '  "icons": [\n'
        '    { "src": "/kb-design-lab2/logo-ke.png", "sizes": "512x512", "type": "image/png" }\n'
        '  ]\n'
        '}\n',
        encoding='utf-8'
    )


def verify_local() -> list[str]:
    errors = []

    # no prod markers
    for p in LAB2.rglob('*'):
        if p.is_file() and '.git' not in p.parts:
            txt = None
            if p.suffix.lower() in ('.html', '.js', '.css', '.json', '.txt', '.xml'):
                txt = p.read_text(encoding='utf-8', errors='ignore')
                for marker in PROD_MARKERS:
                    if marker in txt:
                        errors.append(f'Prod marker "{marker}" found in {p.relative_to(LAB2)}')

    # html link/src resolution
    for html in LAB2.rglob('*.html'):
        s = html.read_text(encoding='utf-8', errors='ignore')
        # ignore inline JS payloads when extracting html refs
        s_no_script = re.sub(r'<script\b[^>]*>[\s\S]*?</script>', '', s, flags=re.I)
        refs = re.findall(r'(?:href|src)="([^"]+)"', s_no_script)
        for ref in refs:
            if ref.startswith(('http://', 'https://', '//', '#', 'mailto:', 'tel:', 'javascript:', 'data:')):
                continue
            if ref.startswith('/'):
                if not ref.startswith('/kb-design-lab2/'):
                    errors.append(f'Absolute ref not using /kb-design-lab2/: {ref} in {html.relative_to(LAB2)}')
                    continue
                target = LAB2 / ref.replace('/kb-design-lab2/', '', 1)
            else:
                target = (html.parent / ref).resolve()
            if not target.exists():
                errors.append(f'Missing file for ref {ref} in {html.relative_to(LAB2)}')

    # image refs from bundle
    js_files = list((LAB2 / 'assets').glob('*.js'))
    for js in js_files:
        txt = js.read_text(encoding='utf-8', errors='ignore')
        imgs = sorted(set(re.findall(r'([A-Za-z0-9_\-]+\.(?:jpg|jpeg|png|webp))', txt)))
        for img in imgs:
            if not (LAB2 / img).exists() and not (LAB2 / 'assets' / img).exists():
                errors.append(f'Missing image referenced in JS: {img}')

    return errors


def git_commit_push() -> str:
    run(['git', 'add', '-A'], cwd=LAB2)
    status = run(['git', 'status', '--porcelain'], cwd=LAB2).stdout.strip()
    if not status:
        return run(['git', 'rev-parse', '--short', 'HEAD'], cwd=LAB2).stdout.strip()
    msg = 'sync(lab2): one-command sync from lab3 with lab2 routing and integrity checks'
    run(['git', 'commit', '-m', msg], cwd=LAB2)
    run(['git', 'push', 'origin', 'main'], cwd=LAB2)
    return run(['git', 'rev-parse', '--short', 'HEAD'], cwd=LAB2).stdout.strip()


def wait_deploy_success(timeout_sec=600):
    start = time.time()
    while time.time() - start < timeout_sec:
        p = run(['gh', 'run', 'list', '--repo', 'tomec7/kb-design-lab2', '--limit', '1', '--json', 'status,conclusion,headSha', '--jq', '.[0]'], check=False)
        out = p.stdout.strip()
        if out:
            if '"status":"completed"' in out and '"conclusion":"success"' in out:
                return
            if '"status":"completed"' in out and '"conclusion":"failure"' in out:
                raise RuntimeError(f'Deploy failed: {out}')
        time.sleep(5)
    raise RuntimeError('Timed out waiting for deploy')


def http_status(url: str) -> int:
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(req, timeout=20) as r:
        return r.status


def live_check():
    urls = []
    for html in LAB2.rglob('*.html'):
        rel = html.relative_to(LAB2).as_posix()
        if rel == 'index.html':
            url = LAB_URL_BASE + '/'
        elif rel.endswith('/index.html'):
            url = LAB_URL_BASE + '/' + rel[:-10]
        else:
            url = LAB_URL_BASE + '/' + rel
        urls.append(url)
    urls = sorted(set(urls))

    bad = []
    for u in urls:
        try:
            st = http_status(u)
            if st >= 400:
                bad.append((u, st))
        except Exception as e:
            bad.append((u, str(e)))

    if bad:
        raise RuntimeError('Live check failed:\n' + '\n'.join([f'{u} -> {s}' for u, s in bad]))


def main():
    ap = argparse.ArgumentParser(description='Sync kb-design-lab3 -> kb-design-lab2 safely with checks')
    ap.add_argument('--push', action='store_true', help='Commit and push to lab2 main')
    ap.add_argument('--live-check', action='store_true', help='After push, wait for deploy and check all pages')
    args = ap.parse_args()

    if not LAB2.exists() or not LAB3.exists():
        raise SystemExit('kb-design-lab2 or kb-design-lab3 directory missing')

    backup = backup_lab2()
    rsync_prod_to_lab2()
    patch_html_files()
    write_manifest()

    errors = verify_local()
    if errors:
        print('INTEGRITY_CHECK_FAILED')
        for e in errors:
            print('-', e)
        raise SystemExit(1)

    print(f'Backup: {backup}')
    print('Local integrity: OK')

    if args.push:
        sha = git_commit_push()
        print(f'Pushed commit: {sha}')
        if args.live_check:
            wait_deploy_success()
            live_check()
            print('Live check: OK')


if __name__ == '__main__':
    main()
