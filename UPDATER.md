# Auto-Updater

This app uses [Tauri Updater](https://v2.tauri.app/plugin/updater/) to deliver automatic updates via GitHub Releases.

The release repo is **private**, so the updater authenticates every request (both the `latest.json` check and the installer download) with a GitHub token baked in at build time.

## How it works

1. On launch, the app checks `latest.json` from the GitHub releases endpoint
2. If a newer version is available, the user is prompted to update
3. The update is downloaded and installed silently in the background

## Private repo token

The updater sends `Authorization: Bearer <token>` on every request. The token is embedded into the binary at compile time from the `TAURI_UPDATER_GITHUB_TOKEN` build env var.

### 1. Create a token

- GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token
- Repository access: **Only select repositories** → `yu-gi-oh-card-maker`
- Repository permissions → **Contents**: **Read-only**
- Copy the `github_pat_...` value

### 2. Set the env var

Local builds pick it up automatically from a git-ignored file (repo root):

```bash
# .env.local (NOT committed)
TAURI_UPDATER_GITHUB_TOKEN=github_pat_...
```

Or export it directly before building:

```powershell
# PowerShell
$env:TAURI_UPDATER_GITHUB_TOKEN = "github_pat_..."
```

```bash
# bash / zsh
export TAURI_UPDATER_GITHUB_TOKEN="github_pat_..."
```

If the variable is unset or empty, the updater runs unauthenticated (e.g. for a public repo).

### 3. CI/CD (GitHub Actions)

The release workflow already forwards `TAURI_UPDATER_GITHUB_TOKEN`. Add it as a repository secret (`Settings > Secrets and variables > Actions`):

- `TAURI_UPDATER_GITHUB_TOKEN` — the fine-grained token

> Note: a token baked into a client binary can be extracted by anyone who has the app. Only give it read access to this one repo.

## Configuration

The updater is configured in `src-tauri/tauri.conf.json`:

```json
"plugins": {
  "updater": {
    "windows": {
      "installMode": "passive"
    },
    "pubkey": "<your-public-key>",
    "endpoints": [
      "https://github.com/akiibajin/yu-gi-oh-home/releases/latest/download/latest.json"
    ]
  }
}
```

### Install modes

- **`passive`**: Shows a progress dialog, user can cancel (recommended for Windows)
- **`basicUI`**: Minimal UI installer
- **`silent`**: No UI at all

## Publishing an update

1. Bump the version in `src-tauri/tauri.conf.json` and `package.json`
2. Create a Git tag: `git tag v<version>`
3. Push with tags: `git push --tags`
4. The GitHub Action (`.github/workflows/`) builds and uploads `latest.json` + installers to the release

## Signing updates (optional)

If you enable `createUpdaterArtifacts: true` in `tauri.conf.json`, updates must be signed.

### Generate a keypair

```bash
npx tauri signer generate -w ~/.tauri/yu-gi-oh-home.key
```

This creates:
- `~/.tauri/yu-gi-oh-home.key` — private key (keep secret)
- Public key is printed to stdout — add it to `tauri.conf.json` under `plugins.updater.pubkey`

### Set environment variables before building

```bash
# PowerShell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content ~/.tauri/yu-gi-oh-home.key
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""  # if you set one during generation

pnpm tauri build
```

```bash
# bash / zsh
export TAURI_SIGNING_PRIVATE_KEY=$(cat ~/.tauri/yu-gi-oh-home.key)
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""

pnpm tauri build
```

### CI/CD (GitHub Actions)

Add these secrets to your repository settings (`Settings > Secrets > Actions`):

- `TAURI_SIGNING_PRIVATE_KEY` — contents of the private key file
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — password (empty string if none)

## Disabling the updater

Set `createUpdaterArtifacts` to `false` in `tauri.conf.json`:

```json
"bundle": {
  "createUpdaterArtifacts": false
}
```

This skips generating `.sig` files and `latest.json`, so no signing key is needed.
