#!/usr/bin/env python3
import argparse
import json
import re
import shutil
from pathlib import Path

TEXT_EXT = {
    ".html", ".htm", ".js", ".css", ".json", ".xml", ".txt", ".md", ".webmanifest"
}


def copy_tree(src: Path, dst: Path):
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst, ignore=shutil.ignore_patterns('.git'))


def rewrite_text_files(dst: Path, old_url: str, new_url: str, old_base: str, new_base: str):
    changed = []
    url_pat = re.compile(re.escape(old_url) + r'(?=[/"\'?#]|$)')
    base_pat = re.compile(re.escape(old_base) + r'(?=[/"\'?#]|$)')
    for p in dst.rglob('*'):
        if not p.is_file() or p.suffix.lower() not in TEXT_EXT:
            continue
        s = p.read_text(encoding='utf-8', errors='ignore')
        s2 = url_pat.sub(new_url, s)
        s2 = base_pat.sub(new_base, s2)
        if s2 != s:
            p.write_text(s2, encoding='utf-8')
            changed.append(str(p.relative_to(dst)))
    return changed


def strip_cname(dst: Path):
    cname = dst / 'CNAME'
    if cname.exists():
        cname.unlink()
        return True
    return False


def validate(dst: Path, old_url: str, old_base: str, new_base: str):
    errors = []

    # 1) no old url/base leftovers in text files
    old_url_pat = re.compile(re.escape(old_url) + r'(?=[/"\'?#]|$)')
    old_base_pat = re.compile(re.escape(old_base) + r'(?=[/"\'?#]|$)')
    for p in dst.rglob('*'):
        if not p.is_file() or p.suffix.lower() not in TEXT_EXT:
            continue
        s = p.read_text(encoding='utf-8', errors='ignore')
        if old_url_pat.search(s):
            errors.append(f'old_url left in {p.relative_to(dst)}')
        if old_base_pat.search(s):
            errors.append(f'old_base left in {p.relative_to(dst)}')

    # 2) html refs exist locally
    for html in dst.rglob('*.html'):
        s = html.read_text(encoding='utf-8', errors='ignore')
        # ignore inline scripts while extracting refs
        s_no_script = re.sub(r'<script\b[^>]*>[\s\S]*?</script>', '', s, flags=re.I)
        refs = re.findall(r'(?:src|href)="([^"]+)"', s_no_script)
        for ref in refs:
            if ref.startswith(('http://', 'https://', '#', 'mailto:', 'tel:', 'javascript:', 'data:', '//')):
                continue
            ref_clean = ref.split('#', 1)[0].split('?', 1)[0]
            if not ref_clean:
                continue
            if ref_clean.startswith('/'):
                if not ref_clean.startswith(new_base + '/'):
                    errors.append(f'non-prefixed absolute ref {ref} in {html.relative_to(dst)}')
                    continue
                target = dst / ref_clean.replace(new_base + '/', '', 1)
            else:
                target = (html.parent / ref_clean).resolve()
            if not target.exists():
                errors.append(f'missing {ref} in {html.relative_to(dst)}')

    return errors


def main():
    ap = argparse.ArgumentParser(description='Clone lab site locally and rewrite base/url safely')
    ap.add_argument('--src-dir', required=True)
    ap.add_argument('--dst-dir', required=True)
    ap.add_argument('--old-base-path', required=True)
    ap.add_argument('--new-base-path', required=True)
    ap.add_argument('--old-site-url', required=True)
    ap.add_argument('--new-site-url', required=True)
    ap.add_argument('--strip-cname', action='store_true')
    ap.add_argument('--report-json', default='')
    args = ap.parse_args()

    src = Path(args.src_dir).resolve()
    dst = Path(args.dst_dir).resolve()

    copy_tree(src, dst)
    cname_removed = strip_cname(dst) if args.strip_cname else False
    changed = rewrite_text_files(
        dst,
        old_url=args.old_site_url,
        new_url=args.new_site_url,
        old_base=args.old_base_path,
        new_base=args.new_base_path,
    )
    errors = validate(
        dst,
        old_url=args.old_site_url,
        old_base=args.old_base_path,
        new_base=args.new_base_path,
    )

    report = {
        'src': str(src),
        'dst': str(dst),
        'changedFiles': len(changed),
        'cnameRemoved': cname_removed,
        'errors': errors,
        'ok': len(errors) == 0,
    }

    print(json.dumps(report, ensure_ascii=False, indent=2))

    if args.report_json:
        Path(args.report_json).write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    if errors:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
