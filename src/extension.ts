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

function clampPercentage(value: number | undefined, fallback: number): number {
  const pct = typeof value === 'number' ? value : fallback;
  return Math.max(0, Math.min(100, pct)) / 100;
}

function deriveWorkspaceId(): string {
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    return folders.map((f) => f.uri.fsPath).join('|');
  }
  if (vscode.workspace.workspaceFile) {
    return vscode.workspace.workspaceFile.fsPath;
  }
  return vscode.workspace.name || 'untitled';
}

function normalizeHexColor(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed.length) {
    return undefined;
  }
  const cleaned = trimmed.replace(/^0x/i, '#');
  const withHash = cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
  const hex = withHash.slice(1);
  if (!/^[0-9A-F]+$/i.test(hex) || (hex.length !== 3 && hex.length !== 6)) {
    return undefined;
  }
  const normalized = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  return `#${normalized.toUpperCase()}`;
}

async function assign(context: vscode.ExtensionContext) {
  try {
    const cfgRoot = vscode.workspace.getConfiguration('tinto');
    if (!cfgRoot.get<boolean>('enable', true)) {
      return;
    }

    const lockInput = cfgRoot.get<string>('lockColor', '') || '';
    const lockedColor = normalizeHexColor(lockInput);
    if (lockInput && !lockedColor) {
      vscode.window.showWarningMessage(`Tinto: '${lockInput}' is not a valid hex color; using automatic tint instead.`);
    }
    let colorHex = lockedColor;

    if (!colorHex) {
      const workspaceId = deriveWorkspaceId();
      const hue = hashString(workspaceId) % 360;
      const saturation = clampPercentage(cfgRoot.get<number>('saturation'), 30);
      const lightness = clampPercentage(cfgRoot.get<number>('lightness'), 95);
      colorHex = hslToHex(hue, saturation, lightness);
    }

    await applyTint(colorHex);
  } catch (err) {
    vscode.window.showErrorMessage('Tinto: Failed to assign color: ' + (err instanceof Error ? err.message : String(err)));
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('tinto.applyTint', () => assign(context)),
    vscode.commands.registerCommand('tinto.removeTint', async () => {
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
