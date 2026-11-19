# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-19

### Added
- Dynamic `/activities/[slug]` route so activities that exist only in Supabase (not hardcoded in `app/data/activities.ts`) get their own detail pages
- Contact information for DB-only activities read from the `metadata` JSONB column
- Video fallback for DB activities: uses `metadata.videoUrls` or `metadata.youtubeUrl` if set, otherwise searches YouTube for a relevant official video so every detail page has a video section

### Changed
- Detail pages for DB activities are fetched server-side directly from Supabase in the `[slug]` route
- `ActivityDetailPage` accepts optional contact info so both hardcoded and DB activities render consistently

### Fixed
- Await the `params` Promise in the Next 16 server component for the `[slug]` route
- Use relative imports in the `[slug]` route for Turbopack compatibility
- Client-side fallback fetching via `useParams()` for dynamic routes without server SSR
