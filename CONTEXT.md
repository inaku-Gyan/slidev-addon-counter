# Counter Addon Context

This context defines the language and update semantics for the Slidev counter addon. It is intentionally limited to concepts that matter when the addon updates during presentation editing.

## Language

**Counter**:
The presentation-facing indicator of the current slide position within the configured counter timeline.
_Avoid_: page number, slide number

**Counter view data**:
The derived values that determine what the counter displays, including the current position, total position, and visibility.
_Avoid_: counter state, session state

**Slide identity**:
The logical slide being viewed, independent of its temporary numeric position in the presentation.
_Avoid_: slide index

**HMR update**:
An in-place development update after editing slide source or counter configuration, preserving the presentation's navigation state while refreshing affected counter view data.
_Avoid_: full reload, page refresh

**Safe fallback**:
A full timeline rebuild or browser reload used when a structural edit cannot be applied incrementally without risking incorrect slide identity or counter view data.
_Avoid_: normal update path

**Counter timeline**:
The ordered presentation-wide sequence of counter operations and the derived counter view data associated with them.
_Avoid_: current-page counter state

**Timeline rebuild boundary**:
The earliest slide whose counter operations may have changed, from which later counter view data may need to be recomputed.
_Avoid_: changed slide only

**Incremental counter update**:
An HMR update that reuses unchanged slide operation data and recomputes the counter timeline from its rebuild boundary while preserving full-rebuild results.
_Avoid_: current-slide-only update

**Structural edit**:
An addition, removal, or reorder of slides that changes the presentation's slide identities or their positions in the counter timeline.
_Avoid_: content edit
