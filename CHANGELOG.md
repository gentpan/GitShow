# Changelog

## 1.2.0 - 2026-05-02

### Added

- Support multiple admin Passkeys.
- Add Passkey notes so each credential can be labeled by device or purpose.
- Add Passkey management in the admin panel, including note editing, single deletion, and clear-all.

### Fixed

- Show recent activity in newest-first order instead of oldest-first.
- Make page loading indicators render as circular spinners despite the global square-corner style.
- Avoid browser password-save prompts by keeping sensitive admin fields empty unless edited.

### Changed

- Pin the Docker Compose image and container name to `gitshow`.
- Keep legacy Passkeys compatible and expose them in the new Passkey management list.
