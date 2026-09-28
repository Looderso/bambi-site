// @ts-check
import { defineConfig } from 'astro/config';

//  Served from GitHub Pages under its own domain, so from the root.
export default defineConfig({
  site: 'https://bambi.wiki',
  trailingSlash: 'ignore',
});
