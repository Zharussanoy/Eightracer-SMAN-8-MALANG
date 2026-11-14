# B4 visual consistency

Shared presentation is defined in `components/b4/consistency.css`, imported once from global CSS and scoped to `.b4-page`.

- Retain purple, lilac, cream, existing layouts and original Plus Jakarta Sans font.
- Use one non-recursive font variable: `--font-eightracer` from Next font, mapped to Tailwind `--font-sans`.
- Establish consistent heading weights (700), section/card titles (600–700), body (400), labels (14px) and supporting text (12–13px).
- Metric cards share minimum heights and spacing within their group; content may grow rather than truncate names or financial values.
- Primary icon size 18–22px; semantic status icons keep dark green/amber. Remove the decorative sparkle from the student recommendation navigation tab.
- Search fields use one focus ring on their wrapper, no separate input border, no duplicate icon padding. Keyboard focus remains visible.
- Preserve reduced-motion preferences and collapse card grids on narrow screens.

No data, routes or permissions are altered by these styling changes. Source type-checks and static component rendering are verified; final visual browser review should still be performed on desktop and mobile.
