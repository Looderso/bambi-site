---
title: the picker
summary: "Choosing what a thing is: one row of entries, and the chosen one's settings under it."
group: design
order: 27
---

Every panel that offers a choice of *what this thing is* offers it the same way: **one row of entries, and the
settings of the chosen entry under it.** Nothing above the row. A row too long for one line wraps into a grid.

The word *preset* belongs to the preset browser alone and appears on no panel.

## two kinds of entry

A panel has one kind or the other.

| | a kind | a starting point |
|---|---|---|
| example | a region's kind | a named set of values for a whole panel |
| choosing it | shows that kind's own settings; those settings *are* the kind | writes every setting of its panel |
| after an edit | the kind stays chosen: its settings were edited, it was not left | the entry stays marked as where you came from |
| double-click | — | brings its values back |

## custom

Where a second representation exists — a region's weights, a path's nodes — the row ends in
`custom`. It is greyed until one exists, and reached only through **convert to custom**, a button under the
kind's settings:

- it freezes what is there into one static state, which is not a modulation target;
- the kind and its settings are kept underneath: choosing the kind again shows them as they were, and choosing
  `custom` again shows the kept custom;
- converting again replaces the custom. It is one undoable edit, so nothing asks; a line under the button says
  what will be replaced.

A starting point has no second representation and never has a `custom` entry.

## the component

The row is the shared segmented control, with wrapping and a double-click. A starting-point row remembers its
selection in state, because nothing else can say where the values came from once they have been edited.
