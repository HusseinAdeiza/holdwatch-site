/**
 * main.tsx — entry point.
 *
 * Figures are baked at BUILD time by build.ts, which fails the build if the live
 * deployment cannot be reached. The browser therefore makes no API call at all:
 * the HoldWatch API sends no CORS header, so a client-side fetch was blocked —
 * and, separately, a static page should not break because an API blipped while
 * someone was reading it.
 */
import { site } from './data/site'
import { Sections } from './sections'
import './styles/tokens.css'
import './styles/layout.css'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <Sections d={site} key={JSON.stringify(site)} />,
)
