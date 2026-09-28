---
title: presets
summary: "The whole sound of one plugin, as a file of your own, loaded as one step of undo."
group: design
order: 26
---

## what a preset is

**The whole sound of one plugin**: every parameter, levels included, the matrix, the sources' settings, the
regions, and the plugin's own state. It is the saved state without what makes an instance *this* instance:

| not in a preset | because |
|---|---|
| the instance's identity: session, id, name | a preset is loaded into an instance |
| which preset it came from | that belongs to the session, not the sound |
| the encoder's input mode | it says what is plugged in, not how it sounds |
| how the scene is looked at | that is never state |

The format is the state's, so it is as tolerant: read by name, a missing key at its default, an unknown one
ignored. A preset made today loads after a parameter is added tomorrow. Another plugin's preset is refused.

## where they live

- **User presets are files**, one to a preset, in a folder per plugin, at most one folder deep. They belong to
  the musician, not to a project: every project sees them.
- **Factory presets are built by the plugin** and have no file. Every plugin's list starts with `default`, the
  patch a fresh instance has.
- **A user preset is a snapshot**: it sounds as it did when saved, whatever changes later.
- **A slash in the name is the folder.** There is no other way to manage folders, and a folder that empties is
  gone.

## the browser

One browser, over the panel, in every plugin, so the scene and the matrix stay in sight while presets are tried.
The search has the keyboard from the moment it opens and gives it back to the host when it closes. One click
loads and the browser stays open. The header's chevrons step through the whole list in order, whatever is
searched or folded, and a `*` says the sound has moved from the preset it names.

**Delete asks**, because it is the one thing an undo does not bring back.

## a load is one undo step

Host parameters are the host's to undo, and everything else is the document's; a preset is both. So a load is
one whole step: undone, it restores the patch, the parameters and the preset's name together.

## where the code is

Once, for every plugin. The naming, the file format, the list, the search and stepping live in the core; the
load, save, rename and delete in the shared processor; the header's cluster and the browser in the shared UI;
the checks run by every plugin's suite. A plugin brings data only: its factory list.
