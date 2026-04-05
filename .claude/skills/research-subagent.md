---
name: research-subagent
description: Use when exploring codebases, investigating bugs, or researching before implementing. Delegates to subagents to keep main context clean.
triggers:
  - investigate
  - explore
  - research
  - understand how
  - find where
  - trace the flow
---

# Research via Subagent

## Why Subagent
Reading files fills context. Subagents run in separate context windows and return summaries only.

## Pattern
When the task involves understanding existing code:

```
Use a subagent to investigate [specific question].
Report back: relevant files, key functions, data flow, and any gotchas.
```

## Anti-Patterns (NEVER do these in main context)
- Don't `cat` entire files to "understand" them
- Don't read more than 3 files without subagent delegation
- Don't grep without a specific pattern

## Output Format
Subagent returns:
```
FILES: [relevant files found]
PATTERN: [how the existing code handles this]
ENTRY POINT: [where to start changes]
RISKS: [what could break]
```
