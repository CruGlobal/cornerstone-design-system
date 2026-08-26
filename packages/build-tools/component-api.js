/**
 * The component API reference, read from the Custom Elements Manifest.
 *
 * One extractor, two serializers. `getApiSections()` turns a CEM declaration into an ordered list
 * of plain-data sections; `renderApiMarkdown()` serializes them for the agent files, and the
 * documentation site's remark plugin serializes the same objects into its own tree. Nothing here
 * reads rendered HTML, which is the whole point — the scrape it replaces lost a row's type,
 * default and description into a single cell, and dropped every inline `<code>` after the first.
 *
 * Sections carry an `id` so a consumer can find one without matching heading prose. The old
 * `renderComponentApiTable(section, component)` switched on heading text, and because the layout
 * emits `<h2>API</h2>` with `<h3>` per section, every lookup resolved to "API" and fell through to
 * the scrape. An id cannot fail that way.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { componentsDir } from "./workspace.js";

const moduleDir = dirname(fileURLToPath(import.meta.url));

const sortByName = (a, b) => (a.name || "").localeCompare(b.name || "");

/**
 * Reads the manifest and normalizes every custom element declaration.
 *
 * Ported from the Eleventy site's `docs/_utils/manifest.js`, which dies with that site. The
 * filters are load-bearing rather than cosmetic: dropping members with no description is what
 * keeps undocumented internals out of the reference, and it is applied identically here and in
 * the agent files, so the two never disagree about which rows exist.
 */
export function loadComponents(distDir = process.env.UNBUNDLED_DIST_DIRECTORY) {
  const dir = distDir || join(componentsDir(), "dist", "unbundled");
  const manifest = JSON.parse(
    readFileSync(join(dir, "custom-elements.json"), "utf-8")
  );
  const components = [];

  for (const module of manifest.modules ?? []) {
    for (const declaration of module.declarations ?? []) {
      if (!declaration.customElement) {
        continue;
      }

      const members = declaration.members?.filter(
        (member) => member.description && member.privacy !== "private"
      );

      for (const property of members ?? []) {
        const attribute = declaration.attributes?.find(
          (attr) => attr.fieldName === property.name
        );
        if (attribute) {
          property.attribute = attribute.name || attribute.fieldName;
        }
      }

      components.push({
        ...declaration,
        path: module.path.replace(/^src\//, "dist/").replace(/\.ts$/, ".js"),
        slots: declaration.slots?.slice().sort(sortByName),
        events: declaration.events
          ?.filter((event) => event.name)
          .sort(sortByName),
        cssProperties: declaration.cssProperties?.slice().sort(sortByName),
        cssStates: declaration.cssStates?.slice().sort(sortByName),
        // Deprecated parts sort to the bottom so the supported names read first.
        cssParts: declaration.cssParts
          ?.slice()
          .sort(
            (a, b) =>
              Number(Boolean(a.deprecated)) - Number(Boolean(b.deprecated)) ||
              sortByName(a, b)
          ),
        properties: members
          ?.filter((member) => member.kind === "field")
          .sort(sortByName),
        methods: members
          ?.filter(
            (member) => member.kind === "method" && !member.name.startsWith("#")
          )
          .sort(sortByName),
      });
    }
  }

  // A component's dependency list is expanded recursively, so a page states everything the import
  // pulls in rather than only its direct children.
  for (const component of components) {
    const seen = [];

    const collect = (tag) => {
      const match = components.find((candidate) => candidate.tagName === tag);
      for (const dependency of match?.dependencies ?? []) {
        if (!seen.includes(dependency)) {
          seen.push(dependency);
          collect(dependency);
        }
      }
    };

    collect(component.tagName);
    component.dependencies = seen.sort();
  }

  return components.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

/** Finds one component by tag name, and fails loudly rather than rendering an empty reference. */
export function getComponent(components, tagName) {
  const component = components.find(
    (candidate) => candidate.tagName === tagName
  );

  if (!component) {
    throw new Error(
      `Unable to find <${tagName}> in the Custom Elements Manifest. A reference page's file name must match its tag name without the cs- prefix.`
    );
  }

  return component;
}

const oneLine = (value) =>
  String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Prettier 3 wraps a long union across lines with a leading pipe, so a CEM `type.text` arrives as
 * `| 'date'\n | 'email'\n …`. Both parts of that matter: the leading pipe reads as an empty first
 * column, and an embedded newline **ends the table row** — GFM closes the table there and renders the
 * rest as plaintext, silently dropping every property below it. `cs-input`'s `type` is exactly this
 * shape, which cost that page 7 rows. Collapsing to one line is therefore correctness, not tidiness.
 */
const trimPipes = (value) => oneLine(value).replace(/^\s*\|\s*/, "");

/** Every code cell is single-line for the same reason. A default can be a wrapped object literal. */
const code = (value) => ({ code: trimPipes(value) });

/**
 * The API reference for one component, as ordered plain-data sections.
 *
 * Every section carries `id`, `heading`, and — where the guides explain the concept — `learnMore`.
 * A `table` section carries `columns` and `rows`, where each cell is `{ text }`, `{ code }`, or
 * `{ markdown }`; the serializer decides how each renders. Sections with no data are omitted, so a
 * consumer can render the list without re-testing for emptiness.
 *
 * `basePath` prefixes the links this reference emits. It exists because the two consumers serve
 * different URL spaces — the Eleventy site published under `/docs/`, the Astro site does not — and
 * baking either one in here would send every dependency link on 36 pages to a 404. The agent files
 * pass nothing, since they render no hrefs at all.
 */
export function getApiSections(component, { basePath = "" } = {}) {
  const sections = [];
  const has = (list) => Array.isArray(list) && list.length > 0;

  if (has(component.slots)) {
    sections.push({
      id: "slots",
      heading: "Slots",
      learnMore: { text: "using slots", href: `${basePath}/usage/#slots` },
      type: "table",
      columns: ["Name", "Description"],
      rows: component.slots.map((slot) => [
        slot.name ? { code: slot.name } : { text: "(default)" },
        { markdown: oneLine(slot.description) },
      ]),
    });
  }

  if (has(component.properties)) {
    sections.push({
      id: "attributes-and-properties",
      heading: "Attributes & Properties",
      learnMore: {
        text: "attributes and properties",
        href: `${basePath}/usage/#attributes-and-properties`,
      },
      type: "table",
      columns: [
        "Property",
        "Attribute",
        "Description",
        "Type",
        "Default",
        "Reflects",
      ],
      rows: component.properties.map((property) => [
        { code: property.name },
        property.attribute ? { code: property.attribute } : { text: "—" },
        { markdown: oneLine(property.description) },
        property.type?.text ? code(property.type.text) : { text: "—" },
        property.default ? code(property.default) : { text: "—" },
        { text: property.reflects ? "Yes" : "—" },
      ]),
    });
  }

  if (has(component.methods)) {
    sections.push({
      id: "methods",
      heading: "Methods",
      learnMore: { text: "methods", href: `${basePath}/usage/#methods` },
      type: "table",
      columns: ["Name", "Description", "Arguments"],
      rows: component.methods.map((method) => {
        const args = (method.parameters ?? [])
          .map(
            (parameter) =>
              `${parameter.name}: ${
                trimPipes(parameter.type?.text) || "unknown"
              }`
          )
          .join(", ");

        return [
          { code: `${method.name}()` },
          { markdown: oneLine(method.description) },
          args ? code(args) : { text: "—" },
        ];
      }),
    });
  }

  if (has(component.events)) {
    sections.push({
      id: "events",
      heading: "Events",
      learnMore: { text: "events", href: `${basePath}/usage/#events` },
      type: "table",
      columns: ["Name", "Description"],
      rows: component.events.map((event) => [
        { code: event.name },
        { markdown: oneLine(event.description) },
      ]),
    });
  }

  if (has(component.cssProperties)) {
    sections.push({
      id: "css-custom-properties",
      heading: "CSS Custom Properties",
      learnMore: {
        text: "CSS custom properties",
        href: `${basePath}/usage/#custom-properties`,
      },
      type: "table",
      columns: ["Name", "Description", "Default"],
      rows: component.cssProperties.map((property) => [
        { code: property.name },
        { markdown: oneLine(property.description) },
        property.default ? code(property.default) : { text: "—" },
      ]),
    });
  }

  if (has(component.cssStates)) {
    sections.push({
      id: "custom-states",
      heading: "Custom States",
      learnMore: {
        text: "custom states",
        href: `${basePath}/usage/#custom-states`,
      },
      type: "table",
      columns: ["Name", "Description", "CSS selector"],
      rows: component.cssStates.map((state) => [
        { code: state.name },
        { markdown: oneLine(state.description) },
        { code: `:state(${state.name})`, copyable: true },
      ]),
    });
  }

  if (has(component.cssParts)) {
    sections.push({
      id: "css-parts",
      heading: "CSS Parts",
      learnMore: { text: "CSS parts", href: `${basePath}/usage/#css-parts` },
      type: "table",
      // The anatomy diagram reads its part list out of this table's rows, so each row states
      // whether it is deprecated. component-anatomy.js highlights only the supported names.
      anatomy: true,
      columns: ["Name", "Description", "CSS selector"],
      rows: component.cssParts.map((part) => {
        const row = [
          { code: part.name },
          { markdown: oneLine(part.description) },
          { code: `::part(${part.name})`, copyable: true },
        ];
        row.name = part.name;
        row.deprecated = Boolean(part.deprecated);
        return row;
      }),
    });
  }

  if (has(component.dependencies)) {
    sections.push({
      id: "dependencies",
      heading: "Dependencies",
      description:
        "This component automatically imports the following elements. Sub-dependencies, if any exist, are included in this list.",
      type: "links",
      items: component.dependencies.map((tag) => ({
        code: `<${tag}>`,
        href: `${basePath}/components/${tag.replace(/^cs-/, "")}`,
      })),
    });
  }

  if (has(component.ssr)) {
    sections.push({
      id: "ssr",
      heading: "SSR",
      learnMore: {
        text: "Server-Side Rendering (SSR)",
        href: `${basePath}/ssr`,
      },
      type: "prose",
      // These are authored as markdown in an @ssr JSDoc tag and must stay markdown.
      body: component.ssr.map((note) => note.description).join("\n\n"),
    });
  }

  return sections;
}

/** Escapes a cell so a pipe in a type union cannot break the table it sits in. */
const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|");

const cellToMarkdown = (cell) => {
  if (cell.code !== undefined) {
    return "`" + escapeCell(cell.code) + "`";
  }
  return escapeCell(cell.markdown ?? cell.text) || "—";
};

/**
 * The API reference as markdown, for the agent files.
 *
 * Slots deliberately render as a list rather than a table, with the valid names stated plainly:
 * losing slot names is the failure that makes language models invent slots like `slot="main"`.
 */
export function renderApiMarkdown(component, { headingLevel = 2 } = {}) {
  const heading = "#".repeat(headingLevel);
  const out = [];

  for (const section of getApiSections(component)) {
    out.push(`${heading} ${section.heading}`, "");

    if (section.id === "slots") {
      out.push(
        "Valid slot names for this component (use exactly these — any other `slot` value is silently ignored and the element falls back to the default slot):",
        ""
      );
      for (const [name, description] of section.rows) {
        const label = name.code ? "`" + name.code + "`" : "`(default)`";
        out.push(`- ${label} — ${description.markdown || "No description."}`);
      }
      out.push("");
      continue;
    }

    if (section.type === "table") {
      out.push(
        "| " + section.columns.join(" | ") + " |",
        "| " + section.columns.map(() => "---").join(" | ") + " |",
        ...section.rows.map(
          (row) => "| " + row.map(cellToMarkdown).join(" | ") + " |"
        ),
        ""
      );
      continue;
    }

    if (section.type === "links") {
      out.push(...section.items.map((item) => `- \`${item.code}\``), "");
      continue;
    }

    out.push(section.body, "");
  }

  return out.join("\n").trim();
}
