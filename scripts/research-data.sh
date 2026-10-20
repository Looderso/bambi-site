#!/usr/bin/env bash
#
# Copies the decoder's head model into the site, for the research page's figures to evaluate: the model it ships,
# the KU100 in the same format, and the two timbres (the population's average and the KU100's), from the files
# the model was learned into. Run it whenever the model changes, then scripts/hrtf-check.mjs.
#
#   scripts/research-data.sh [path to the bambi repository]
set -euo pipefail
site=$(cd "$(dirname "$0")/.." && pwd)
repo=$(cd "${1:-${BAMBI:-$site/../AETHER}}" && pwd)
out=$site/public/research/personalisation
mkdir -p "$out"
cp "$repo/core/data/decode/head.json" "$out/head.json"
cp "$repo/core/data/decode/ku100.json" "$out/ku100.json"
python3 - "$repo/prototypes/decoder/sheets/model/generic-hutubs-3d3a.json" "$out/timbre.json" <<'PY'
import json, sys
g = json.load(open(sys.argv[1]))
json.dump({"population": g["average"], "ku100": g["timbreKU100"], "heads": g["heads"]}, open(sys.argv[2], "w"), separators=(",", ":"))
PY
echo "research data, from $repo:"; ls -la "$out" | awk 'NR>1{print "  " $5 "  " $9}'
