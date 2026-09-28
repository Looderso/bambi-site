# bambi-site

The website for [bambi](https://github.com/Looderso/bambi), an ambisonics plugin suite: the plugins,
the guidelines, downloads and references. Built with [Astro](https://astro.build) and published to
GitHub Pages on every push to `main`.

```bash
npm install
npm run dev      # http://localhost:4321/bambi-site/
npm run build    # into dist/
```

Content is Markdown: a plugin's page is `src/content/plugins/<name>.md`, a guideline is
`src/content/guidelines/<name>.md`. The look — palette, type and rules — is the plugins' own, in
`src/styles/global.css`.
