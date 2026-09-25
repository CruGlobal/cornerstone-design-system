#!/bin/sh
# SessionStart hook: tells Claude when the project it opened uses Cornerstone Components, so the
# session loads the `cornerstone-design` skill before UI work instead of rebuilding the design
# system in custom CSS.
#
# Why a hook and not only the skills' descriptions: a skill loads when Claude decides the request
# matches it, and "port this shell" or "fix the nav" does not read as a design request. The hook
# states the fact up front, once, from the project's own manifest.
#
# Contract: stay silent and exit 0 unless the answer is certain. No manifest, no dependency, a file
# we cannot read or a version we cannot parse all print nothing. It must never block a session, so
# every failure path falls through to `exit 0`.
#
# POSIX sh with no jq and no node, because it runs on every session in every project that has the
# plugin enabled, including ones with neither installed.

PKG='@cruglobal/cornerstone-components'

# Nothing this script could say on stderr helps the person starting a session.
exec 2>/dev/null

# The working directory Claude reports on stdin follows `cd` and worktrees, so prefer it. Parsed
# with sed rather than a JSON tool, so anything unusual (escaped characters) falls back to $PWD.
input=$(cat 2>/dev/null)
cwd=$(printf '%s' "$input" | sed -n 's/.*"cwd"[[:space:]]*:[[:space:]]*"\([^"\\]*\)".*/\1/p' | head -n 1)
[ -n "$cwd" ] && [ -d "$cwd" ] || cwd=$PWD

root=$(git -C "$cwd" rev-parse --show-toplevel 2>/dev/null) || root=''

# Inside Cornerstone's own workspace this is contributor context, not a consumer (the docs package
# depends on the library). Same test Daniel uses: a root manifest named `cornerstone` with workspaces.
if [ -n "$root" ] && [ -f "$root/package.json" ] &&
  grep -q '"name"[[:space:]]*:[[:space:]]*"cornerstone"' "$root/package.json" 2>/dev/null &&
  grep -q '"workspaces"' "$root/package.json" 2>/dev/null; then
  exit 0
fi

# The quoted name followed by a colon is a dependency entry; the library's own manifest has it only
# as `"name": "..."`, which this does not match.
declares() {
  [ -f "$1/package.json" ] && grep -q "\"$PKG\"[[:space:]]*:" "$1/package.json" 2>/dev/null
}

if declares "$cwd"; then
  manifest_dir=$cwd
elif [ -n "$root" ] && declares "$root"; then
  manifest_dir=$root
else
  exit 0
fi

# Only characters a version or range can hold, so nothing we splice into the JSON needs escaping.
clean() {
  printf '%s' "$1" | tr -d '\r' | grep -E '^[0-9A-Za-z.+~^<>=|*_ -]+$' 2>/dev/null
}

# The installed version wins over the declared range, because that is the copy of the skills on disk.
# Hoisted installs put node_modules at the workspace root, so check there too.
version=''
for dir in "$cwd" "$manifest_dir" "$root"; do
  [ -n "$dir" ] || continue
  installed="$dir/node_modules/$PKG/package.json"
  if [ -f "$installed" ]; then
    raw=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$installed" 2>/dev/null | head -n 1)
    version=$(clean "$raw")
    [ -n "$version" ] && label="v$version" && break
  fi
done

if [ -z "$version" ]; then
  raw=$(sed -n "s#.*\"$PKG\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*#\\1#p" "$manifest_dir/package.json" 2>/dev/null | head -n 1)
  version=$(clean "$raw")
  [ -n "$version" ] || exit 0
  label="$version (declared in package.json, not installed)"
fi

# Factual statements rather than commands: Claude Code's hook docs note that text framed as system
# instructions can trip prompt-injection defenses and get surfaced to the user instead of used.
context="This project uses Cornerstone Components ($PKG) $label, Cru's cs-* web component library. The cornerstone plugin provides two skills for it: cornerstone-design (how to build UI with the system: layout with cs-page and layout utilities, theming, composition) and cornerstone (component APIs: attributes, slots, events, parts). This project's convention is to load the cornerstone-design skill before any UI work, including views, layouts, navigation and styling, and to use the cornerstone skill for component API questions. The design-system-first order is: an existing cs-* component (cs-icon, not an inline SVG), then a layout utility (cs-stack, cs-cluster, cs-split, cs-grid, cs-flank, with companions such as cs-align-items-* and cs-gap-*), then a --cs-* token, then the component's styling API, and custom CSS only for what none of those cover."

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$context"
exit 0
