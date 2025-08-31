# Workspace Tint – minimal VS Code extension

A tiny VS Code extension that auto-assigns a deterministic color per workspace (based on the folder name). It sets `titleBar`, `activityBar`, and `statusBar` colors in the **workspace** scope so each project opens with its own tint—no manual theme switching.

---

## File tree
```
workspace-tint/
├─ package.json
├─ README.md
├─ src/
│  └─ extension.ts
├─ .vscodeignore
├─ tsconfig.json
```

---

## package.json
```json
{
  "name": "workspace-tint",
  "displayName": "Workspace Tint",
  "description": "Deterministic per-workspace UI tint (titleBar/activityBar/statusBar)",
  "version": "1.0.0",
  "publisher": "ContextLite",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "*"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "configuration": {
      "title": "Workspace Tint",
      "properties": {
        "workspaceTint.enable": {
          "type": "boolean",
          "default": true,
          "description": "Enable automatic per-workspace tinting."
        },
        "workspaceTint.lockColor": {
          "type": "string",
          "default": "",
          "description": "Optional hex color (e.g. #0A84FF) to lock for this workspace; leave empty for auto."
        },
        "workspaceTint.saturation": {
          "type": "number",
          "default": 0.6,
          "minimum": 0.2,
          "maximum": 1,
          "description": "Saturation (0-1)."
        },
        "workspaceTint.lightness": {
          "type": "number",
          "default": 0.22,
          "minimum": 0.1,
          "maximum": 0.5,
          "description": "Lightness (0-1) used for titleBar/activityBar; statusBar is slightly darker."
        }
      }
    },
    "commands": [
      {
        "command": "workspaceTint.assign",
        "title": "Workspace Tint: Assign/Refresh Color"
      },
      {
        "command": "workspaceTint.clear",
        "title": "Workspace Tint: Clear Workspace Colors"
      }
    ]
  },
  "scripts": {
    "vscode:prepublish": "npm run build",
    "build": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/vscode": "^1.80.0",
    "typescript": "^5.4.0",
    "vsce": "^3.0.0"
  }
}
```

---

## tsconfig.json
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2020",
    "outDir": "dist",
    "lib": ["es2020"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true
  },
  "exclude": ["node_modules", ".vscode-test"]
}
```

---

## .vscodeignore
```
**/*.map
**/*.ts
node_modules/.bin
.vscode/**
.git/**
**/.DS_Store
```

---

## src/extension.ts
```ts
import * as vscode from 'vscode';

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

function hslToHex(h: number, s: number, l: number): string {
  // h in [0,360), s,l in [0,1]
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => {
    const n = Math.round((v + m) * 255);
    return n.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function getContrastYIQ(hexcolor: string): string {
  // Returns '#FFFFFF' or '#000000' depending on background color for accessibility
  const hex = hexcolor.replace('#', '');
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

async function applyTint(colorHex: string) {
  const cfg = vscode.workspace.getConfiguration();
  const current = cfg.get<any>('workbench.colorCustomizations') || {};

  const darker = shade(colorHex, -0.1);
  const fg = getContrastYIQ(colorHex);
  const fgInactive = fg === '#FFFFFF' ? '#EEEEEE' : '#222222';

  const update = {
    ...current,
    'titleBar.activeBackground': colorHex,
    'titleBar.inactiveBackground': shade(colorHex, -0.05),
    'titleBar.activeForeground': fg,
    'titleBar.inactiveForeground': fgInactive,
    'activityBar.background': colorHex,
    'activityBar.foreground': fg,
    'statusBar.background': darker,
    'statusBar.foreground': fg
  };

  await cfg.update('workbench.colorCustomizations', update, vscode.ConfigurationTarget.Workspace);
}

function shade(hex: string, amt: number): string {
  // amt in [-1,1]
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  const adj = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  const nr = adj(r), ng = adj(g), nb = adj(b);
  return `#${nr.toString(16).padStart(2,'0')}${ng.toString(16).padStart(2,'0')}${nb.toString(16).padStart(2,'0')}`.toUpperCase();
}

async function assign(context: vscode.ExtensionContext) {
  try {
    const cfgRoot = vscode.workspace.getConfiguration('workspaceTint');
    const enabled = cfgRoot.get<boolean>('enable', true);
    if (!enabled) return;

    const lock = cfgRoot.get<string>('lockColor') || '';
    let colorHex = lock.match(/^#([0-9a-fA-F]{6})$/) ? lock.toUpperCase() : '';

    if (!colorHex) {
      // Only the first workspace folder is used for color hashing in multi-root workspaces.
      const folder = vscode.workspace.workspaceFolders?.[0]?.name || 'untitled';
      const h = hashString(folder) % 360; // deterministic hue
      const s = cfgRoot.get<number>('saturation', 0.6);
      const l = cfgRoot.get<number>('lightness', 0.22);
      colorHex = hslToHex(h, s, l);
    }
    await applyTint(colorHex);
  } catch (err) {
    vscode.window.showErrorMessage('Workspace Tint: Failed to assign color: ' + (err instanceof Error ? err.message : String(err)));
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('workspaceTint.assign', () => assign(context)),
    vscode.commands.registerCommand('workspaceTint.clear', async () => {
      const cfg = vscode.workspace.getConfiguration();
      const current = cfg.get<any>('workbench.colorCustomizations') || {};
      const keys = [
        'titleBar.activeBackground', 'titleBar.inactiveBackground',
        'titleBar.activeForeground', 'titleBar.inactiveForeground',
        'activityBar.background', 'activityBar.foreground',
        'statusBar.background', 'statusBar.foreground'
      ];
      for (const k of keys) delete current[k];
      await cfg.update('workbench.colorCustomizations', current, vscode.ConfigurationTarget.Workspace);
    })
  );

  // Assign on startup
  assign(context);
}

export function deactivate() {}
```

---

## README.md
```md
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
```

