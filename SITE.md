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
| **contribute** | `/contribute`, `/contribute/<guideline>` | how to work on bambi, and how it is designed | `src/content/guidelines/*.md` |
| **download** | `/download` | the newest release, the systems as tabs with the visitor's chosen, and how to install | `src/pages/download.astro` |
| **about** | `/about` | what bambi is, the people who inspired and helped it, its licence and its notices | `src/pages/about.astro` |

Two pages are not in the header:

- **the front page** (`/`): what bambi is for, a picture of a window, and where to go next. It repeats no
  section; it points to them.
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
- **A guideline** is a rule a change is held to, or how part of bambi is designed, in two groups: *working on
  bambi* and *how bambi is designed*. It states rules, not the findings that led to them.
- **status** holds everything that changes with each release: what has been tried where, what does not work
  yet, and what is planned once it is decided. Other pages state how bambi is, and leave what is not done yet
  to status. A host joins its table only once bambi has been tried in it.

## Rules for the text

- **No names, no dates, no history.** Text says how bambi is, in the present tense. The only names are credits:
  authors on foundations and in a research page's references, and the people thanked on about, each with their
  agreement. Text never says who decided something, never gives a date, a decision number or a reference to a private document, and never says what
  something used to be.
- **Only plugin pages, the host's page, research pages and tutorials name plugins.** Everywhere else a plugin is described by its role — a
  source plugin, a field effect, a send, a return — so a new plugin needs a new page and nothing else changes.
- **A control's name is its name in the plugin.** Check it against the plugin's code, not against a document.
- **Every claim is checked against the code.** A number on the site came from the code or from a run.
- **Colours are named by what they mean**: the plugin's own colour, orange for what is live or what came in,
  blue for what a plugin adds. Never by hue alone, since the palette may change.
- **Write for the reader of that section**: musicians on plugins, tutorial, tools and download; people who
  write code on contribute. Say each thing once; link to the page that owns it instead of repeating it.

## Rules for the look

The site wears the plugins' look: a light ground, black line work, lowercase labels, rules and alignment
rather than boxes, no rounding, no shadows.

- **Colours, sizes and spacing are variables** in `src/styles/global.css`. A page uses the variables and the
  shared classes (`label`, `fine`, `prose`, `lede`), never a literal colour.
- **Chosen is a black block with light text**: the open section in the header, the part being read in a
  page's contents, a chosen option in a tool.
- **A page opens the same way**: a small label linking back to its section (on a page inside one), the title,
  then a grey line or a lede saying what the page is.
- **A list of pages to go to is cards** (`src/components/Cards.astro`): tiles for a few entries that each
  deserve weight, rows for a longer list read in order. A plugin's card wears its colour.
- **A long page keeps its contents under the header**, as a second row of tabs that marks the part being read.
- **Code is ink on the panel colour**, with no highlighting, and every block in prose has a copy button.
- **Every page uses `src/layouts/Page.astro`**: `title` and `description` for the browser, `identity` for a
  plugin's own colour on its rules, `wide` for a tool's page, which needs the wider measure.
- **The header stays on screen.** Anything else that stays on screen sits below it (`var(--header)`).
- **Every page works at phone width**, with no sideways scrolling.

## Pictures

- **Pictures of the plugins come from the plugins.** `scripts/tutorial-pictures.sh` draws every one with the
  plugins' own picture tools, crops it and writes it to `public/tutorial/`. Nothing is drawn or edited by hand.
  A view the tools cannot draw gets a new mode in the tool, in the bambi repository.
- **Run the script again whenever the plugins' window changes**, and commit the pictures with the change.
- **Diagrams** (a tool's measurements, for example) are inline SVG in one shared frame per tool, drawn in
  `currentColor`.

## Links

- **Inside a page's code**, links are built from `import.meta.env.BASE_URL`.
- **Inside Markdown**, links are written from the root: `[the tutorial](/tutorial/the-window)`.
- **An address that moves keeps working**: add the old one to `redirects` in `astro.config.mjs`.

## Adding something

- **A plugin:** a Markdown file in `src/content/plugins/` with its `name`, `summary`, `colour` and `order`. It
  appears on `/plugins` and on its own page. Its tutorial is an entry in `src/lib/tutorials.ts` naming the
  plugin, and a page in `src/pages/tutorial/`.
- **A research page:** a page in `src/pages/research/` and a card on `/research`. Its figures are inline SVG in
  `currentColor`, drawn from the data the result came from.
- **A tutorial:** a page in `src/pages/tutorial/`, and an entry in `src/lib/tutorials.ts` that puts it on
  `/tutorial` in its group and gives it its previous and next. If it needs pictures, add their shots and crops
  to `scripts/tutorial-pictures.sh`.
- **A page read in order** — a guideline, a tutorial — ends with `src/components/PrevNext.astro`.
- **A guideline:** a Markdown file in `src/content/guidelines/` with its `title`, `summary`, `group` and
  `order`. It appears on `/contribute` in its group.
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
| `contribute` | the guidelines |
| `status` | the status page |
| `site` | everything else: the front page, download, about, research, the look, the build |

Bugs in the plugins themselves belong in the [bambi repository](https://github.com/Looderso/bambi/issues).
