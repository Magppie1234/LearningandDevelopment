# L&D portal redesign — August 2026

What changed, and the reasoning behind the decisions that are not obvious from
the diff.

## Information architecture

Twenty-two flat sidebar entries became five grouped bands — **Learn ·
Capability · Knowledge · Lead · Administer** — declared once in
[`src/lib/roles.ts`](../src/lib/roles.ts) and filtered by role. A BD executive
now sees eleven relevant entries instead of twenty-two mostly-forbidden ones.

The old sidebar also rendered a **build-status dot** (red / amber / green) beside
every entry, straight from the delivery plan. An employee has no use for "this
section is still to-do", and a red dot beside *My Learning* reads as an error.
Removed.

Page titles and breadcrumbs are now derived from the same IA rather than from a
hand-maintained path→title map, which had already drifted — several routes fell
through to a literal "Page".

Three IA entries had no route at all and were built: `/catalogue`,
`/assessments`, `/settings`.

## Roles

There was **no role concept**. `auth.tsx` exposed one identity and Manager Hub,
Executive Dashboard, HR Control Centre and Content Admin were linked for
everyone, with no guard on any of them.

`lib/roles.ts` now defines five roles, the permissions each holds, and
`visibleWorkforce()` — the single authorisation boundary every scoped dashboard
filters through. `RoleGuard` protects the ten routes that cover other people.
A manager cannot reach another line's data by typing a URL, and the Skills
Passport honours `?member=` only for people inside the viewer's own cohort.

Until the HRMS import runs there is no authoritative role per user, so the
header carries a role switcher and the shell states on screen that the role is
simulated.

## Joining the two data worlds

The portal had a rigorous capability engine that knew what a person could
*prove* (`lib/role-readiness.ts` — five evidence channels, each setting a
ceiling; validated proficiency is the lowest ceiling, never an average) and a
course catalogue that knew what could be *learned*. Nothing connected them, so
no screen could say "here is your gap, and here is what to do about it".

[`lib/learning-plan.ts`](../src/lib/learning-plan.ts) is that join. It derives
per-person learning items, statuses, next steps and owners, plus the cohort
roll-ups (`summarise`, `rosterFor`, `assessmentStats`) every dashboard reads.

**Due dates** are derived from role start date plus a window set by competency
criticality (60 / 90 / 180 days), stated on screen wherever a due date appears
so a learner can check it rather than take it on faith.

## Honesty about data

Several pages presented authored sample content as a personal record:

- *My Learning* greeted a hardcoded "Sarah", reported "October 2024" and printed
  fixed counts regardless of who was signed in.
- *Certifications* showed a fixed journey ("Level 4 — Specialist", "Earned Oct
  2023") identical for every user.

Both are now derived from the signed-in person's evidence.

Where a number genuinely cannot be computed, the portal says so and names the
missing input rather than showing a plausible line:

- **Monthly trend** needs stored month-end snapshots; the engine computes a
  point-in-time verdict.
- **Training ROI** needs delivery cost and a linked business outcome, neither of
  which is fed into the portal.
- **Departments with no authored framework** report "unmeasurable", not 0%, and
  are excluded from percentage denominators — an authoring gap is not a learning
  failure, and averaging it in would hide the real problem behind a softer one.

## Design system

`src/components/ds/` is now the single source for surfaces, controls, states,
tables and charts. Notable fixes:

- The light theme had a full-bleed rose-marble photograph fixed behind every
  surface, pulling body copy on translucent cards well below AA. Removed;
  brand now reads through the copper accent, the serif display face and product
  imagery.
- **467 hardcoded `rgba(0,59,70,x)` values** across 69 files — a teal-black that
  was invisible in dark mode — were replaced with a theme-aware `--rule` token.
- Status colour was a set of muted brand tans (sage / rose / gold) that read as
  decoration and were nearly indistinguishable at badge size. Replaced with a
  five-value semantic ramp with fixed meanings. `StatusBadge` always pairs a
  tone with an icon and a word, so status survives greyscale.
- The header's magnifying glass was a button that did nothing. It is now a
  working ⌘K search over sections, learning paths, competencies and departments,
  filtered by role so it never offers a destination the viewer would be refused.
- `<Toaster/>` was never mounted, so any toast would have been silent.

## The phantom routes

Page components lived in `src/pages/`, which Next also treats as the **legacy
Pages Router**. Every one was therefore additionally exposed as a standalone
public route — `/ManagerHub`, `/Assessments`, `/Home` — prerendered outside the
portal shell with no providers above it. Thirty-six broken URLs, and the reason
`useAuthOptional()` had to exist.

The directory is now `src/screens/`. The phantom routes are gone and the
production build prerenders cleanly.
