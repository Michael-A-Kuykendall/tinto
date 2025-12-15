# Tinto

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/publishers/tinto)
[![GitHub](https://img.shields.io/badge/GitHub-tinto-blue?logo=github)](https://github.com/Michael-A-Kuykendall/tinto)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Instantly distinguish between VS Code workspaces with automatic, deterministic color tinting.**

Never lose track of which project you're working on! Tinto automatically assigns a unique, consistent color to each workspace's title bar, activity bar, and status bar based on the folder name. Each project gets its own visual identity.

## ✨ Features

### 🎨 **Automatic Color Assignment**
- **Deterministic**: Same workspace folder always gets the same color
- **Unique**: Each workspace gets a visually distinct color
- **Consistent**: Colors persist across VS Code restarts and sessions

### 🎯 **Smart Design**
- **Accessible**: Automatically chooses high-contrast text (black/white) for readability
- **Workspace-Scoped**: Colors are saved per-project in `.vscode/settings.json`
- **Performance-Optimized**: Activates after startup for zero impact on launch time

### 🛠 **Customizable**
- **Lock Colors**: Override with your preferred hex color per workspace
- **Adjustable**: Fine-tune saturation and lightness to your preference
- **Toggle**: Easy enable/disable without uninstalling

### 🌐 **Universal Compatibility**
- **Local Development**: Works with standard VS Code workspaces
- **Remote Development**: Full support for Remote-SSH, Remote-WSL, and Remote-Containers
- **Multi-Root**: Intelligently handles multi-root workspaces (uses first folder)

## 🚀 Quick Start

1. **Install** from the VS Code Extensions marketplace
2. **Open any workspace** - colors apply automatically!
3. **Customize** via VS Code settings if desired

That's it! Your workspaces are now visually distinct.

## ⚙️ Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `tinto.enable` | boolean | `true` | Enable/disable automatic workspace tinting |
| `tinto.lockColor` | string | `""` | Override color for this workspace (e.g., `#0A84FF`) |
| `tinto.saturation` | number | `70` | Color saturation percentage (0-100) |
| `tinto.lightness` | number | `50` | Color lightness percentage (0-100) |

## 🎮 Commands

Access these commands via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **`Tinto: Apply Workspace Tint`** - Manually trigger color assignment (uses locked tint if configured)
- **`Tinto: Remove Workspace Tint`** - Remove all workspace color customizations

## 💡 How It Works

Tinto uses a cryptographic hash function (FNV-1a) to convert your workspace identity — either the full path(s) of the folders or the workspace file — into a consistent hue value. This ensures:

- **Same folder name = Same color**, always
- **Different folders = Different colors**, guaranteed
- **No conflicts** between similar project names

The extension then applies accessibility-compliant foreground colors and saves everything to your workspace settings.

## 🔧 Development

### Prerequisites
- Node.js 16+
- VS Code 1.80+

### Setup
```bash
git clone https://github.com/Michael-A-Kuykendall/tinto.git
cd tinto
npm install
npm run build
```

### Testing
Press `F5` in VS Code to launch an Extension Development Host with the extension loaded.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Developer

**Michael A Kuykendall**  
📧 [michaelallenkuykendall@gmail.com](mailto:michaelallenkuykendall@gmail.com)  
🐙 [GitHub](https://github.com/Michael-A-Kuykendall)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⭐ Show Your Support

If you find this extension helpful, please:
- ⭐ Star the [GitHub repository](https://github.com/Michael-A-Kuykendall/tinto)
- 📝 Leave a review on the [VS Code Marketplace](https://marketplace.visualstudio.com/publishers/tinto)
- 🐛 Report issues or suggest features
