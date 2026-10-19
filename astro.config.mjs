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
  },
});
