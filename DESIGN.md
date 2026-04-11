# Realmorphism Design Notes

This note captures the visual direction we found together:

- `Real Morphism` is the core motion language.
- Buttons should feel physical: lift on hover, sink on press, stay sunken when active.
- Neighbor controls can shift a little too, to make the surface feel coupled and real.
- Tabs, radio lists, and button groups should read like mechanical panels.
- Knobs should be bounded controls for tuning, not endless spinners.
- Toggles are for on/off.
- Buttons are for single actions or discrete choices.
- The path to this style came from `ascii morphism`, which revealed a love for motion control.
- ASCII alone was hard to keep stable, so we leaned on Shadow DOM to protect the controls.
- Neumorphism brought the look back into something usable.
- The 3D CSS button motion from earlier finished the feeling.
- `realmorphism` is the name for the combined result.
- Glassmorphism is a useful warning: when the background warps and the controls disappear, usability drops.
- Realmorphism is a return to the purpose of controls.
- It keeps the strengths of the earlier morphisms, but brings the logic back into mechanics.
- Motion is the language: even an untrained user can understand push, pull, turn, latch, and select.
- Realmorphism is mostly about components, not layout.
- Layout should stay simple and serve the controls, not define the whole style.
- Desktop layout can use 3 columns to use the full screen well.
- Mobile layout can collapse to 1 column, stacked horizontally or vertically as needed.
- Layout should expand or compress the control surface without changing the component language.
- Motion should occupy the shadow volume so the control stays compact while feeling deeply 3D.
- The goal is maximum 3D effect inside a 2D isometric surface, without extra bulky footprint.
- The motion adds to the 3D illusion by making the shadow geometry feel physically responsive.
- Even though the shadow is still 2D, movement makes the eye read it as depth.

## Visual Direction

The target look is closer to an industrial control room than a glossy app UI:

- matte charcoal and steel backgrounds
- muted gray panels
- signal green for active labels
- amber for scanning, caution, or in-progress attention
- red for warnings, faults, overload, or critical status
- red bars / red meter segments should read as "bad news" immediately
- clocks, calendars, and heat indicators can also use the same status palette
- time display should feel like an instrument, not a decorative widget
- color should carry information first, decoration second
- highlights should point attention to important state, not just look pretty
- use color sparingly so it feels like machine status, not candy UI
- small highlights, not liquid glow
- hard-edged depth, not watery wobble
- geometric shadows should be angled like a 3D button edge
- top-left light and bottom-right depth can make panels feel pressable
- use the shadow language to define geometry and state, not just atmosphere

### Melancholik Mint

The `Melancholik mint` theme is a strong palette reference for `realmorphism`.

It feels like:

- retro midnight
- geometric
- romantic
- art-deco
- dark shell with bright mint signal
- pink / magenta surfaces for contrast and warmth

Use it as:

- a dark-mode base
- mint for active labels and focused controls
- magenta / pink as secondary accent or hover warmth
- deep charcoal, plum, and near-black for panels and backgrounds

## Interaction Principles

- `3D press` for primary actions and tabs
- `sunken state` for selected items
- `neighbor ripple` for adjacent controls
- `radio list` for grouped choices
- `knob` for continuous tuning and exploration
- a red arc or segment on a knob can indicate threshold, confirm, or warning depending on context
- partial arcs should read as state ranges on an instrument, not decoration
- radar / hub controls can place buttons or indicators at radial points around a center
- that radial layout should feel like a scanner or targeting system, not a decorative circle
- this can become an AI steering control: center = main mode, outer points = steering options
- AI state can read like a leaning field: the radar shows shape, and controls can attract or repulse it
- buttons and dials can nudge the system toward or away from a tendency instead of forcing a hard switch
- `wheel` input for knob control when precise drag would be awkward

## Reference Images

Saved as inspiration for the `realmorphism` palette and control language:

- [Machine / reactor panel reference 1](https://miro.medium.com/v2/resize:fit:1358/format:webp/1*nYvcaGNRwrmfdpERlQ0oIA.jpeg)
- [Machine / reactor panel reference 2](https://miro.medium.com/v2/resize:fit:1358/format:webp/1*vXMCwPzkeMQa2ghSQKBzDQ.jpeg)
- [Machine / reactor panel reference 3](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAeIAQI8XVaCMcyj2bt6dGF2NOt2wksmQh-w&s)
- [Machine / reactor panel reference 4](https://miro.medium.com/v2/1*0A25R7eELG6AfN8h0Eg7Dw.jpeg)
- [Machine / reactor panel reference 5](https://miro.medium.com/v2/1*mOPFzBcrDF3AJojk5B0QgA.jpeg)
- [Machine / reactor panel reference 6](https://miro.medium.com/v2/1*aDmhHAOamKqEgZJpIIshYg.jpeg)
- [Machine / reactor panel reference 7](https://miro.medium.com/v2/resize:fit:1400/1*tkg-YES0tIOe4K55qY7GGg@2x.jpeg)
- [Machine / reactor panel reference 8](https://miro.medium.com/v2/resize:fit:1358/format:webp/1*MM1yjbze_JxY18buqEgL2w.jpeg)

## Notes

When we build components for this library, prefer:

- visible mechanics over hidden magic
- continuous controls only when the task is actually continuous
- direct feedback on hover, press, and active state
- deliberate spacing so the control surface feels engineered

## Design Thesis

This style exists because:

- skeuomorphism taught us about material and texture
- neumorphism taught us about soft depth and surface embedding
- glassmorphism reminded us that pretty backgrounds can hide the actual controls
- realmorphism is the answer that keeps the controls legible, mechanical, and direct

The layout can be flexible, but the components should stay consistent and physically legible.

The result should feel like:

- controls with real cause and effect
- a surface that responds to input like machinery
- motion that communicates logic without requiring explanation
- a design language that feels intuitive even before it is learned
