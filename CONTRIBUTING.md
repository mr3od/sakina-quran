# Contributing to Sakina Quran

Thank you for your interest in contributing to Sakina Quran! This document provides guidelines and instructions for contributing to this project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Strategy](#branch-strategy)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Versioning](#versioning)
- [Testing](#testing)
- [AI Agent Guidelines](#ai-agent-guidelines)

---

## 📜 Code of Conduct

This project follows a simple code of conduct:

- **Be respectful**: Treat all contributors with respect and kindness
- **Be constructive**: Provide helpful feedback and suggestions
- **Be collaborative**: Work together to improve the project
- **Be patient**: Remember that everyone is learning and growing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **pnpm** (enabled via corepack)
- **Git** for version control
- **Expo CLI** (installed via npx)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sakina-quran.git
   cd sakina-quran
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/mr3od/sakina-quran.git
   ```

4. **Enable pnpm and install dependencies**:
   ```bash
   corepack enable
   corepack prepare pnpm@latest --activate
   pnpm install --frozen-lockfile
   ```

5. **Start development server**:
   ```bash
   pnpm start
   ```

---

## 🔄 Development Workflow

### Before Starting Work

**ALWAYS** fetch the latest changes from upstream before creating a new branch:

```bash
# Fetch latest changes from upstream
git fetch upstream

# Update your local development branch
git checkout development
git merge upstream/development

# Push updates to your fork
git push origin development
```

### Creating a New Branch

**CRITICAL**: Always branch from `development`, never from `main`:

```bash
# Ensure you're on development and it's up to date
git checkout development
git pull upstream development

# Create your feature branch
git checkout -b feat/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description

# Or for documentation
git checkout -b docs/what-you-are-documenting
```

### Branch Naming Convention

Use the following prefixes:

- `feat/` - New features (e.g., `feat/bookmark-system`)
- `fix/` - Bug fixes (e.g., `fix/surah-loading-error`)
- `docs/` - Documentation changes (e.g., `docs/update-readme`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)
- `refactor/` - Code refactoring (e.g., `refactor/audio-player`)
- `test/` - Adding or updating tests (e.g., `test/add-surah-tests`)
- `hotfix/` - Critical production fixes (e.g., `hotfix/crash-on-startup`)

---

## 🌳 Branch Strategy

We use a **2-branch strategy**:

### Main Branches

1. **`main`** (Production)
   - Always stable and deployable
   - Reflects what's currently in production
   - Only accepts merges from `development`
   - Protected branch - requires PR approval

2. **`development`** (Staging/Testing)
   - Integration branch for features
   - May be unstable at times
   - Accepts merges from feature branches
   - Deployed to development environment

### Merge Flow

```
feature/fix branches → development → main
```

**Exception**: `hotfix/*` branches can merge directly into `main` for critical production fixes, but must be backported to `development` immediately after.

### Protected Branch Rules

- **`main`**: Only `development` can merge (except hotfixes)
- **`development`**: Any feature/fix branch can merge
- All merges require:
  - Passing CI checks (build, version, branch flow)
  - Updated version in `app.json`
  - At least one approval (for main)

---

## 📝 Commit Guidelines

We follow **Conventional Commits** for automatic changelog generation.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `perf`: Performance improvements
- `style`: Code style changes (formatting, etc.)

### Examples

```bash
# Feature
git commit -m "feat: add bookmark functionality for surahs"

# Bug fix
git commit -m "fix: resolve audio playback issue on iOS"

# Documentation
git commit -m "docs: update installation instructions"

# Chore
git commit -m "chore: update dependencies to latest versions"

# With scope
git commit -m "feat(audio): add playback speed control"

# With body
git commit -m "fix: resolve crash on surah navigation

The app was crashing when navigating between surahs due to
improper state cleanup. This commit adds proper cleanup logic."
```

### Commit Best Practices

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Keep subject line under 72 characters
- Reference issues in footer: `Fixes #123` or `Closes #456`

---

## 🔀 Pull Request Process

### Before Creating a PR

1. **Ensure your branch is up to date**:
   ```bash
   git fetch upstream
   git rebase upstream/development
   ```

2. **Update version in `app.json`**:
   - Use the "Bump Version" GitHub Action, OR
   - Manually update `expo.version` in `app.json`
   - Version must be higher than target branch

3. **Test your changes**:
   ```bash
   # Test web build
   npx expo export --platform web
   
   # Test on device/simulator
   pnpm start
   ```

4. **Ensure code quality**:
   ```bash
   # Run linter
   pnpm lint
   ```

### Creating the PR

1. **Push your branch**:
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create PR on GitHub**:
   - Target: `development` branch (NOT `main`)
   - Use the PR template
   - Provide clear description of changes
   - Link related issues

3. **PR Title Format**:
   ```
   feat: add bookmark functionality
   fix: resolve audio playback issue
   docs: update contributing guidelines
   ```

### PR Checklist

- [ ] Branch is up to date with `development`
- [ ] Version in `app.json` has been bumped
- [ ] Code follows project conventions
- [ ] Commits follow conventional commit format
- [ ] Changes have been tested locally
- [ ] Documentation has been updated (if needed)
- [ ] No merge conflicts

### After PR Creation

- **CI Checks**: Wait for automated checks to pass
  - Build check (Expo web export)
  - Version check (app.json updated)
  - Branch flow check (correct merge pattern)

- **Code Review**: Address any feedback from reviewers

- **Approval**: Wait for approval before merging

---

## 🔢 Versioning

We use **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`

### Version Bumping

**Option 1: GitHub Actions (Recommended)**

1. Go to Actions → "Bump Version"
2. Select your branch
3. Choose bump type:
   - `patch`: Bug fixes (1.0.0 → 1.0.1)
   - `minor`: New features (1.0.0 → 1.1.0)
   - `major`: Breaking changes (1.0.0 → 2.0.0)

**Option 2: Manual**

Edit `app.json`:
```json
{
  "expo": {
    "version": "1.1.0"
  }
}
```

Then commit:
```bash
git add app.json
git commit -m "chore: bump version to 1.1.0"
```

### When to Bump

- **Patch** (0.0.X): Bug fixes, small improvements
- **Minor** (0.X.0): New features, non-breaking changes
- **Major** (X.0.0): Breaking changes, major rewrites

### Version Requirements

- PRs to `development`: Must bump version
- PRs to `main`: Version already bumped in development
- Hotfixes: Bump patch version

---

## 🧪 Testing

### Manual Testing

Before submitting a PR, test your changes:

```bash
# Web
npx expo export --platform web
# Then check ./dist folder

# iOS Simulator
pnpm ios

# Android Emulator
pnpm android

# Development server
pnpm start
```

### Build Testing

Ensure the build succeeds:

```bash
# This is what CI runs
npx expo export --platform web
```

---

## 🤖 AI Agent Guidelines

If you're using an AI coding assistant (Claude, Cursor, GitHub Copilot, etc.), provide it with these instructions:

### System Prompt for AI Agents

```markdown
You are contributing to Sakina Quran, an Expo-based Quran application.

CRITICAL RULES:
1. ALWAYS branch from 'development', NEVER from 'main'
2. ALWAYS fetch latest changes before creating a branch:
   git fetch upstream && git checkout development && git merge upstream/development
3. ALWAYS use conventional commits (feat:, fix:, docs:, etc.)
4. ALWAYS bump version in app.json (expo.version) before creating PR
5. NEVER merge directly to main - only development accepts feature PRs

BRANCH NAMING:
- feat/feature-name (new features)
- fix/bug-description (bug fixes)
- docs/what-documenting (documentation)
- chore/task-description (maintenance)

COMMIT FORMAT:
type(scope): subject

Examples:
- feat: add bookmark functionality
- fix: resolve audio playback issue
- docs: update README with new features

VERSION BUMPING:
- Edit app.json → expo.version
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Commit: "chore: bump version to X.Y.Z"

BEFORE CREATING PR:
1. Fetch and rebase: git fetch upstream && git rebase upstream/development
2. Bump version in app.json
3. Test build: npx expo export --platform web
4. Run linter: pnpm lint
5. Create PR targeting 'development' branch

WORKFLOW:
1. Fetch latest development
2. Create feature branch from development
3. Make changes with conventional commits
4. Bump version
5. Test locally
6. Push and create PR to development
7. Wait for CI checks and approval
8. Merge to development
9. Development will be promoted to main when ready

NEVER:
- Branch from main
- Merge to main directly
- Skip version bumping
- Use non-conventional commits
- Push without testing
```

### AI Agent Steering File

For AI agents that support steering files (like Cursor or Kiro), create `.kiro/steering/sakina-rules.md`:

```markdown
---
inclusion: always
---

# Sakina Quran Development Rules

## Branch Strategy
- ALWAYS branch from `development`
- NEVER branch from `main`
- Fetch latest before branching: `git fetch upstream && git checkout development && git merge upstream/development`

## Commit Format
Use conventional commits:
- feat: new features
- fix: bug fixes
- docs: documentation
- chore: maintenance

## Version Management
- Version is in `app.json` → `expo.version`
- Bump before every PR
- Use semantic versioning

## PR Target
- Feature/fix branches → `development`
- Only `development` → `main`
- Hotfixes can go to `main` (exception)

## Testing
- Run `npx expo export --platform web` before PR
- Run `pnpm lint` to check code style
```

---

## 🐛 Reporting Issues

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check if it's already fixed** in development branch
3. **Gather information**:
   - Device/OS version
   - App version
   - Steps to reproduce
   - Expected vs actual behavior

### Creating an Issue

Use the appropriate issue template:

- **Bug Report**: For reporting bugs
- **Feature Request**: For suggesting new features
- **Documentation**: For documentation improvements

---

## 💡 Feature Requests

We welcome feature suggestions! When requesting a feature:

1. **Check existing requests** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** (optional but helpful)
4. **Consider the scope**: Is it aligned with project goals?

---

## 📞 Getting Help

- **Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Discord/Slack**: [If applicable - add link]

---

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- README acknowledgments

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Sakina Quran! 💙**

*Last updated: 2025-12-27*
