#!/usr/bin/env bash
#
# Copies the plugins' and the host's marks from the bambi repository into public/marks/, named by their pages on
# the site: each plugin's under its page's name, and bambi's β, the host's, as host.svg. Run it whenever a mark
# changes; nothing here is drawn by hand.
#
#   scripts/marks.sh [path to the bambi repository]
#
# The repository defaults to ../AETHER beside this one, or $BAMBI.

set -euo pipefail
site=$(cd "$(dirname "$0")/.." && pwd)
repo=${1:-${BAMBI:-$site/../AETHER}}
marks=$(cd "$repo" && pwd)/ui/assets/marks
out=$site/public/marks
mkdir -p "$out"

# the repository's name for a mark, and the site's
for pair in encoder:path-encoder echo:echo reverb:reverb decoder:decoder bambi:host; do
    from=${pair%%:*} to=${pair##*:}
    [ -f "$marks/$from.svg" ] || { echo "no mark at $marks/$from.svg" >&2; exit 1; }
    # without its comments: the repository's may hold "--", which a browser refuses in an SVG
    perl -0pe 's/<!--.*?-->//gs; s/^\s*\n//gm' "$marks/$from.svg" > "$out/$to.svg"
done
echo "marks copied into $out"
