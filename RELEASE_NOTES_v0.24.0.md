# CodePilot v0.24.0

**Release Date**: 2026-03-05

A desktop GUI client for Claude Code - chat, code, and manage projects through a polished visual interface.

---

## 🎉 Highlights

This release focuses on **build system stability** and **cross-platform compatibility**, ensuring CodePilot can be built and distributed reliably across Windows, macOS, and Linux.

### ✅ What's New

- **Multi-platform CI/CD**: Automated builds for Windows, macOS (x64 + arm64), and Linux (x64 + arm64)
- **Improved TypeScript strictness**: Fixed 15+ type errors for better code quality
- **Native module handling**: Proper isolation of native modules (tree-sitter, onnxruntime-node) from Next.js build
- **Unsigned macOS builds**: Support for building without code signing certificate

---

## 📦 Downloads

### Windows
- **CodePilot.Setup.0.24.0.exe** - NSIS installer (x64 + arm64)

### macOS (Unsigned)
- **CodePilot-0.24.0-arm64.dmg** - Apple Silicon
- **CodePilot-0.24.0-x64.dmg** - Intel
- **CodePilot-0.24.0-arm64.zip** - Apple Silicon (portable)
- **CodePilot-0.24.0-x64.zip** - Intel (portable)

### Linux
**x64:**
- CodePilot-0.24.0-x86_64.AppImage
- CodePilot-0.24.0-amd64.deb
- CodePilot-0.24.0-x86_64.rpm

**arm64:**
- CodePilot-0.24.0-arm64.AppImage
- CodePilot-0.24.0-arm64.deb
- CodePilot-0.24.0-aarch64.rpm

---

## 🔧 Installation

### macOS Security Notice

macOS will show a security warning since the app is not code-signed. To open:

**Option 1**: Right-click → Open → Open
**Option 2**: System Settings → Privacy & Security → Open Anyway
**Option 3**: Run `xattr -cr /Applications/CodePilot.app`

### Windows Security Notice

Windows SmartScreen will block the installer. Click "More info" → "Run anyway".

---

## 🛠️ Technical Improvements

### Build System
- **Native module isolation**: Dynamic imports prevent tree-sitter/onnxruntime-node from loading during Next.js static analysis
- **Electron builder optimization**: Disabled native module rebuild (`npmRebuild: false`) to avoid compilation errors
- **macOS unsigned builds**: Conditional CI steps support building without code signing certificate
- **esbuild externalization**: Native modules properly externalized to avoid bundling `.node` files

### TypeScript Fixes
- Fixed Claude SDK type constraints (literal union types for `media_type`)
- Added type guards for content block filtering
- Fixed import/export issues in inference and parser modules
- Updated TypeScript target to ES2020 for BigInt support
- Added proper type assertions for embedding vectors and file extensions

### Dependencies
- Next.js 16.1.6
- React 19.2.3
- Electron 40.7.0
- TypeScript 5.x with strict mode

---

## 📝 Changelog

### Fixed
- CI/CD build failures across all platforms
- TypeScript compilation errors (15+ fixes)
- Native module loading during Next.js build
- macOS build without signing certificate
- Claude SDK type compatibility issues
- Tree-sitter compilation errors in Electron
- ONNX runtime bundling issues

### Changed
- Improved error handling in code intelligence API
- Better type safety throughout codebase
- Optimized build configuration for faster CI/CD

---

## 🔗 Links

- **Repository**: https://github.com/liangjie559567/CodePilot
- **Issues**: https://github.com/liangjie559567/CodePilot/issues
- **Original Project**: https://github.com/op7418/CodePilot

---

## 📋 Requirements

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js | 18+ |
| Claude Code CLI | Latest (authenticated) |
| npm | 9+ |

**Important**: Run `claude login` before launching CodePilot.

---

## 🙏 Acknowledgments

This release is based on the original [CodePilot](https://github.com/op7418/CodePilot) project by [@op7418](https://github.com/op7418).

---

**Full Changelog**: https://github.com/liangjie559567/CodePilot/commits/v0.24.0
