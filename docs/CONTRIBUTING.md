# Contributing to CodePilot

Thank you for your interest in contributing to CodePilot!

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Claude Code CLI (authenticated)
- Git

### Setup

```bash
git clone https://github.com/liangjie559567/CodePilot.git
cd CodePilot
npm install
```

### Development Workflow

```bash
# Run Next.js dev server (browser mode)
npm run dev

# Run full Electron app
node scripts/build-electron.mjs  # First time only
npm run electron:dev
```

## Project Structure

```
codepilot/
├── electron/           # Electron main process
├── src/
│   ├── app/           # Next.js pages & API routes
│   ├── components/    # React components
│   ├── lib/           # Core logic
│   ├── hooks/         # Custom hooks
│   └── types/         # TypeScript types
├── scripts/           # Build scripts
└── docs/              # Documentation
```

## Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (auto-format on save)
- **Linting**: ESLint
- **Naming**: camelCase for variables, PascalCase for components

### Run Linter

```bash
npm run lint
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Keep commits focused and atomic
- Write clear commit messages
- Follow conventional commits format

### 3. Test Your Changes

```bash
# Run tests
npm test

# Test in Electron
npm run electron:dev
```

### 4. Commit

```bash
git add .
git commit -m "feat: add new feature"
```

**Commit Message Format**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Build/tooling

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Pull Request Guidelines

### PR Title

Use conventional commit format:
```
feat: add session export feature
fix: resolve memory leak in message list
docs: update installation guide
```

### PR Description

Include:
- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How was it tested?
- **Screenshots**: If UI changes

### Example

```markdown
## What
Adds ability to export chat sessions as JSON

## Why
Users requested a way to backup their conversations

## How
- Added export button to session menu
- Implemented JSON serialization
- Added file save dialog

## Testing
- Tested export with 100+ message session
- Verified JSON structure
- Tested on Windows and macOS

## Screenshots
[screenshot here]
```

## Code Review Process

1. **Automated Checks**: CI must pass
2. **Code Review**: Maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: PR approved and merged

## Areas to Contribute

### 🐛 Bug Fixes
- Check [Issues](https://github.com/liangjie559567/CodePilot/issues)
- Look for `bug` label
- Reproduce, fix, test

### ✨ Features
- Check [Issues](https://github.com/liangjie559567/CodePilot/issues)
- Look for `enhancement` label
- Discuss approach before implementing

### 📚 Documentation
- Improve README
- Add code comments
- Write guides

### 🧪 Tests
- Add unit tests
- Add E2E tests
- Improve coverage

### 🎨 UI/UX
- Improve design
- Fix accessibility issues
- Add animations

## Development Tips

### Debugging

**Electron Main Process**:
```bash
# Add to electron/main.ts
console.log('Debug:', data)
```

**Renderer Process**:
```bash
# Open DevTools in Electron
Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (macOS)
```

**Next.js API Routes**:
```bash
# Check terminal output
console.log('API:', data)
```

### Hot Reload

- Next.js pages: Auto-reload
- Electron main: Restart app
- Components: Auto-reload

### Database

**Location**:
- Dev: `./data/codepilot.db`
- Prod: `~/.codepilot/codepilot.db`

**Inspect**:
```bash
sqlite3 data/codepilot.db
.tables
.schema sessions
SELECT * FROM sessions;
```

### Native Modules

**Issue**: Native modules fail to load

**Solution**:
1. Use dynamic imports in API routes
2. Don't import at module top level
3. Check electron-builder config

## Common Issues

### Build Fails

```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Electron Won't Start

```bash
# Rebuild Electron main
node scripts/build-electron.mjs
npm run electron:dev
```

### TypeScript Errors

```bash
# Check types
npx tsc --noEmit
```

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/liangjie559567/CodePilot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/liangjie559567/CodePilot/discussions)
- **Original Project**: [op7418/CodePilot](https://github.com/op7418/CodePilot)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
