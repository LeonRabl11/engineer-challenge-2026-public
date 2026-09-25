# Known issues

Ordered by severity. "Next step" is what I would do with another day.

## Critical
- **OpenAI API key exposed in the browser.** The web app uses
  `VITE_OPENAI_API_KEY`. Vite inlines `VITE_` variables into the client
  bundle, so with a real key every user could read it in the dev tools and
  use it at the client's cost.
  *Next step:* move the LLM call to the server, keep the key only in
  `server/.env`, add a timeout, rate limiting and input length limits.

## High
- **CSV/formula injection in the export (likely, not verified).** Seed data
  contains a message starting with `=HYPERLINK(...)`. If the export does not
  escape cells starting with `=`, `+`, `-` or `@`, Excel executes them as
  formulas.
  *Next step:* verify in Excel, then prefix such cells with `'`.
- **Auth token in the export URL.** The export passes the token as a query
  parameter, so it ends up in browser history and server logs.
  *Next step:* send it in a header and download via fetch.
- **Default `JWT_SECRET`.** `.env.example` ships `change-me-in-production`.
  *Next step:* refuse to start in production if the secret is missing or
  still the default.
- **Private notes not verified.** I did not check whether "private" is
  enforced on the server or only hidden in the UI.
  *Next step:* test with a second user and check the API response.

## Medium
- **Inbox polling (as of my last read of Inbox.tsx).** The 45-second refresh
  uses stale page, filter and search values and can reset the view to page 1.
- **Search fires on every keystroke.** No debounce; out-of-order responses
  can show results for an older search term.
- **Other SQL queries not re-audited.** I fixed `GET /feedback`; the other
  queries still need a review for string interpolation.
- **LLM summarize not reviewed.** Only tested with `FAKE_LLM=true`; error
  handling, timeouts and prompt injection are unchecked.
- **9 npm audit warnings (5 high).** Not yet triaged.

## Low
- Clickable table rows are not keyboard accessible (`<tr onClick>`).
- No frontend tests, no lint, no CI.
- A metrics backend endpoint may now be unused after removing the panel.
