# Data Model: Static-First Routing Architecture

**Feature**: 001-static-first-routing
**Date**: 2026-01-14

## Overview

This document defines the canonical routing model for static-first architecture. No database entities are involved - this feature updates documentation and skills only.

## Routing Model

### Route Categories

| Category     | Path Pattern          | Handler | Auth Required | Description                     |
| ------------ | --------------------- | ------- | ------------- | ------------------------------- |
| Static       | `/`                   | Pages   | No            | Marketing home page             |
| Static       | `/about`              | Pages   | No            | About page                      |
| Static       | `/pricing`            | Pages   | No            | Pricing page                    |
| Static       | `/blog/*`             | Pages   | No            | Blog content                    |
| Static       | `/assets/*`           | Pages   | No            | Static assets (CSS, JS, images) |
| Auth         | `/auth/login`         | Worker  | No            | Login page                      |
| Auth         | `/auth/logout`        | Worker  | Session       | Logout action                   |
| Auth         | `/auth/callback/*`    | Worker  | No            | OAuth callbacks                 |
| App Page     | `/app`                | Worker  | Session       | Application dashboard           |
| App Page     | `/app/tasks`          | Worker  | Session       | Tasks page (full page)          |
| App Page     | `/app/settings`       | Worker  | Session       | Settings page                   |
| HTMX Partial | `/app/_/tasks`        | Worker  | Session       | Tasks list fragment             |
| HTMX Partial | `/app/_/tasks/:id`    | Worker  | Session       | Single task fragment            |
| HTMX Partial | `/app/_/profile/edit` | Worker  | Session       | Profile edit form               |
| Webhook      | `/webhooks/stripe`    | Worker  | Signature     | Stripe webhooks                 |
| Webhook      | `/webhooks/slack`     | Worker  | Signature     | Slack webhooks                  |

### Key Entities

#### Static Route

- **Definition**: Path served directly by Cloudflare Pages without Worker involvement
- **Examples**: `/`, `/pricing`, `/about`, `/blog/*`, `/assets/*`
- **Characteristics**:
  - Pre-built HTML files
  - No server-side processing
  - Cacheable at edge
  - No authentication required

#### Dynamic Route

- **Definition**: Path explicitly handled by the Cloudflare Worker
- **Subtypes**:
  - **Auth Routes** (`/auth/*`): Authentication flows
  - **App Pages** (`/app/*`): Full HTML pages requiring auth
  - **HTMX Partials** (`/app/_/*`): HTML fragments for HTMX swaps
  - **Webhooks** (`/webhooks/*`): External service callbacks

#### HTMX Partial Route

- **Definition**: Dynamic route returning HTML fragments only
- **Naming Convention**: `/app/_/[resource]/[action]`
- **Characteristics**:
  - Never directly linked (no `<a href>`)
  - Always targeted via `hx-get`, `hx-post`, etc.
  - Returns fragment, not full page
  - Not indexed by search engines

### Route Ownership

```
Cloudflare Pages (Static):
├── /                     → index.html
├── /about                → about/index.html
├── /pricing              → pricing/index.html
├── /blog/*               → blog/*/index.html
└── /assets/*             → assets/*

Cloudflare Worker (Dynamic):
├── /auth/*               → AuthHandlers
├── /app/*                → AppHandlers (session required)
│   ├── /app              → Dashboard page
│   ├── /app/tasks        → Tasks page
│   └── /app/_/*          → HTMX partials
└── /webhooks/*           → WebhookHandlers (signature verification)
```

## State Transitions

### Request Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      Cloudflare Edge                          │
├──────────────────────────────────────────────────────────────┤
│  Request arrives at domain                                    │
│           │                                                   │
│           ▼                                                   │
│  ┌─────────────────┐                                         │
│  │ Route Matching  │                                         │
│  └────────┬────────┘                                         │
│           │                                                   │
│     ┌─────┴─────┐                                            │
│     ▼           ▼                                            │
│ ┌───────┐  ┌────────┐                                        │
│ │Static │  │Dynamic │                                        │
│ │Routes │  │Routes  │                                        │
│ └───┬───┘  └───┬────┘                                        │
│     │          │                                             │
│     ▼          ▼                                             │
│ ┌───────┐  ┌────────────────────────────────────┐           │
│ │Pages  │  │              Worker                 │           │
│ │(HTML) │  │  ┌────────┐  ┌─────┐  ┌────────┐  │           │
│ └───────┘  │  │ /auth  │  │/app │  │/webhooks│  │           │
│            │  │ (open) │  │(auth)│  │(sig)   │  │           │
│            │  └────────┘  └─────┘  └────────┘  │           │
│            └────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

### Authentication Boundary

```
Unauthenticated Zone                 │  Authenticated Zone
──────────────────────────────────── │ ────────────────────────
/                                    │
/about                               │  /app
/pricing                             │  /app/tasks
/blog/*                              │  /app/settings
/auth/login                          │  /app/_/*
/auth/callback/*                     │
/webhooks/* (signature verified)     │
```

## Validation Rules

### Path Validation

| Rule                                                       | Pattern            | Valid                | Invalid               |
| ---------------------------------------------------------- | ------------------ | -------------------- | --------------------- | ------------- | ------------------------ |
| Static paths must not start with /app, /auth, or /webhooks | `/^(?!/(app        | auth                 | webhooks)).\*$/`      | `/`, `/about` | `/app-store` (ambiguous) |
| App paths must be under /app                               | `/^/app(/.*)?$/`   | `/app`, `/app/tasks` | `/apps/tasks`         |
| HTMX partials must use underscore                          | `/^/app/_/.*$/`    | `/app/_/tasks`       | `/app/partials/tasks` |
| Webhooks must be under /webhooks                           | `/^/webhooks/.*$/` | `/webhooks/stripe`   | `/webhook/stripe`     |

### Naming Conventions

| Entity Type  | Convention                         | Example                               |
| ------------ | ---------------------------------- | ------------------------------------- |
| Static page  | Lowercase, hyphenated              | `/about-us`, `/pricing`               |
| App page     | Lowercase, hyphenated              | `/app/user-settings`                  |
| HTMX partial | Underscore prefix, resource/action | `/app/_/tasks/create-form`            |
| Webhook      | Service name                       | `/webhooks/stripe`, `/webhooks/slack` |

## wrangler.toml Configuration

```jsonc
{
  "name": "my-app",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-01",

  // Static assets configuration
  "assets": {
    "directory": "./public",
    "binding": "ASSETS",
  },

  // Routes: Worker only handles specific paths
  // All other paths fall through to static assets
  "routes": [
    { "pattern": "example.com/app/*", "zone_name": "example.com" },
    { "pattern": "example.com/auth/*", "zone_name": "example.com" },
    { "pattern": "example.com/webhooks/*", "zone_name": "example.com" },
  ],
}
```

## Design North Star

> **Static by default. Dynamic by intent.**

If a page can be static, it should be.
If it must be dynamic, it lives under `/app`.

This single rule keeps the system fast, legible, and resistant to accidental complexity.
