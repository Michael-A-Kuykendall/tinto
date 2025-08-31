# Workspace Tint

[![GitHub](https://img.shields.io/badge/GitHub-tinto-blue?logo=github)](https://github.com/Michael-A-Kuykendall/tinto)
# Workspace Tint

Automatically apply a deterministic color tint per workspace so you can tell windows apart at a glance.

## Features
- Tints **title bar**, **activity bar**, **status bar** per workspace
- Deterministic color from the workspace folder name (hash → HSL → hex)
- Optionally lock a specific hex color per workspace
- Commands:
  - `Workspace Tint: Assign/Refresh Color`
  - `Workspace Tint: Clear Workspace Colors`
- Accessible: Foreground color is chosen for contrast (white or black text)

## Settings
- `workspaceTint.enable` (boolean)
- `workspaceTint.lockColor` (string hex like `#0A84FF`)
- `workspaceTint.saturation` (0..1)
- `workspaceTint.lightness` (0..1)

## Install (local)
```bash
npm i
npm run build
# Press F5 in VS Code to launch an Extension Development Host
# or package as vsix:
npx vsce package
```

## Notes
- Colors are applied in **Workspace** scope, so they live in `.vscode/settings.json` per project.
- Works with Remote/WSL; coloring is applied in the remote workspace as well.
- In multi-root workspaces, only the first folder is used for color hashing.
- Open source and free to use. PRs welcome!
- Consider adding a screenshot or GIF for visual reference.
