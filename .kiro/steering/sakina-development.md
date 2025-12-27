---
inclusion: always
---

# Sakina Quran - Development Guidelines for AI Agents

This steering file provides critical rules and guidelines for AI agents contributing to Sakina Quran.

---

## 🚨 CRITICAL RULES (NEVER VIOLATE)

### 1. Branch Strategy
- **ALWAYS** branch from `development`, **NEVER** from `main`
- **ALWAYS** fetch latest changes before creating a new branch
- **NEVER** merge feature branches directly to `main`

### 2. Before Starting Any Work

```bash
# MANDATORY: Run these commands before creating a new branch
git fetch upstream
git checkout development
git merge upstream/development
git push origin development

# Then create your feature branch
git checkout -b feat/your-feature-name
```

### 3. Version Management
- Version is stored in `app.json` → `expo.version`
- **ALWAYS** bump version before creating a PR
- Use semantic versioning: `MAJOR.MINOR.PATCH`
- Commit version bump: `chore: bump version to X.Y.Z`

### 4. Commit Format
- **ALWAYS** use conventional commits
- Format: `type(scope): subject`
- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `style`

---

## 📋 Standard Workflow

### Step 1: Fetch Latest Changes

```bash
git fetch upstream
git checkout development
git merge upstream/development
```

### Step 2: Create Feature Branch

```bash
# Branch naming convention
git checkout -b feat/feature-name      # New features
git checkout -b fix/bug-description    # Bug fixes
git checkout -b docs/what-documenting  # Documentation
git checkout -b chore/task-description # Maintenance
```

### Step 3: Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Keep commits atomic and focused

### Step 4: Commit Changes

```bash
# Use conventional commits
git add .
git commit -m "feat: add bookmark functionality"
git commit -m "fix: resolve audio playback issue"
git commit -m "docs: update README with new features"
```

### Step 5: Bump Version

**Option A: Using GitHub Actions**
1. Go to Actions → "Bump Version"
2. Select your branch
3. Choose bump type (patch/minor/major)

**Option B: Manual**
```bash
# Edit app.json
# Change "version": "1.0.0" to "version": "1.1.0"

git add app.json
git commit -m "chore: bump version to 1.1.0"
```

### Step 6: Test Locally

```bash
# Test web build (this is what CI runs)
npx expo export --platform web

# Run linter
pnpm lint

# Test on device/simulator
pnpm start
```

### Step 7: Push and Create PR

```bash
# Push your branch
git push origin feat/your-feature-name

# Create PR on GitHub targeting 'development' branch
```

---

## 🌳 Branch Flow Rules

### Allowed Merges

✅ **Any branch → development**
- Feature branches
- Fix branches
- Documentation branches
- Chore branches

✅ **development → main**
- Only when ready for production
- Requires approval
- All CI checks must pass

✅ **hotfix/* → main** (Exception)
- Critical production fixes only
- Must be backported to development immediately

### Forbidden Merges

❌ **feature/fix branches → main**
- Always go through development first

❌ **main → development**
- Development should be ahead of main

---

## 🔢 Versioning Guidelines

### Semantic Versioning

- **MAJOR** (X.0.0): Breaking changes, major rewrites
- **MINOR** (0.X.0): New features, non-breaking changes
- **PATCH** (0.0.X): Bug fixes, small improvements

### When to Bump

- **Patch**: Bug fixes, typos, small improvements
- **Minor**: New features, new components, enhancements
- **Major**: Breaking API changes, major refactors

### Examples

```
1.0.0 → 1.0.1  (fix: resolve crash on startup)
1.0.1 → 1.1.0  (feat: add bookmark functionality)
1.1.0 → 2.0.0  (feat!: redesign navigation system - breaking change)
```

---

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `chore`: Maintenance (deps, config, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `perf`: Performance improvements
- `style`: Code style changes (formatting)

### Examples

```bash
# Simple feature
git commit -m "feat: add bookmark functionality"

# Bug fix with scope
git commit -m "fix(audio): resolve playback issue on iOS"

# Documentation
git commit -m "docs: update installation instructions"

# Chore
git commit -m "chore: update dependencies to latest versions"

# With body and footer
git commit -m "fix: resolve crash on surah navigation

The app was crashing when navigating between surahs due to
improper state cleanup. This commit adds proper cleanup logic
in the useEffect hook.

Fixes #123"
```

### Commit Best Practices

- Use present tense: "add feature" not "added feature"
- Use imperative mood: "move cursor to..." not "moves cursor to..."
- Keep subject line under 72 characters
- Separate subject from body with blank line
- Reference issues in footer: `Fixes #123`, `Closes #456`

---

## 🧪 Testing Requirements

### Before Creating PR

1. **Build Test**:
   ```bash
   npx expo export --platform web
   ```
   This must succeed without errors.

2. **Lint Check**:
   ```bash
   pnpm lint
   ```
   Fix any linting errors.

3. **Manual Testing**:
   - Test on web: `pnpm start` → press `w`
   - Test on iOS: `pnpm ios` (if on Mac)
   - Test on Android: `pnpm android`

### CI Checks

Your PR will automatically run:
- **Build Check**: Validates Expo web build
- **Version Check**: Ensures version was bumped
- **Branch Flow Check**: Validates merge pattern

All checks must pass before merging.

---

## 🚫 Common Mistakes to Avoid

### ❌ Branching from main

```bash
# WRONG
git checkout main
git checkout -b feat/new-feature

# CORRECT
git checkout development
git pull upstream development
git checkout -b feat/new-feature
```

### ❌ Forgetting to bump version

```bash
# WRONG
git commit -m "feat: add new feature"
# Create PR without bumping version

# CORRECT
git commit -m "feat: add new feature"
# Edit app.json to bump version
git add app.json
git commit -m "chore: bump version to 1.1.0"
# Now create PR
```

### ❌ Non-conventional commits

```bash
# WRONG
git commit -m "added new feature"
git commit -m "Fixed bug"
git commit -m "updates"

# CORRECT
git commit -m "feat: add bookmark functionality"
git commit -m "fix: resolve audio playback issue"
git commit -m "chore: update dependencies"
```

### ❌ Creating PR to main

```bash
# WRONG
Create PR: feat/new-feature → main

# CORRECT
Create PR: feat/new-feature → development
```

---

## 🔄 Keeping Your Branch Updated

### Rebase on Development

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch on latest development
git checkout feat/your-feature
git rebase upstream/development

# If conflicts, resolve them and continue
git add .
git rebase --continue

# Force push (since history changed)
git push origin feat/your-feature --force-with-lease
```

### Merge Development into Your Branch

```bash
# Alternative to rebase (creates merge commit)
git checkout feat/your-feature
git fetch upstream
git merge upstream/development

# Resolve conflicts if any
git add .
git commit -m "chore: merge latest development"

# Push
git push origin feat/your-feature
```

---

## 🎯 PR Checklist

Before creating a PR, ensure:

- [ ] Branch is created from `development`
- [ ] Branch is up to date with latest `development`
- [ ] Version in `app.json` has been bumped
- [ ] All commits follow conventional commit format
- [ ] Code has been tested locally
- [ ] Build succeeds: `npx expo export --platform web`
- [ ] Linter passes: `pnpm lint`
- [ ] PR targets `development` branch (not `main`)
- [ ] PR description is clear and complete
- [ ] Related issues are linked

---

## 🚨 Hotfix Process

For critical production bugs:

```bash
# 1. Branch from main (exception to the rule)
git checkout main
git pull upstream main
git checkout -b hotfix/critical-bug-fix

# 2. Fix the bug
# Make your changes

# 3. Bump patch version
# Edit app.json: 1.0.0 → 1.0.1

# 4. Commit
git add .
git commit -m "fix: resolve critical crash on startup"
git add app.json
git commit -m "chore: bump version to 1.0.1"

# 5. Push and create PR to main
git push origin hotfix/critical-bug-fix
# Create PR targeting 'main'

# 6. After merge, backport to development
git checkout development
git pull upstream development
git cherry-pick <hotfix-commit-hash>
git push origin development
```

---

## 📚 Project Structure

```
sakina-quran/
├── .github/
│   ├── workflows/          # CI/CD workflows
│   ├── ISSUE_TEMPLATE/     # Issue templates
│   └── pull_request_template.md
├── .kiro/
│   └── steering/           # AI agent guidelines
├── src/                    # Source code
├── assets/                 # Images, fonts, etc.
├── app.json               # Expo config (includes version)
├── package.json           # Dependencies
├── CONTRIBUTING.md        # Contribution guidelines
└── README.md             # Project documentation
```

---

## 🤖 AI Agent Specific Notes

### When Generating Code

- Follow existing code patterns in the project
- Use TypeScript for type safety
- Keep components small and focused
- Use React hooks appropriately
- Follow React Native best practices

### When Modifying Files

- Preserve existing code style
- Don't remove comments unless they're outdated
- Update related documentation
- Consider backward compatibility

### When Creating PRs

- Write clear, descriptive PR titles
- Explain what changed and why
- Link related issues
- Add screenshots for UI changes
- Fill out the PR template completely

---

## 📞 Getting Help

If you're unsure about something:

1. Check `CONTRIBUTING.md` for detailed guidelines
2. Look at recent PRs for examples
3. Ask in the issue or discussion
4. Reference this steering file

---

## 🎯 Success Criteria

A good contribution:

✅ Follows branch strategy (from development)
✅ Uses conventional commits
✅ Bumps version appropriately
✅ Passes all CI checks
✅ Is well-tested locally
✅ Has clear documentation
✅ Solves a real problem
✅ Maintains code quality

---

**Remember**: Quality over speed. Take time to do it right the first time.

*Last updated: 2025-12-27*
