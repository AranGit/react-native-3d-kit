# Beta validation

The first beta should prove developer activation before the package surface
expands. These are targets for the study, not existing customer results.

## Participants

Recruit 3–5 React Native developers who did not build this repository. Include
at least one primarily iOS developer, one primarily Android developer, and one
developer who normally starts with Expo Development Builds.

Do not coach setup unless the participant is blocked for more than five minutes.
Record the point of confusion before helping.

## Activation task

Give each participant the README and a clean React Native application. Ask them
to:

1. Install the three package tarballs and required peers.
2. Render one local GLB with an accessible description.
3. Orbit and zoom using gestures.
4. Add rotate and zoom buttons using `useOrbitControls()`.
5. Add two hotspots and activate both.
6. Run the result on their primary platform.

Activation is complete only when the model renders, gesture and button controls
move the camera, and both hotspots update application state.

## Release targets

- At least 4 of 5 participants complete activation without maintainer code edits.
- Median time to first rendered model is 15 minutes or less.
- No native crash, unresolved autolinking failure, or repository-local path is
  required.
- Every setup failure has a reproducible cause, a documentation fix, or a named
  release blocker.
- Accessibility labels and alternate controls are present in every completed app.

These thresholds are decision rules for the beta. They must not be presented as
achieved until sessions have been run and recorded.

## Session record

Record one row per participant:

| Field                | Value |
| -------------------- | ----- |
| Date and commit      |       |
| RN / OS / device     |       |
| Starting template    |       |
| Time to install      |       |
| Time to first render |       |
| Activation completed |       |
| Blocked step         |       |
| Error or warning     |       |
| Help required        |       |
| Requested capability |       |

## Product decisions

- Block release for crashes, broken native installation, false documentation,
  inaccessible core actions, or failure to render the included fixtures.
- Fix repeated setup friction before adding 3D features.
- Add a new capability to the post-0.1 roadmap only when it is requested in at
  least three sessions or blocks a validated use case.
- Keep AR, physics, material editing, conversion, and web rendering out of the
  first release unless beta evidence changes the product boundary.
