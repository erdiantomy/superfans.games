/**
 * CI script: checks chat assistant page context for staleness (>30 days).
 * Exit code 1 if any context is stale.
 */

import { getStalenessReport } from "../src/lib/chat-assistant/pageContextRegistry.ts";

const stale = getStalenessReport();

if (stale.length > 0) {
  console.error("Stale chat assistant contexts detected:\n");
  for (const entry of stale) {
    console.error(
      `  ${entry.route} (${entry.pageName}) — last updated ${entry.lastUpdated} (${entry.daysOld} days ago)`,
    );
  }
  console.error(
    "\nUpdate the lastUpdated date in src/lib/chat-assistant/pageContextRegistry.ts",
  );
  process.exit(1);
} else {
  console.log("All chat assistant contexts are up to date.");
}
