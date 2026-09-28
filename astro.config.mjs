// @ts-check
import { defineConfig } from 'astro/config';

//  Served from GitHub Pages under the repository's name. With a domain of its own, `base` goes.
export default defineConfig({
  site: 'https://looderso.github.io',
  base: '/bambi-site',
  trailingSlash: 'ignore',
});
