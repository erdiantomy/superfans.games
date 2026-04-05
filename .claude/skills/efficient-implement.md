---
name: efficient-implement
description: Use when implementing features or fixing bugs. Enforces token-efficient workflow — targeted file reads, batched edits, verification.
triggers:
  - implement
  - fix
  - build
  - add feature
  - create component
---

# Efficient Implementation

## Before Writing Code
1. **Scope check**: What exact files need changing? Use `grep -r` or `find` to locate, don't read entire dirs.
2. **Pattern check**: Is there an existing pattern in the codebase for this? Check 1 similar file first.
3. **Dependency check**: Will this change break imports elsewhere? Quick `grep` for the function/component name.

## During Implementation
- Batch all edits to a single file in one operation.
- If editing >3 files, state the plan first, then execute sequentially.
- Use the project's existing abstractions. Don't reinvent.
- TypeScript: define interface BEFORE implementing.

## After Implementation
Run in this exact order:
```bash
npx tsc --noEmit          # type check
npm run lint -- --fix      # auto-fix lint
npm run build              # verify build
```

## Output Format
```
CHANGED: [list of files]
VERIFIED: [build|lint|types] ✓ or ✗
NEXT: [what to test manually or what's remaining]
```
