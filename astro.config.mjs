// @ts-check
import { defineConfig } from 'astro/config';

//  Served from GitHub Pages under its own domain, so from the root.
export default defineConfig({
  site: 'https://bambi.wiki',
  trailingSlash: 'ignore',
  //  code in ink on the panel, like everything else: no highlighting theme of its own
  markdown: { syntaxHighlight: false },
  //  addresses that moved, kept working
  redirects: {
    '/tools/airpod-clip': '/tools/tracker-clip',
    '/foundations': '/research/foundations',
    '/plugins/encoder': '/plugins/path-encoder',
    '/tutorial/encoder': '/tutorial/path-encoder',
    //  the guideline pages: their rules are the bambi repository's own files, which contribute links to
    '/contribute/ambix-and-coordinates': '/contribute',
    '/contribute/building': '/contribute',
    '/contribute/buses-and-formats': '/contribute',
    '/contribute/code-style': '/contribute',
    '/contribute/features': '/contribute',
    '/contribute/making-a-change': '/contribute',
    '/contribute/modulation': '/contribute',
    '/contribute/parameters-and-state': '/contribute',
    '/contribute/presets': '/contribute',
    '/contribute/regions': '/contribute',
    '/contribute/shared-system': '/contribute',
    '/contribute/tests': '/contribute',
    '/contribute/the-audio-thread': '/contribute',
    '/contribute/the-look': '/contribute',
    '/contribute/the-picker': '/contribute',
    '/contribute/the-scene': '/contribute',
    '/contribute/where-code-lives': '/contribute',
    '/contribute/working-rules': '/contribute',
  },
});
