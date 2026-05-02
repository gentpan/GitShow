<p align="center">
  <img src="public/android-chrome-192x192.png" alt="GitShow logo" width="96" height="96">
</p>

<h1 align="center">GitShow</h1>

<p align="center">
  A self-hosted personal GitHub homepage for showcasing your profile, projects, contributions, and activity.
</p>

<p align="center">
  <a href="https://github.com/gentpan/GitShow/releases"><img src="https://img.shields.io/github/v/release/gentpan/GitShow?style=flat-square" alt="Release"></a>
  <a href="https://github.com/gentpan/GitShow/blob/main/go.mod"><img src="https://img.shields.io/badge/Go-1.25-00ADD8?style=flat-square&logo=go&logoColor=white" alt="Go"></a>
  <a href="https://nuxt.com"><img src="https://img.shields.io/badge/Nuxt-3-00DC82?style=flat-square&logo=nuxt&logoColor=white" alt="Nuxt"></a>
  <a href="https://www.docker.com"><img src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
  <a href="https://github.com/gentpan/GitShow/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-black?style=flat-square" alt="License"></a>
</p>

GitShow is a self-hosted GitHub profile dashboard that turns your GitHub account into a clean personal homepage, project showcase, activity board, and lightweight admin panel.

It is designed for simple deployment: the Nuxt frontend is generated as static assets and embedded into a single Go service. One container, one process, one public port.

## Features

- Personal GitHub profile hero with avatar, bio, location, social links, and stats
- Contribution heatmap, daily activity chart, recent activity, and star history
- Project showcase controlled from the admin panel
- Following page with followed users, recent repositories, and recent activity
- Admin settings for title, GitHub account, token, social links, homepage projects, and password
- Multiple Passkey support for passwordless admin login, with device notes
- Favicon and site manifest support from the `public/` directory
- Docker Compose deployment with a single `app` service

## Tech Stack

- Go HTTP service for API, cache refresh, settings, Passkey/WebAuthn, and static hosting
- Nuxt 3 SPA generated as static files
- Tailwind CSS for the interface
- GitHub REST API and GraphQL API for repository, activity, and contribution data
- `github.com/go-webauthn/webauthn` for Passkey support

## Deployment

GitShow is deployed as one Go service. The Nuxt frontend is generated first, then embedded into the Go binary at build time.

### Option 1: Docker Compose

Docker Compose is the recommended deployment path.

1. Clone the repository:

```bash
git clone https://github.com/gentpan/GitShow.git
cd GitShow
```

2. Prepare runtime files:

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

3. Optionally use `.env` for the GitHub token:

```bash
cp .env.example .env
# then edit .env
GITHUB_TOKEN=ghp_your_token
```

The token should be able to read public GitHub data. For private deployments that need more account context, use a personal access token with the appropriate GitHub scopes.

4. Start the app:

```bash
docker compose up -d --build
```

5. Open the site:

```text
http://localhost:3000
```

The Compose file mounts these runtime files into the container:

- `config.json`
- `settings.json`
- `star-history.json`

### Option 2: Single Binary

Use this when you want to deploy without Docker.

```bash
cp config.json.example config.json
cp settings.json.example settings.json
npm ci
NUXT_PUBLIC_API_BASE= npm run generate
go build -o gitshow .
PORT=3000 GITHUB_TOKEN=ghp_your_token ./gitshow
```

The generated `gitshow` binary embeds `.output/public`, so deployment only needs the binary plus runtime files such as `config.json`, `settings.json`, and `star-history.json`.

### Option 3: Local Helper Script

For local testing, use:

```bash
./start.sh
```

The script installs frontend dependencies when needed, generates the Nuxt static output, builds the Go binary, and starts the single service on port `3000`.

### Reverse Proxy Notes

For a public domain, put GitShow behind a reverse proxy such as Caddy, Nginx, or Traefik and forward traffic to port `3000`.

Passkeys require a secure browser context. They work on `localhost` for development and require HTTPS on a public domain.

## Admin

Open the footer login button and sign in with the admin password. After login, the navigation adds the `管理` menu item and the footer login icon becomes a red logout button.

From `/admin`, you can:

- change the site title
- configure the GitHub profile URL and token
- select which repositories are shown on the homepage and projects page
- edit social links
- set or clear the admin password
- register multiple Passkeys, edit Passkey notes, delete one Passkey, or clear all Passkeys
- refresh cached GitHub data

Passkeys work on `localhost` during local development and require HTTPS on a public domain. They are bound to the current domain, so separate root domains need separate Passkeys.

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
- `node_modules/`
- `.nuxt/`
- `.output/`
- `dist`
- `gitshow`
- `.claude/`

## License

MIT
