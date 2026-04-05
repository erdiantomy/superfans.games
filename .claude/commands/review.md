Review the current branch against main. Use subagent to:

1. Run `!git diff main...HEAD --stat` to get changed files
2. For each changed file, check:
   - TypeScript errors: `!npx tsc --noEmit 2>&1 | head -30`
   - Lint issues: `!npm run lint 2>&1 | tail -20`
3. Verify build passes: `!npm run build 2>&1 | tail -10`

Output format:
```
## PR Review: [branch name]

### Changes
[file list with +/- lines]

### Issues Found
- [ ] [issue description + file:line]

### Build Status
✓/✗ TypeScript | ✓/✗ Lint | ✓/✗ Build

### Verdict
SHIP IT / NEEDS FIXES: [list fixes needed]
```
