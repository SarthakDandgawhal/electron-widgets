# GitHub Actions Workflows

This directory contains CI/CD workflows for building and releasing Win11 Widgets.

## Workflows

### 1. `build.yml` - Main Build Pipeline
**Triggers:** Push to main, PR to main, tags (v*), manual dispatch

**Platforms:** Windows (NSIS + Portable), macOS (DMG), Linux (AppImage)

**Artifacts:** Uploaded as GitHub Actions artifacts (30-day retention)

**Releases:** Auto-creates GitHub Release on tag push with all platform binaries

### 2. `release.yml` - Manual Release Trigger
**Triggers:** Manual workflow dispatch with version input

**Usage:**
1. Go to Actions → Release Win11 Widgets → Run workflow
2. Enter version (e.g., `1.0.0`)
3. Choose platforms (Windows only / All platforms)
4. Creates git tag and waits for build completion

## How to Get the .EXE

### Option 1: Automatic Release (Recommended)
```bash
# Push a version tag
git tag v1.0.0
git push origin v1.0.0
```
This triggers the build workflow which:
1. Builds on Windows, macOS, and Linux
2. Creates a GitHub Release with all binaries
3. Download the `.exe` from the Release page

### Option 2: Manual Build
1. Go to **Actions** tab in GitHub
2. Select **Build Win11 Widgets** workflow
3. Click **Run workflow** → Select branch → Run
4. After completion, click the workflow run
5. Download `win11-widgets-windows` artifact (contains `.exe`)

### Option 3: Manual Release with Version
1. Go to **Actions** → **Release Win11 Widgets**
2. Click **Run workflow**
3. Enter version (e.g., `1.2.0`)
3. Select platforms
4. Creates tag, builds, and publishes release

## Artifact Locations

| Platform | Artifact Name | Files |
|----------|---------------|-------|
| Windows | `win11-widgets-windows` | `Win11 Widgets-1.0.0-x64.exe`, `Win11 Widgets-1.0.0-portable.exe` |
| macOS | `win11-widgets-macos` | `Win11 Widgets-1.0.0.dmg` |
| Linux | `win11-widgets-linux` | `Win11 Widgets-1.0.0.AppImage` |

## Required Secrets

No additional secrets needed - uses built-in `GITHUB_TOKEN`.

For auto-updater (optional):
- `GH_TOKEN` - Personal access token with `repo` scope (for private repos)

## Build Time Estimates

| Platform | Time |
|----------|------|
| Windows | ~5-8 min |
| macOS | ~8-12 min |
| Linux | ~5-8 min |
| **Total (parallel)** | **~8-12 min** |

## Troubleshooting

### Build Fails on Windows
- Check Node.js version compatibility (needs 18+)
- Verify `electron-builder` can find Windows SDK

### Build Fails on macOS
- Ensure code signing identity available (for distribution)
- For local builds: `export CSC_IDENTITY_AUTO_DISCOVERY=false`

### Build Fails on Linux
- Install dependencies: `libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf`

### Artifact Not Found
- Check workflow logs for `electron-builder` output
- Verify `release/` directory contains built files
- Check `package.json` build config matches expected output

## Customization

### Change Version Source
Edit `package.json` version field, or use `npm version patch|minor|major`

### Add Code Signing (Windows)
```yaml
# In build.yml, add to build-windows job:
env:
  CSC_LINK: ${{ secrets.WINDOWS_CERT_BASE64 }}
  CSC_KEY_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
  WIN_CSC_LINK: ${{ secrets.WINDOWS_CERT_BASE64 }}
  WIN_CSC_KEY_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
```

### Add Code Signing (macOS)
```yaml
env:
  CSC_LINK: ${{ secrets.MACOS_CERT_BASE64 }}
  CSC_KEY_PASSWORD: ${{ secrets.MACOS_CERT_PASSWORD }}
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_ID_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
  APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```