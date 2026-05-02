# GitShow

GitShow is a self-hosted GitHub profile dashboard that turns your GitHub account into a clean personal homepage, project showcase, activity board, and lightweight admin panel.

It is designed for simple deployment: the Nuxt frontend is generated as static assets and embedded into a single Go service. One container, one process, one public port.

## Features

- Personal GitHub profile hero with avatar, bio, location, social links, and stats
- Contribution heatmap, daily activity chart, recent activity, and star history
- Project showcase controlled from the admin panel
- Following page with followed users, recent repositories, and recent activity
- Admin settings for title, GitHub account, token, social links, homepage projects, and password
- Passkey support for passwordless admin login
- Favicon and site manifest support from the `public/` directory
- Docker Compose deployment with a single `app` service

## Tech Stack

- Go HTTP service for API, cache refresh, settings, Passkey/WebAuthn, and static hosting
- Nuxt 3 SPA generated as static files
- Tailwind CSS for the interface
- GitHub REST API and GraphQL API for repository, activity, and contribution data
- `github.com/go-webauthn/webauthn` for Passkey support

## Quick Start

### 1. Prepare Config

Copy the examples:

```bash
cp config.json.example config.json
cp settings.json.example settings.json
```

Edit `config.json`:

```json
{
  "username": "your-github-username",
  "token": "ghp_your_token",
  "following": ["antfu", "yyx990803", "torvalds"]
}
```

You can also provide the token through `.env`:

```bash
GITHUB_TOKEN=ghp_your_token
```

The token should be able to read public GitHub data. For private deployments that need more account context, use a personal access token with the appropriate GitHub scopes.

### 2. Run With Docker

```bash
docker compose up -d --build
```

Open:

```text
http://localhost:3000
```

### 3. Local Development Run

```bash
./start.sh
```

The script installs frontend dependencies when needed, generates the Nuxt static output, builds the Go binary, and starts the single service on port `3000`.

## Manual Build

```bash
NUXT_PUBLIC_API_BASE= npm run generate
go build -o gitshow .
PORT=3000 ./gitshow
```

The generated `gitshow` binary embeds `.output/public`, so deployment only needs the binary plus runtime files such as `config.json`, `settings.json`, and `star-history.json`.

## Admin

Open the footer login button and sign in with the admin password. After login, the navigation adds the `管理` menu item and the footer login icon becomes a red logout button.

From `/admin`, you can:

- change the site title
- configure the GitHub profile URL and token
- select which repositories are shown on the homepage and projects page
- edit social links
- set or clear the admin password
- register or clear a Passkey
- refresh cached GitHub data

Passkeys work on `localhost` during local development and require HTTPS on a public domain.

## Project Visibility

The projects page follows the admin project toggles exactly:

- enabled repositories are shown
- disabled repositories are hidden
- the display order follows the saved admin selection

If no repositories are enabled, the projects page shows an empty-state message.

## Directory Structure

```text
GitShow/
├── main.go                # Go API, cache, Passkey, and embedded static server
├── Dockerfile             # Multi-stage build: Nuxt static output + Go binary
├── docker-compose.yml     # Single app service
├── go.mod                 # Go dependencies
├── package.json           # Nuxt build scripts and frontend dependencies
├── app.vue                # Nuxt app entry
├── pages/                 # Nuxt pages
├── components/            # Vue components
├── composables/           # API, theme, auth, and Passkey helpers
├── layouts/               # Site layout and footer/header
├── assets/                # Global CSS
├── public/                # favicon, webmanifest, and static public assets
├── config.json.example    # Example runtime GitHub config
├── settings.json.example  # Example runtime site settings
└── start.sh               # Local build-and-run helper
```

## Runtime Files

These files are intentionally ignored by git because they can contain secrets or machine-local data:

- `config.json`
- `settings.json`
- `.env`
- `star-history.json`
- `.output/`
- `dist`
- `gitshow`

## License

MIT
