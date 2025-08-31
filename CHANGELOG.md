# Change Log

All notable changes to the "Workspace Tint" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-31

### Initial Release

#### Added
- Automatic deterministic color assignment based on workspace folder name
- Support for title bar, activity bar, and status bar customization
- Accessible foreground color selection using YIQ luminance calculation
- Workspace-scoped color persistence via `.vscode/settings.json`
- User configuration options for saturation and lightness
- Color lock override functionality per workspace
- Commands for manual color assignment and clearing
- Multi-root workspace support (uses first folder for hashing)
- Remote development compatibility (SSH, WSL, Containers)
- Performance-optimized activation on startup finished
- Comprehensive error handling and user feedback
- MIT license for open source usage

#### Technical Features
- FNV-1a hash algorithm for consistent color generation
- HSL to RGB color space conversion
- VS Code API integration with proper lifecycle management
- TypeScript implementation with strict type checking
- Professional packaging and marketplace presentation
