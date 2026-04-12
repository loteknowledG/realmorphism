# Realmorphism Control Briefing

This briefing describes the control language for `realmorphism`:

- the UI should feel like a machine panel, not a flat app
- controls should read as physical mechanisms
- motion should communicate state, coupling, and intent
- color should carry information, not decoration
- the whole system should feel like the Cult Mechanicus translated into web controls

## Core Principle

Every control should answer one question clearly:

- is this an action?
- is this a state?
- is this a range?
- is this a choice?
- is this a direction?

If the answer is unclear, the control should be split into simpler parts.

## Control Vocabulary

### 1. Push Button

Use for:

- single actions
- discrete commands
- momentary triggers

Behavior:

- lifts on hover
- sinks on press
- stays sunken when active
- label changes color, but the body stays neutral
- the face can be angled like the ASCII tab buttons, with the press depth matching the same tilt
- the shadow should reinforce that angle so the control reads as a real object, not a flat card

Illustration:

- a machine start button
- a console action key
- a tab in a grouped rail

### 2. Sunken Tab

Use for:

- grouped navigation
- one-of-many choices
- page selection

Behavior:

- behaves like a radio button in a strong visual frame
- selected tab becomes depressed
- neighboring tabs can shift slightly for a physical ripple

Illustration:

- folder tabs
- section tabs
- control panel selectors

### 3. Toggle Latch

Use for:

- on/off state
- enabled/disabled behavior
- persistent modes

Behavior:

- flips between two stable states
- should be visually obvious
- should not be confused with a momentary button

Illustration:

- memory on/off
- voice on/off
- hearing enabled/disabled

### 4. Knob

Use for:

- bounded continuous tuning
- intensity
- aggressiveness
- amount
- speed
- memory depth

Behavior:

- has a real minimum and maximum
- does not spin forever
- wheel input is the primary precise interaction
- drag can exist as a fallback, not the core

Illustration:

- debate intensity
- summary depth
- more or less detail
- aggressive vs gentle response shaping

### 5. Radio Rail

Use for:

- a tight list of mutually exclusive choices
- section selection
- page switching

Behavior:

- items sit close together
- one selection pops out
- the list feels like a single decision surface

Illustration:

- conversation / connections / memory
- AI A / AI B / AI C / User
- mode selection

### 6. Radial / Radar Control

Use for:

- steering a system
- showing tendency or lean
- putting options around a central mode

Behavior:

- center = main mode
- outer points = steering options
- can feel like a scanner, targeting system, or instrument cluster
- should not feel decorative

Illustration:

- AI steering
- attract / repulse a response tendency
- strong / neutral / restrained / exploratory

## AI Steering Model

In `realmorphism`, AI is not a static form field.
It is a field that can lean.

The interface can show:

- where the AI is leaning
- how strong the current tendency is
- whether the user should attract it, repulse it, or hold it steady

Controls for this model:

- knobs for intensity and amount
- radar controls for directional steering
- buttons for discrete mode changes
- toggles for durable state

## Status Color

Use color as machine language:

- green = active, safe, online, confirmed
- amber = scanning, caution, in progress
- red = warning, fault, overload, critical heat

Special cases:

- red bars and red meter segments should feel urgent
- clocks, calendars, and heat indicators can use the same palette
- partial arcs on knobs can indicate thresholds or warning ranges

## Surface Rules

- hard edges beat watery blur
- shadows should read like real depth
- active states should sink, not just glow
- controls should feel coupled, so motion in one part can nudge the nearby parts
- the angled-face trick from the 3D button pattern can be reused so the button top and shadow agree on the same direction
- `realmorphism` buttons should feel like a pressed wedge or slab when active, similar to the ASCII tabs but more physically grounded

## Component Ideas

The first reusable `realmorphism` components should probably be:

- `PushButton`
- `SunkenTab`
- `ToggleLatch`
- `Knob`
- `RadioRail`
- `RadarSteering`
- `MeterBar`
- `HeatClock`

## Closing Note

The goal is not to make controls look fancy.
The goal is to make the controls feel like they are doing real mechanical work.

That is what makes `realmorphism` feel alive.
