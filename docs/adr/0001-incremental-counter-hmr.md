---
status: accepted
---

# Incremental HMR for counter updates

Edits to existing slide content and counter configuration will use in-place HMR inside the addon: navigation state is preserved, unchanged slide operation data is reused, and the timeline is recomputed from the earliest affected boundary (configuration changes may rebuild the whole timeline). Slide additions, removals, or reordering may use a safe full rebuild or browser reload fallback. This preserves exact counter semantics while reducing save-to-render latency without changing the public API; the alternatives of always reloading or updating only the current slide either lose presentation state or can produce stale later counters.
