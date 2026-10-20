# bambi-site

The website for [bambi](https://github.com/Looderso/bambi), an ambisonics plugin suite: the plugins,
the host, tutorials, research, tools and downloads. Built with [Astro](https://astro.build) and published to
GitHub Pages on every push to `main`.

```bash
npm install
npm run dev      # http://localhost:4321/bambi-site/
npm run build    # into dist/
```

A plugin's page is `src/content/plugins/<name>.md`; how the site is built, section by section, is in
[SITE.md](SITE.md). The look — palette, type and rules — is the plugins' own, in
`src/styles/global.css`.
