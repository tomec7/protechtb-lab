# ProTechTB Production Rollback Notes (2026-04-06_23-33-45)

## Deployment
- Previous prod commit: `460b52b`
- New prod commit: `3de1857`
- Safety tag pushed before deploy: `pre-lab-deploy-20260406-233225`

## Quick rollback (if needed)
```bash
cd /tmp/protechtb-ghpages
git fetch origin
git checkout main
git reset --hard pre-lab-deploy-20260406-233225
git push --force-with-lease origin main
```

## Alternative rollback to previous commit
```bash
cd /tmp/protechtb-ghpages
git fetch origin
git checkout main
git reset --hard 460b52b
git push --force-with-lease origin main
```
