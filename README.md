# TindaTrack

A **mock-up test application** for a small store inventory and sales tracking system, built with **Expo (React Native)**. This project was developed using a personal boilerplate to speed up the initial setup and focus on prototyping the core features.

> ⚠️ This is a personal mock-up and proof-of-concept project. It is not intended for production use or external deployment.

---

## Overview

TindaTrack is a mobile-first app concept designed to help small store owners (tinda = Filipino for small store/sari-sari store) track their products, sales, and bills in one place. The mock-up explores the feasibility of a lightweight, offline-friendly store management tool built on React Native.

## Features

- **Product management** — Add and manage store inventory with stock tracking
- **Sales tracking** — Record and monitor daily sales entries
- **Bills management** — Track store expenses and bills
- **Reports & charts** — Visual sales and inventory reports via Victory Native and Skia
- **Dashboard** — Quick stats, low stock alerts, and sales overview
- **Receipt generation** — Print and share receipts via Expo Print and Sharing
- **Authentication** — Supabase-backed auth with persistent sessions

## Tech Stack

| Category | Technologies |
|---|---|
| Framework | Expo (React Native), Expo Router |
| Language | TypeScript |
| Styling | NativeWind (Tailwind CSS) |
| Backend | Supabase (PostgreSQL + Auth) |
| Charts | Victory Native, React Native Skia |
| Forms | React Hook Form, Zod |
| Package Manager | Bun |
| Build | EAS Build |

## Project Structure

```
app/          # Expo Router screens and layouts
components/   # Reusable UI components
lib/          # Supabase client and utilities
types/        # TypeScript type definitions
constants/    # App-wide constants
assets/       # Images, fonts, icons
```

## Notes

- Built on top of a personal Expo boilerplate to accelerate mock-up setup
- Supabase is used as a quick backend solution for prototyping purposes
- Row Level Security (RLS) is enabled on all tables
- This project is a personal test and is not actively maintained

## License

[MIT](./LICENSE)