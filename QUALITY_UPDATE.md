# HORDEBREAKER — Local Saves, Seamless Combat & UI Refresh

## Changes

### Local-only saves restored
- Removed Firebase Authentication and cloud-save client integration from the game.
- Restored the original `tbh_idle_equipment_v1` localStorage save key and format.
- Added three rotating automatic backups (`tbh_autobackup_1..3`) of previous valid saves.
- Added recovery controls for automatic backups in the existing Save Tools window.
- Save failures are surfaced in the in-game save indicator rather than silently ignored.
- Reset clears the automatic backups as well as the primary save.

### Seamless combat
- Hero skill cooldowns, passive counters and active short buffs are no longer reset when a new wave starts.
- Cooldowns and buff durations continue ticking during the inter-wave pause.
- Camera advance and melee heroes' forward offsets no longer move backwards just because the previous enemy died or the next enemy has not spawned yet.
- Boss mechanics that intentionally push the formation back remain intact.

### Hero portrait quality
- Squad-menu portraits now render from a 128×128 canvas backing store with high-quality smoothing.
- Portrait display size and frame styling were increased to better match the crispness of item icons.

### Interface and mobile
- All main game dialogs retain keyboard focus trapping and now close when the backdrop is tapped.
- Save Tools dialog now has dialog semantics, focus restoration and keyboard focus trapping.
- Dialogs and panels respect mobile safe areas, viewport height, internal scrolling and touch target sizes.
- Improved portrait and card layout at tablet and narrow phone widths.

## Verification
- `node tests/sanity.mjs` passes, including new regressions for local backups, wave cooldown persistence, forward-only movement, portrait resolution and mobile modal CSS.
- All JavaScript files pass `node --check`.
- All referenced static assets and scripts returned HTTP 200 from a local static HTTP server.
- A full interactive browser playthrough was not completed in this environment; please do a quick real-device check after unpacking.
