# Decisions

## Approach
When I first opened Pulse, the UI was so overloaded that I couldn't get an
overview of what the app actually does. So I started with the styling: I
worked through the three pages (login, inbox, detail) from top to bottom,
with the goal of making each one as simple and clear as possible for the
user. A clean structure helped me orient myself before digging into the
behavior.

I worked with two tools: a separate Claude.ai chat to plan and draft prompts,
and Claude Code to implement them. CLAUDE.md sets plan-first rules (propose,
wait for approval, one change at a time, failing test first for bugs).
The full trail is in `docs/agent-trail/`.

**How I verified:** mostly in the browser. Under time pressure I did not
review the code diffs in depth. The security and pagination fixes are
covered by automated tests the agent wrote at my request.

**Time:** 3h 20min (10:50–12:15 and 12:55–14:50). Roughly two thirds of it
went into the UI. Splitting commits and writing these docs came afterwards.

## What I fixed (commit 9f8671c)
- **SQL injection in the search.** The search text and status filter were
  copied directly into the SQL query, so anyone could type SQL commands into
  the search bar and read or change any data. They are now sent as bound
  parameters, so the database always treats them as values, never as
  commands. Invalid status values are rejected.
- **Pagination skipped the newest items.** Page 1 started at item 11 instead
  of item 1. The 10 newest feedback items were never visible and the last
  page was empty. I noticed the empty last page in the browser; the cause
  was confirmed in the code.
- **Search by customer name only**, with a new placeholder "Search customers".
- **Tests:** the agent added a server test setup at my request. 7 tests pass,
  including a search with a single quote ("O'Brien").

I approved the agent's plan for these fixes but did not review it in detail.

## Product decisions
- **Search by customer name only.** When triaging, "who is this from" is the
  most relevant filter, and the old search was broken. A narrower search was
  faster to make correct and test. Trade-off: no keyword search in message
  text for now.
- **Removed the metrics panel.** Together with everything else on the page,
  it was too much information and made it hard to get an overview. My goal
  was a simpler inbox that is easier to understand. Trade-off: no
  at-a-glance counts (see product note).
- **Replaced the filter buttons with a status dropdown** next to the search,
  to make the toolbar more compact and ordered.
- **Removed the Resolve/Reopen column from the inbox.** The same action
  exists on the detail page, so I kept one place for it. Side benefit: the
  list version changed the status in the UI without handling server errors,
  and that code is now gone. Trade-off: one extra click per item.

## UI cleanup
I removed stripes, blinking badges, tilted boxes, the marquee and the custom
cursor, and replaced them with a small set of CSS variables, one shared
header for login and app, and shared button, badge and input styles. I did
not redesign the app.

## Where the agent was wrong
- **Message box background.** I asked for the cyan background to be removed;
  the browser still showed it. Instead of repeating the request, I had the
  agent find out why: the removal had only been proposed, never applied.
  Lesson: check the result, not the summary.
- **Pagination.** Asked to explain the search, Claude Code showed page 1 with
  `OFFSET 10` and did not notice it was a bug. The contradiction was pointed
  out in my planning chat.
- **CLAUDE.md** said "Tests: none", which became wrong once tests were added.
  Updated.

## Found late: OpenAI key in the frontend
While wrapping up, my planning chat pointed out that the web app uses
`VITE_OPENAI_API_KEY`. Vite puts `VITE_` variables into the JavaScript sent
to the browser, so a real key would be readable by every user. I did not
know this before. I did not fix it within the timebox; it is the first item
in `KNOWN-ISSUES.md`.

## What I chose not to touch
Everything else I found is in `KNOWN-ISSUES.md`, ordered by severity.
I stopped at the timebox instead of fixing more.

## What I'd do differently
- Fix security and data correctness first and style afterwards. Cleaning up
  the UI helped me get oriented, but it took most of my time.
- Review the code diffs, not just the browser result.
- Commit after each change instead of splitting commits afterwards, and keep
  the agent log live.
