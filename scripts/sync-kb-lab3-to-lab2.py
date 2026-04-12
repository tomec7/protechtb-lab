#!/usr/bin/env python3
import argparse
import re
import subprocess
import tarfile
import time
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen

WORKSPACE = Path('/home/lenovo/.openclaw/workspace')
DEFAULT_LAB2 = WORKSPACE / 'kb-design-lab2'
DEFAULT_LAB3 = WORKSPACE / 'kb-design-lab3'
DEFAULT_MEMORY = WORKSPACE / 'memory'

PROD_MARKERS = ['kb-design-lab3', 'krasnyexterier.sk']


def run(cmd, cwd=None, check=True):
    p = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    if check and p.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{p.stdout}\n{p.stderr}")
    return p


def backup_lab2(lab2: Path, memory_dir: Path) -> Path:
    memory_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    out = memory_dir / f'{lab2.name}-backup-before-sync-script-{ts}.tar.gz'
    with tarfile.open(out, 'w:gz') as tar:
        tar.add(lab2, arcname='.')
    return out


def rsync_prod_to_lab2(lab3: Path, lab2: Path):
    run(['rsync', '-a', '--delete', '--exclude', '.git', '--exclude', 'CNAME', f'{lab3}/', f'{lab2}/'])


def patch_html_files(lab2: Path, base_path: str):
    for html in lab2.rglob('*.html'):
        s = html.read_text(encoding='utf-8', errors='ignore')

        s = s.replace("var BASE = '';", f"var BASE = '{base_path}';")

        s = re.sub(r'src="/assets/', f'src="{base_path}/assets/', s)
        s = re.sub(r'href="/assets/', f'href="{base_path}/assets/', s)
        s = re.sub(r'href="/logo-ke\.png"', f'href="{base_path}/logo-ke.png"', s)
        s = re.sub(r'src="/logo-ke\.png"', f'src="{base_path}/logo-ke.png"', s)

        if re.search(r'<link[^>]+rel="manifest"', s, flags=re.I):
            s = re.sub(r'<link[^>]+rel="manifest"[^>]*>', f'  <link rel="manifest" href="{base_path}/site.webmanifest" />', s, count=1, flags=re.I)
        else:
            s = s.replace('</head>', f'  <link rel="manifest" href="{base_path}/site.webmanifest" />\n</head>')

        html.write_text(s, encoding='utf-8')


def write_manifest(lab2: Path, base_path: str):
    manifest = lab2 / 'site.webmanifest'
    manifest.write_text(
        '{\n'
        '  "name": "Krásny Exteriér",\n'
        '  "short_name": "Krásny Exteriér",\n'
        f'  "start_url": "{base_path}/",\n'
        f'  "scope": "{base_path}/",\n'
        '  "display": "standalone",\n'
        '  "background_color": "#f8fafc",\n'
        '  "theme_color": "#0f172a",\n'
        '  "icons": [\n'
        f'    {{ "src": "{base_path}/logo-ke.png", "sizes": "512x512", "type": "image/png" }}\n'
        '  ]\n'
        '}\n',
        encoding='utf-8'
    )


def verify_local(lab2: Path, base_path: str) -> list[str]:
    errors = []

    for p in lab2.rglob('*'):
        if p.is_file() and '.git' not in p.parts:
            if p.suffix.lower() in ('.html', '.js', '.css', '.json', '.txt', '.xml'):
                txt = p.read_text(encoding='utf-8', errors='ignore')
                for marker in PROD_MARKERS:
                    if marker in txt:
                        errors.append(f'Prod marker "{marker}" found in {p.relative_to(lab2)}')

    for html in lab2.rglob('*.html'):
        s = html.read_text(encoding='utf-8', errors='ignore')
        s_no_script = re.sub(r'<script\b[^>]*>[\s\S]*?</script>', '', s, flags=re.I)
        refs = re.findall(r'(?:href|src)="([^"]+)"', s_no_script)
        for ref in refs:
            if ref.startswith(('http://', 'https://', '//', '#', 'mailto:', 'tel:', 'javascript:', 'data:')):
                continue
            if ref.startswith('/'):
                if not ref.startswith(base_path + '/'):
                    errors.append(f'Absolute ref not using {base_path}/: {ref} in {html.relative_to(lab2)}')
                    continue
                target = lab2 / ref.replace(base_path + '/', '', 1)
            else:
                target = (html.parent / ref).resolve()
            if not target.exists():
                errors.append(f'Missing file for ref {ref} in {html.relative_to(lab2)}')

    js_files = list((lab2 / 'assets').glob('*.js'))
    for js in js_files:
        txt = js.read_text(encoding='utf-8', errors='ignore')
        imgs = sorted(set(re.findall(r'([A-Za-z0-9_\-]+\.(?:jpg|jpeg|png|webp))', txt)))
        for img in imgs:
            if not (lab2 / img).exists() and not (lab2 / 'assets' / img).exists():
                errors.append(f'Missing image referenced in JS: {img}')

    return errors


def git_commit_push(lab2: Path) -> str:
    run(['git', 'add', '-A'], cwd=lab2)
    status = run(['git', 'status', '--porcelain'], cwd=lab2).stdout.strip()
    if not status:
        return run(['git', 'rev-parse', '--short', 'HEAD'], cwd=lab2).stdout.strip()
    msg = 'sync: one-command safe sync from lab3 with target-base routing and integrity checks'
    run(['git', 'commit', '-m', msg], cwd=lab2)
    run(['git', 'push', 'origin', 'main'], cwd=lab2)
    return run(['git', 'rev-parse', '--short', 'HEAD'], cwd=lab2).stdout.strip()


def wait_deploy_success(repo: str, timeout_sec=600):
    start = time.time()
    while time.time() - start < timeout_sec:
        p = run(['gh', 'run', 'list', '--repo', repo, '--limit', '1', '--json', 'status,conclusion,headSha', '--jq', '.[0]'], check=False)
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


def live_check(lab2: Path, base_url: str):
    urls = []
    for html in lab2.rglob('*.html'):
        rel = html.relative_to(lab2).as_posix()
        if rel == 'index.html':
            url = base_url + '/'
        elif rel.endswith('/index.html'):
            url = base_url + '/' + rel[:-10]
        else:
            url = base_url + '/' + rel
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
    ap = argparse.ArgumentParser(description='Sync lab3 -> target lab safely with checks')
    ap.add_argument('--lab2-dir', default=str(DEFAULT_LAB2), help='Target lab directory')
    ap.add_argument('--lab3-dir', default=str(DEFAULT_LAB3), help='Source prod/lab3 directory')
    ap.add_argument('--repo', default='tomec7/kb-design-lab2', help='GitHub repo for run checks')
    ap.add_argument('--base-path', default='/kb-design-lab2', help='Public base path (e.g. /kb-design-lab2-test)')
    ap.add_argument('--base-url', default='https://tomec7.github.io/kb-design-lab2', help='Public base URL')
    ap.add_argument('--memory-dir', default=str(DEFAULT_MEMORY), help='Where to store backups')
    ap.add_argument('--push', action='store_true', help='Commit and push target lab main')
    ap.add_argument('--live-check', action='store_true', help='After push, wait for deploy and check all pages')
    args = ap.parse_args()

    lab2 = Path(args.lab2_dir).resolve()
    lab3 = Path(args.lab3_dir).resolve()
    memory_dir = Path(args.memory_dir).resolve()

    if not lab2.exists() or not lab3.exists():
        raise SystemExit('Target lab or source lab3 directory missing')

    backup = backup_lab2(lab2, memory_dir)
    rsync_prod_to_lab2(lab3, lab2)
    patch_html_files(lab2, args.base_path)
    write_manifest(lab2, args.base_path)

    errors = verify_local(lab2, args.base_path)
    if errors:
        print('INTEGRITY_CHECK_FAILED')
        for e in errors:
            print('-', e)
        raise SystemExit(1)

    print(f'Backup: {backup}')
    print('Local integrity: OK')

    if args.push:
        sha = git_commit_push(lab2)
        print(f'Pushed commit: {sha}')
        if args.live_check:
            wait_deploy_success(args.repo)
            live_check(lab2, args.base_url)
            print('Live check: OK')


if __name__ == '__main__':
    main()
