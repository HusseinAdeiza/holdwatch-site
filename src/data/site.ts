/**
 * data/site.ts — figures baked in AT BUILD TIME, not fetched by the browser.
 *
 * Why this exists, learned the hard way:
 *
 * The first version fetched the live API from the browser. Node could reach it
 * (HTTP 200, 7 events), but the page rendered the failure state with
 * "TypeError: Failed to fetch" — because the HoldWatch API sends no
 * `Access-Control-Allow-Origin` header, so the browser blocks the cross-origin
 * read. A curl check would never have shown that; only loading the page did.
 *
 * Two correct options:
 *   a) add CORS to the HoldWatch API, or
 *   b) resolve the data during the build and ship it in the bundle.
 *
 * (b) is what tryveir.xyz effectively does — its block height is read and
 * baked, not pulled by the visitor. It also means the page cannot break
 * because an API blipped while someone was reading it, and it costs the
 * visitor nothing. The number is still REAL: it was read from the running
 * deployment seconds before this bundle was produced.
 *
 * The build still fails if the deployment cannot be reached — see build.ts — so
 * the page can never ship a stale or invented figure silently.
 */

export interface SiteData {
  total: number;
  verified: number;
  covered: number;
  needsAction: number;
  aiEnabled: boolean;
  reviewerPassed: boolean;
  /** captured at build time; shown in the UI so a judge knows how fresh it is */
  readAt: string;
  readAtUnix: number;
  webhookId: string;
  captureId: string;
  recall: number;
  precision: number;
  f1: number;
  misses: number;
  scenarios: number;
  /** the literal status string PayPal sends when money is frozen */
  onHoldToken: string;
}

import data from './site.generated.json'

export const site = data as SiteData
