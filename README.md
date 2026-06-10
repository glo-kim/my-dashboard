# FastForward Ops Dashboard

A real-time operations dashboard for FastForward Logistics that replaces scattered spreadsheets with a single, presentation-ready view of shipment volume, on-time delivery rates, regional performance, and open exceptions.

![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)
![Vuetify 3](https://img.shields.io/badge/Vuetify-3-1867C0?logo=vuetify&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

---

## 📋 Overview

FastForward's operations team previously tracked shipment volume, delivery performance, regional metrics, and exception cases across dozens of spreadsheets. Data was stale, formatting inconsistent, and there was no single source of truth.

This dashboard provides a **live, self-service view** that leadership can open in any browser — no logins to multiple tools, no emailing spreadsheets around.

---

## ✨ Features

- **KPI Summary Bar** — Four headline metrics (Total Shipments MTD, On-Time Delivery Rate, Average Transit Time, Open Exceptions) with trend indicators and color-coded status
- **Shipment Volume Charts** — Daily bar chart with a trailing 7-day moving average, filterable by region and shipping mode (LTL, FTL, Parcel)
- **On-Time Delivery Performance** — Weekly trend line with a 95% target, plus a doughnut chart breakdown (On-Time, Late, Early)
- **Regional Performance Table** — Sortable data table with color-coded cells for at-risk regions
- **Exceptions Log** — Filterable table with status chips, expandable detail rows, and exception types (Delayed, Damaged, Address Issue, Customs Hold, Lost)
- **Light/Dark Mode** — Theme support for different viewing preferences
- **Responsive Layout** — Desktop-first design, usable on a laptop projected in a meeting room

---

## 🛠 Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Vue 3 (Composition API) | SPA architecture |
| UI Library | Vuetify 3 | Material Design components, data tables, cards |
| Charts | Chart.js + vue-chartjs | Bar, line, doughnut visualizations |
| Routing | Vue Router 4 | Multi-page navigation |
| Build Tool | Vite | Fast dev & production builds |
| Language | TypeScript | Type-safe codebase |
| Data | Static JSON fixtures | Prototype uses mock data; easily swappable for a REST/GraphQL API |

---

## 📁 Template Structure

# my-dashboard-tmp

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

#
