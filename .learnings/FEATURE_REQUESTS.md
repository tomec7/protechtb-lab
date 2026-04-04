# FEATURE_REQUESTS.md

## [FEAT-20260403-001] lower-approval-friction

**Logged**: 2026-04-03T07:50:00+02:00
**Priority**: high
**Status**: pending
**Area**: config

### Requested Capability
Minimalizovať počet manuálnych schválení pre bezpečné opakované exec kroky v Telegram DM.

### User Context
Používateľ chce autonómny agent flow bez častého potvrdzovania každej akcie.

### Complexity Estimate
medium

### Suggested Implementation
- Preferovať `allow-always` pre dôveryhodné opakované príkazy.
- Zoskupovať kroky do väčších batch operácií.
- Uprednostniť one-shot skripty s verifikáciou pred multi-step chainom.

### Metadata
- Frequency: recurring
- Related Features: exec approvals, telegram approvals

---
