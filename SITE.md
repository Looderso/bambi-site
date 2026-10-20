# How bambi.wiki is built

The website at [bambi.wiki](https://bambi.wiki): what each section is for, what belongs where, and the rules
every page follows. Anyone changing the site, person or agent, works from this file. When something new does
not fit a section below, change this file first.

The site is [Astro](https://astro.build), built and published by GitHub Actions on every push to `main`.

```bash
npm ci
npm run dev        # http://localhost:4321
npx astro build    # must pass before a push
```

## Sections

The header lists them in this order.

| section | address | for | source |
|---|---|---|---|
| **plugins** | `/plugins`, `/plugins/<plugin>` | what each plugin does, its tabs, a few things to try | `src/content/plugins/*.md` |
| **host** | `/host` | the application that plays a set through bambi, and the DAWs it works with | `src/pages/host.astro` |
| **tutorial** | `/tutorial`, `/tutorial/<topic>` | how to use bambi, step by step, with pictures | `src/pages/tutorial/<id>.astro`, listed in `src/lib/tutorials.ts` |
| **research** | `/research`, `/research/<topic>` | what bambi found out, written up with its figures; and the work it builds on, credited (`/research/foundations`) | `src/pages/research/` |
| **tools** | `/tools`, `/tools/<tool>` | small things around working with bambi that run in the browser | `src/pages/tools/`, `src/lib/<tool>/` |
| **contribute** | `/contribute` | how to work on bambi, with or without a coding agent, and what every change keeps | `src/pages/contribute/index.astro` |
| **download** | `/download` | the newest release, the systems as tabs with the visitor's chosen, and how to install | `src/pages/download.astro` |
| **about** | `/about` | what bambi is, the people who inspired and helped it, its licence and its notices | `src/pages/about.astro` |

Two pages are not in the header:

- **the front page** (`/`): what bambi is, in one line; its plugins with a picture each, listed from the plugins
  collection; the host with its pictures; and the download. Each part is one screen. It does not list the
  sections again, since the header is always on screen.
- **status** (`/status`): where bambi has been tested, its known gaps, what is planned once it is decided,
  and where to ask for something. Linked from the front page, the download page and the footer.

### What goes where

- **A plugin's page** says what that plugin does and what is its own: its tabs, their sub-pages and what it draws
  on the scene. The window every plugin shares is not shown there; at the bottom, the page leads to its own
  tutorial and to the one for that window.
- **The host's page** is a product page like a plugin's: what the host does and its parts. Which DAWs it works
  with today is stated once there, in a line that links to status; what has been tried where stays on status.
- **A tutorial** shows how to do something. `the window` covers what every plugin shares; every plugin and the
  host has a tutorial of its own, covering only where it departs from that window, and a setup such as head tracking is a page of its own too. Tutorials are
  listed on `/tutorial`.
- **A research page** is written like a short paper: what was found, the data, the method, the figures and the
  references. It states the result; how the work went stays private. The work bambi builds on is credited on
  `/research/foundations`, a person's help on about.
- **A tool** does something: it runs in the visitor's browser and produces something, such as a printable
  file. A tool's code lives in `src/lib/<tool>/`, its page in `src/pages/tools/`, and it is listed on `/tools`.
- **contribute** says on one page what a contributor can expect: how a change goes, what the repository hands
  a coding agent, the few rules every change keeps, and other ways to help. The rules themselves are the bambi
  repository's own files (`AGENTS.md`, `docs/`, the skills and reviewers); the page links to them and never
  copies them, so they are written once.
- **status** holds everything that changes with each release: what has been tried where, what does not work
  yet, and what is planned once it is decided. Other pages state how bambi is, and leave what is not done yet
  to status. A host joins its table only once bambi has been tried in it.

## Rules for the text

- **No names, no dates, no history.** Text says how bambi is, in the present tense. The only names are credits:
  authors on foundations and in a research page's references, and the people thanked on about, each with their
  agreement. Text never says who decided something, never gives a date, a decision number or a reference to a private document, and never says what
  something used to be.
- **Only plugin pages, the host's page, research pages and tutorials name plugins**, and the front page, which
  lists them from the collection. Everywhere else a plugin is described by its role — a
  source plugin, a field effect, a send, a return — so a new plugin needs a new page and nothing else changes.
- **A control's name is its name in the plugin.** Check it against the plugin's code, not against a document.
- **Every claim is checked against the code.** A number on the site came from the code or from a run.
- **Colours are named by what they mean**: the plugin's own colour, orange for what is live or what came in,
  blue for what a plugin adds. Never by hue alone, since the palette may change.
- **Write for the reader of that section**: musicians on plugins, tutorial, tools and download; people who
  write code, with or without an agent, on contribute. Say each thing once; link to the page that owns it instead of repeating it.

## Rules for the look

The site wears the plugins' look: a light ground, black line work, lowercase labels, rules and alignment
rather than boxes, no rounding, no shadows (except a faint one under a product's mark, so it stands off the ground).

- **Colours, sizes and spacing are variables** in `src/styles/global.css`. A page uses the variables and the
  shared classes (`label`, `fine`, `prose`, `lede`), never a literal colour.
- **Chosen is a black block with light text**: the open section in the header, the part being read in a
  page's contents, a chosen option in a tool.
- **A page opens the same way**: a small label linking back to its section (on a page inside one), the title,
  then a grey line or a lede saying what the page is.
- **A list of pages to go to is cards** (`src/components/Cards.astro`): tiles for a few entries that each
  deserve weight, rows for a longer list read in order. A plugin's card wears its colour.
- **Most pages are one of three kinds**, and a new page picks the one its reader needs; the rest — download,
  status, about, a tool — are a single page of their own:
  - **screens**, for a page that shows what something is: the front page, a product page, contribute. It holds
    a `.snap`, and each part is a `.screen` (`src/styles/global.css`): it fills the screen under the header,
    and the page settles on it. A part's text stays short enough to fit one screen, down to a small phone.
    On the first screen a small arrow at the bottom (`src/components/NextScreen.astro`, on every page) says
    there is another screen below, until the page first moves.
  - **a long page**, for one read top to bottom: a tutorial, a research page. It keeps its contents under the
    header, as a second row of tabs that marks the part being read; a research page holds the figure being
    read beside the text on a wide screen.
  - **cards**, for a list of pages to go to: the plugins, the tutorials, research, tools.
- **Code is ink on the panel colour**, with no highlighting, and every block in prose has a copy button.
- **Every page uses `src/layouts/Page.astro`**: `title` and `description` for the browser, `identity` for a
  plugin's own colour on its rules, `wide` for a page that needs the wider measure: a tool's, a product page, the front page.
- **The header stays on screen**, across the whole window: the wordmark at the left edge, the sections at the right,
  in the same place on every page. So does the footer. Anything else that stays on screen sits below the header
  (`var(--header)`).
- **Until bambi is stable, a beta band crosses the bottom-right corner** of every page
  (`src/components/BetaBand.astro`), leading to status; the footer keeps its links clear of it.
- **Every page works at phone width**, with no sideways scrolling.

## Pictures

- **Pictures of the plugins come from the plugins.** `scripts/pictures.sh` draws every one with the
  plugins' own picture tools: the tutorial's crops into `public/tutorial/`, and each product page's whole shots,
  at four times the window's size, into `public/product/<plugin>/`. Nothing is drawn or edited by hand.
  A view the tools cannot draw gets a new mode in the tool, in the bambi repository.
- **Run the script again whenever the plugins' window changes**, and commit the pictures with the change.
- **A product's mark comes from the repository too.** `scripts/marks.sh` copies the plugins' marks and bambi's β,
  the host's, from `ui/assets/marks/` into `public/marks/`, named by their pages; a product page shows it
  beside the name.
- **Diagrams** (a tool's measurements, for example) are inline SVG in one shared frame per tool, drawn in
  `currentColor`.
- **A research page's figures are the model itself**, evaluated in the page from the decoder's own files and drawn
  with Chart.js, loaded by that page alone. `scripts/research-data.sh` copies the files in; `scripts/hrtf-check.mjs`
  holds the page's evaluation (`src/lib/hrtf/model.js`) to the decoder's fixtures. A figure's sliders are the
  decoder's own, and its colours are named by meaning: ink for the model, grey for what it is compared with.
  A figure of a measured head is drawn from the decoder's prototype run as its own page runs it
  (`scripts/research-notches.mjs`), never redrawn by hand; the data it publishes is a database's, credited.
- **Formulas are typeset when the site is built**, with `src/components/Tex.astro` (KaTeX): the page ships the
  result and no script, and a formula that does not parse fails the build. A formula on its own line is numbered
  in reading order and referred to by its number.

## Links

- **Inside a page's code**, links are built from `import.meta.env.BASE_URL`.
- **Inside Markdown**, links are written from the root: `[the tutorial](/tutorial/the-window)`.
- **An address that moves keeps working**: add the old one to `redirects` in `astro.config.mjs`.

## Adding something

- **A plugin:** a Markdown file in `src/content/plugins/` with its `name`, `summary`, `colour` and `order`. It
  appears on `/plugins` and on its own page. Its `parts` make that page a product page
  (`src/components/ProductPage.astro`): each names a shot, a crop in the window's points (1020 × 600), a label,
  a title and a few lines; the shots are added to `scripts/pictures.sh`. Its tutorial is an entry in
  `src/lib/tutorials.ts` naming the plugin, and a page in `src/pages/tutorial/`.
- **A research page:** a page in `src/pages/research/` and a card on `/research`. Its figures are inline SVG in
  `currentColor`, drawn from the data the result came from.
- **A tutorial:** an entry in `src/lib/tutorials.ts` that puts it on `/tutorial` in its group and gives it its
  previous and next. Its page in `src/pages/tutorial/` uses `src/layouts/TutorialPage.astro`: the title, an
  introduction, the whole window, a contents row, then a section per part. Until that page exists,
  `[id].astro` draws the tutorial from its entry, with its `outline`. If it needs pictures, add their shots and crops
  to `scripts/pictures.sh`.
- **A page read in order** — a tutorial — ends with `src/components/PrevNext.astro`.
- **A tool:** its code in `src/lib/<tool>/`, its page in `src/pages/tools/`, and an entry in the list in
  `src/pages/tools/index.astro`. Heavy libraries are loaded only by the tool's page.
- **A device for the tracker clip:** one entry in `presets` in `src/lib/clip/grips.ts`, with its measured
  values. It is listed once it has been printed and fits.

## Issues

An issue takes the label of the part it is about:

| label | for |
|---|---|
| `plugins` | the plugin pages and the host’s page |
| `tutorial` | the tutorials and their pictures |
| `tools` | the tools page and every tool |
| `contribute` | the contribute page |
| `status` | the status page |
| `site` | everything else: the front page, download, about, research, the look, the build |

Bugs in the plugins themselves belong in the [bambi repository](https://github.com/Looderso/bambi/issues).
