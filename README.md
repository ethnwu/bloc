# bloc

A full-stack show choir blocking app at **https://bloc.ethanwu.me**.

One show has a shared cast and stage. Each song contains a sequence of charts. A chart captures everyone's positions at a musical cue. Directors duplicate a picture, move the people who change spots, and use recording timestamps to rehearse the transitions.

## Included

- Email/password registration and login using Better Auth; secure sessions and password changes.
- Private account-backed workbooks, revision checks, and cloud audio storage.
- Multiple songs per show, with independent chart sequences and rehearsal tracks.
- Show-wide roster with stable IDs, numbers, names, parts, and colors. Bulk roster entry.
- Measured stage dimensions, individual 8′ × 4′ or custom riser decks, heights, and offstage wings.
- Duplicate, reorder, edit, and delete charts. Musical cue labels and rehearsal notes.
- Drag performers, shift-select groups, nudge with arrows, mirror, align, undo, and redo.
- Cue timestamps and travel durations. Audio drives playback, pause, seek, and speed changes.
- Follow-performer view, read-only rehearsal links and revocation, chart printing, JSON export/import.
- Responsive layout and system typography with no remote fonts or trackers.

## StageBook workflow update

- Numbered cast groups, stage placement queues, global names and group colors.
- Blank or copied charts, animated transitions, thumbnail overview and chart reordering.
- Props with shape, color, fill, labels and performer attachment; partners move together.
- Graphical riser placement, full/half decks, staggered presets and reusable saved stages.
- Centered mirrored number line, custom labels, optional grid and configurable snapping.
- Expanded working canvas, collapsible panels and stage zoom.
- Owner-controlled edit invitations, member permissions and revocation. Active workbooks synchronize every two seconds; independent changes merge, conflicting changes stop with a backup/export option.
- Immutable short share codes, read-only snapshots and independent editable imports. Snapshots omit audio.

These implement the demonstrated workflow; this is not a claim of complete parity with every StageBook release. Email verification and emailed password resets require the still-disabled outbound email service.

## Stack

React, TypeScript, Vite, SVG, Hono, Better Auth, Drizzle, Cloudflare Workers and D1. Audio is stored in bounded binary chunks with HTTP range support. All project and audio access is authorized on the server. Account isolation, origin checks, bounded uploads, authentication rate limits, and optimistic revisions are enforced.

## Local development

Requires Node 22+ and npm.

```sh
npm ci
cp .env.example .dev.vars
# Set a random BETTER_AUTH_SECRET in .dev.vars.
npm run db:local
npm run build
npm run preview
```

Open http://127.0.0.1:8787. For frontend hot reload, run `npm run dev` alongside the Worker, with PUBLIC_URL=http://127.0.0.1:5173 in `.dev.vars`.

```sh
npm test
npm run build
```

## Deployment

The production Worker is `bloc`, using D1 database `bloc`, with a custom domain at bloc.ethanwu.me. The main ethanwu.me Worker is separate.

```sh
npx wrangler login
npm run db:remote
npx wrangler secret put BETTER_AUTH_SECRET
npm run deploy
```

Set BETTER_AUTH_SECRET once; rotating it invalidates existing sessions. Keep secrets in Cloudflare and ignored `.dev.vars` files. Never commit credentials. CI builds and runs model tests. Deployment uses the authenticated owner's local Wrangler session; no account-wide API token is stored in GitHub.

### Transactional email

Email/password registration and login work without ChatGPT. **Outbound email is not yet enabled.** Cloudflare's account rejected Email Sending API access. Consequently email verification and self-service password-reset delivery are unavailable; the UI does not claim otherwise. Password changes work with the current password.

To enable verification and password-reset emails, onboard a sender with an authorized Cloudflare Email Service account, add the EMAIL send binding, set EMAIL_FROM to the verified sender, and set EMAIL_ENABLED=true. The server already provides Better Auth verification and reset hooks. Verify delivery before enabling it for users. An existing account may need to request verification after email is enabled.

## Timing model

A chart is the picture reached at its `at` timestamp. Its `travel` specifies how long the move into that picture lasts. The preceding picture holds until `max(previous.at, current.at - current.travel)`. Time comes directly from the recording; this supports tempo changes without assuming a constant BPM. BPM only suggests default spacing for a new chart.

Stage coordinates are feet; deck heights are inches. Stage right appears on the left side of an audience-facing ground plan. Straight-line movement is a planning reference, not choreography or physical route validation. Stairs and obstacles are not modeled. Rehearse movement on the actual stage.

## Storage and limits

150 performers, 30 songs per show, 200 charts per song, 100 shows per account. Audio: 30 MB per track, 150 MB per account. JSON exports omit audio; retain original recordings. Share links disclose cast names, notes, and tracks to anyone holding the link and can be revoked. Archived shows remain restorable.

## Research informing the model

- [StageBook's developer feature history](https://apps.apple.com/us/app/stagebook/id1093223304): shared performers, charts, offstage areas, custom risers, partnering, and chart sharing.
- [StageRight: show choir risers and rehearsal preparation](https://performance.stageright.com/blog/stages-risers/how-to-enhance-show-choir-performances-the-role-of-risers-choreography-and-preparation/): modular platform geometry, visibility, and rehearsing in the real space.
- [Burroughs Music Showcase staging requirements](https://www.burroughsmusicshowcase.org/forms/show_choir_rules_%26_regulations.pdf): individual 4′ × 8′ decks, multiple heights, stairs, and front-of-stage space. Venue configurations vary; presets remain editable.
- [Wenger, Show Choir Confidential](https://www.wengercorp.com/downloads/show-choir-confidential.pdf): show choir staging, equipment, and practical rehearsal considerations.
- [BlockLight's chart workflow](https://blocklight.wixsite.com/blocklight-website/product-overview): chart sequence, reordering, and print handoff.
- [Starling Arts, Choreographing for a Choir](https://www.starlingarts.com/blog/2018/10/8/choreographing-for-a-choir): movement serves the music and varies by ensemble and song.

bloc is independent and does not use StageBook branding, source code, or artwork.

## iPad / Home Screen app

Bloc includes a standalone web app manifest, PNG application icons, Apple touch metadata and safe-area support. In Safari choose Share → Add to Home Screen, enable Open as Web App if shown, and launch Bloc from that icon. This is an installable web app, not an App Store binary.

The tablet editor keeps the stage and playback on screen, uses contextual Cast/Risers/Tools panels, and offers tap-to-place, multiple selection, nudge controls and a pan mode for zoomed charts. Portrait, landscape and desktop layouts are supported. Cloud workbooks and audio require connectivity. The service worker caches only a public offline notice; it does not cache authenticated data or claim offline editing. Local recovery still protects unsaved open-workbook changes.

## Simpler desktop workspace

Desktop now shares the stage-first app layout, with larger labeled controls, a searchable Students panel, contextual Stage & risers / More tools, visible Undo and Redo, clear navigation to My shows, labeled chart details and a short Help guide. Interface colors use muted red, neutral paper and gray risers. User-defined cast colors are preserved.
