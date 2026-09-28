---
title: the look
summary: "One family: a user who knows one plugin reads the others without learning them again."
group: design
order: 29
---

The look serves one purpose: **a musician who knows one bambi plugin can read the next without learning it
again.** Everything below is a rule a new control, panel or plugin is checked against.

## one file for the look

Every colour, type size, stroke, radius and spacing is a named role in the theme file,
`ui/include/bambi/ui/Theme.h`. `tools/check-style.sh` fails on a literal anywhere else. A plugin uses the file;
it never copies it.

The style is Otl Aicher's and the HfG Ulm's: a light ground, black line work, structure by rules and alignment,
lowercase labels, tabular figures, no rounding, no shadows, no gradients.

## colour has meaning

Colour is never decoration. Each colour is a role:

| on the controls | |
|---|---|
| the plugin's own colour | modulation, a source's signal, a selected row |
| orange | where the engine has a value now |
| grey | what cannot be chosen right now |
| silver | other instances |

| in the scene | |
|---|---|
| orange | what came into the plugin |
| blue | what the plugin added |

The two sets are separate roles, so changing one never moves the other.

## one sign for chosen

Every tab and every choice draws the chosen option the same way: **a black block with light text.** The other
options are black text. No frame, no underline, no lines between options. Grey means only that something
cannot be chosen. A toggle is filled when on and outlined when off. Settings and the preset browser, while
open, are drawn the same way in the header.

## controls

- **One bar for every value.** One height and one fill rule. A value with a sign fills from its zero, with a
  tick there, so a centred value reads as centred.
- **A value is one box.** Drag it to set it, click it to give it a matrix row, double-click it for its default.
- **A value says what you set; a mark says where the engine has it now.** The number and the fill are the
  parameter, what is saved and automated. A mark in the live colour shows where modulation or a rate has
  carried it, and is not drawn when nothing moves it.
- **Double-clicking an angle returns it to exactly zero**, clearing any turn a rate has added.
- **Free and synced timing are both drawn**, the one not in use greyed and inert, never replaced. Swing takes
  its own row beneath, greyed when free.
- **A box is named for what its number is**, and a name is unique within its panel. In a free/synced pair, the
  free box names the quantity and the synced box the musical unit: `rate` and `division`, `time` and `steps`.
- **A row can act as a tab**, marked by a bar in the plugin's own colour down its left edge. A control inside
  the row outranks it: a drag edits the value and never selects, and a switch that silences something can be
  reached without opening it.
- **Grey what one click restores; remove what can never become relevant.**

## pages

- **Tabs are organised by what each thing acts on.**
- **A page opens with its main selector**, with no title or description above it.
- **State left, rate right**: a value and the rate that moves it share a row.
- Panels scroll under their tab bar.

## the frame

- **Header**: the mark and the plugin's name, undo and redo, the instances of that plugin as tabs, then preset,
  link and settings.
- **Scene** top left, globe and equirect. **Matrix** under it. **The plugin's tabs** on the right, with the
  footer under them. **Levels** at the far right, over the output meter.
- **Settings is a page, not a tab**, opened from the header: the same frame in every plugin, with the plugin's
  own beside it.
- **The plugin's own colour** is worn on the header's and the footer's rules, so a window says which plugin it
  is.
- **A text field hands the keyboard back** on return and escape, because the next key after naming a track is
  usually the host's space bar.
