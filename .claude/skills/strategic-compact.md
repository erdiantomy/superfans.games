---
name: strategic-compact
description: Triggered when context is getting heavy. Guides when and how to compact without losing critical state.
triggers:
  - context is getting long
  - running out of context
  - compact
  - session is heavy
---

# Strategic Compaction

## When to Compact
- After completing a logical unit of work (feature done, PR ready)
- After a research/exploration phase before implementation
- When you notice repeated tool calls or circular reasoning
- At ~50% context usage (don't wait for auto-compact at 83%)

## How to Compact
Use `/compact` with explicit preservation instructions:

```
/compact Preserve: modified files list, current task description, 
architectural decisions, error states, and build/test status.
Drop: file contents already committed, exploration dead-ends, 
verbose error logs (keep only the key error message).
```

## Better Alternative: Checkpoint to File
For complex multi-phase work:

1. Write current state to `PROGRESS.md`:
```
## Current State
- Task: [description]
- Modified: [files]
- Decisions: [key choices made]
- Blockers: [if any]
- Next: [immediate next step]
```

2. `/clear` to reset context
3. Start new session: "Read PROGRESS.md and continue from where we left off"

## Never Compact When
- Mid-debugging (you'll lose the error trace)
- During a multi-file refactor (you'll lose the refactor plan)
- If you haven't committed recent changes (risk of losing work knowledge)
