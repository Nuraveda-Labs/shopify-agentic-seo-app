<h1 align="center">Shopify Agentic SEO App</h1>

<p align="center">
  An open framework for building an <b>agentic SEO app for Shopify</b> — automated
  audits, structured-data (JSON-LD) automation, and AI-answer-engine readiness,<br/>
  built on React Router 7 + the Shopify App platform.
</p>

<p align="center">
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge&labelColor=0a0a0f"></a>
  <img alt="Node" src="https://img.shields.io/badge/node-%E2%89%A520.19-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=0a0a0f">
  <img alt="Shopify API 2026-07" src="https://img.shields.io/badge/Shopify%20API-2026--07-96BF48?style=for-the-badge&logo=shopify&logoColor=white&labelColor=0a0a0f">
  <a href="https://meshpilot.app"><img alt="Mesh Pilot" src="https://img.shields.io/badge/Mesh_Pilot-OSS-7c3aed?style=for-the-badge&labelColor=0a0a0f"></a>
</p>

---

> Part of **[Mesh Pilot](https://meshpilot.app)** — the open agent mesh from **[Nuraveda Lab](https://nuraveda.com)**. This is the Shopify-app half of the SEO agent: a production-grade embedded app you can fork, deploy, and extend.

## What it does

- **Audit.** One-click pass/fail checklist across structured data, breadcrumbs, canonical tags, and `og:image` — run against the live storefront.
- **Schema coverage.** Product JSON-LD with `category`, `material`, and `additionalProperty`. `FAQPage` and `BreadcrumbList` wired into the theme via App Embed blocks.
- **AI-search ready.** Generates `llms.txt` and rewrites product copy into a format that both traditional search and AI answer engines can cite.
- **Merchant-safe.** GDPR privacy webhooks, offline-token session storage, and Polaris-native embedded admin — App-Store-submission ready.

## Stack

| Layer        | Tech                                                       |
|--------------|------------------------------------------------------------|
| Framework    | [React Router 7](https://reactrouter.com) (SSR, file routes) |
| Shopify      | [`@shopify/shopify-app-react-router`](https://www.npmjs.com/package/@shopify/shopify-app-react-router), App Bridge v4, Polaris v12 |
| Data         | Prisma 6 + PostgreSQL ([`@shopify/shopify-app-session-storage-prisma`](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-prisma)) |
| Extensions   | Theme app extensions (JSON-LD blocks), checkout UI extensions |
| Runtime      | Node ≥ 20.19, pnpm 10                                      |

## Getting started

### Prerequisites

- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/getting-started) and a Shopify Partner account
- Node ≥ 20.19, pnpm ≥ 10
- PostgreSQL 14+ (local or hosted)

### Install

```bash
pnpm install
cp .env.example .env          # fill in your Shopify keys + DATABASE_URL
shopify app config link       # link to YOUR dev app (creates your own config)
pnpm prisma migrate deploy
pnpm dev                      # shopify app dev
```

> **First run:** the committed `shopify.app.toml` carries a placeholder `client_id`. Run `shopify app config link` to point the app at your own Partner app (or edit `client_id` / `application_url` in the TOML) — otherwise the Shopify CLI refuses to connect.

### Scripts

| Command            | What it does                                |
|--------------------|---------------------------------------------|
| `pnpm dev`         | Local dev via Shopify CLI                   |
| `pnpm build`       | Production build                            |
| `pnpm typecheck`   | React Router typegen + `tsc --noEmit`       |
| `pnpm lint`        | ESLint                                      |
| `pnpm setup`       | `prisma generate && prisma migrate deploy`  |

## Project layout

```
app/              React Router routes, loaders, actions, Shopify server helpers
  routes/         _index (landing), app.* (embedded admin), auth.*, webhooks.*
extensions/       Shopify theme / checkout extensions
prisma/           Schema + migrations (PostgreSQL)
cli/              Admin helper scripts (sh-admin.mjs)
```

## GDPR compliance

The three mandatory Shopify privacy webhooks are implemented at `app/routes/webhooks.customers.data_request.jsx`, `webhooks.customers.redact.jsx`, and `webhooks.shop.redact.jsx`.

## Mesh Pilot

This app is the Shopify surface of Mesh Pilot's SEO capability. The companion **[`ai-seo-agent`](https://github.com/Nuraveda-Labs/ai-seo-agent)** handles audit/optimization logic as a standalone agent; this repo packages it as a deployable, merchant-facing Shopify app. Everything is mirrored across GitHub + GitLab so a suspension on one host never loses the code.

## Contributing

Issues and PRs welcome — open an issue before a large PR so we can scope it. Keep changes narrow.

## Support

- Email — [help.nuraveda@gmail.com](mailto:help.nuraveda@gmail.com)
- Issues — [GitHub Issues](https://github.com/Nuraveda-Labs/shopify-agentic-seo-app/issues)

## License

MIT — see [LICENSE](./LICENSE).

<sub>© 2026 Tejas Karan Agrawal · <a href="https://nuraveda.com">Nuraveda Lab</a></sub>
