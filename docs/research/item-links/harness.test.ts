// Research harness for #179, "Decide whether cs-tree-item and cs-dropdown-item can be links".
// Throwaway: it proves claims made in docs/research/item-links.md and is not part of the suite. It lives outside
// packages/components/src on purpose, so the suite's `src/**/*.test.ts` glob never picks it up. To re-run it, from
// the repo root:
//
//   cp docs/research/item-links/harness.test.ts packages/components/src/research/item-links.test.ts
//   cp docs/research/item-links/web-test-runner.research.config.js packages/components/
//   cd packages/components && npm run build
//   WTR_CONCURRENCY=1 npx web-test-runner --config web-test-runner.research.config.js
//
// then delete the two copies.
// Each test logs one "[179]" line per finding so the three engines can be compared side by side.
// Links point at #fragments, so "did it navigate" is read from location.hash.
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  aTimeout,
  expect,
  fixture,
  html,
  oneEvent,
  waitUntil,
} from "@open-wc/testing";
import { executeServerCommand, sendKeys } from "@web/test-runner-commands";

type AXNode = {
  role: string;
  name?: string;
  focused?: boolean;
  selected?: boolean;
  expanded?: boolean;
  level?: number;
  children?: AXNode[];
};

const engine = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) {
    return "firefox";
  }
  if (ua.includes("Chrome")) {
    return "chromium";
  }
  return "webkit";
};

const log = (finding: string, value: unknown) =>
  // eslint-disable-next-line no-console
  console.log(
    `[179] ${engine()} | ${finding} | ${typeof value === "string" ? value : JSON.stringify(value)}`,
  );

const resetHash = () =>
  history.replaceState(null, "", location.pathname + location.search);

/**
 * Takes a full-page accessibility snapshot and returns the first node matching `role` (and `name`, if given).
 * A root selector is not used: Playwright returns null when the root element has no node of its own, and the
 * command then reports itself as unknown.
 */
async function snapshot(role: string, name?: string) {
  const page = await executeServerCommand<AXNode, Record<string, never>>(
    "a11y-snapshot",
    {},
  );
  const find = (node: AXNode): AXNode | null => {
    if (node.role === role && (name === undefined || node.name === name)) {
      return node;
    }
    for (const child of node.children ?? []) {
      const found = find(child);
      if (found) {
        return found;
      }
    }
    return null;
  };
  return find(page);
}

/** Flattens an accessibility snapshot into one indented line per node, for logging. */
function outline(node: AXNode | null, depth = 0): string {
  if (!node) {
    return "(null)";
  }
  const flags = [
    node.focused ? "focused" : "",
    node.selected ? "selected" : "",
    node.expanded !== undefined ? `expanded=${node.expanded}` : "",
    node.level !== undefined ? `level=${node.level}` : "",
  ]
    .filter(Boolean)
    .join(",");
  const self = `${"  ".repeat(depth)}${node.role}${node.name ? ` "${node.name}"` : ""}${flags ? ` [${flags}]` : ""}`;
  return [
    self,
    ...(node.children ?? []).map((child) => outline(child, depth + 1)),
  ].join(" / ");
}

async function axeViolations(el: Element) {
  // chai-a11y-axe loads axe onto window; reuse it so the result is the same axe the suite runs.
  if (!(window as any).axe) {
    await import("axe-core/axe.min.js" as any);
  }
  const results = await (window as any).axe.run(el);
  return results.violations.map((violation: any) => violation.id);
}

/** Presses Tab until focus leaves `container` or `limit` presses pass, and lists every stop on the way. */
async function tabStops(start: HTMLElement, end: HTMLElement, limit = 12) {
  start.focus();
  const stops: string[] = [];
  for (let i = 0; i < limit; i++) {
    await sendKeys({ press: "Tab" });
    const active = document.activeElement as HTMLElement | null;
    if (!active || active === end) {
      break;
    }
    stops.push(`${active.localName}${active.id ? `#${active.id}` : ""}`);
  }
  return stops;
}

//
// Throwaway prototypes of the two "inner <a>" shapes. They are deliberately tiny: just enough DOM and ARIA to
// show what each shape exposes to the accessibility tree and how Enter behaves, without touching a component.
//

/** Shape A1: the host keeps role="menuitem" (or treeitem) and focus; the inner <a> is tabindex="-1". */
class ProtoHostRole extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<a href="${this.getAttribute("href")}" tabindex="-1"><slot></slot></a>`;
      this.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          root.querySelector("a")!.click();
        }
      });
    }
    this.setAttribute("role", this.getAttribute("data-role") ?? "menuitem");
    this.tabIndex = 0;
  }
}

/** Shape A2: the host has no role; the inner <a> carries role="menuitem" (or treeitem) and gets focus. */
class ProtoInnerRole extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open", delegatesFocus: true });
      root.innerHTML = `<a href="${this.getAttribute("href")}" role="${this.getAttribute("data-role") ?? "menuitem"}" tabindex="0"><slot></slot></a>`;
    }
  }
}

/**
 * Shape A2 for a tree parent: the inner <a role="treeitem"> and the nested group are siblings in the shadow root,
 * because a link cannot contain the nested items. `data-owns` adds aria-owns from the link to the group.
 */
class ProtoInnerTreeParent extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open", delegatesFocus: true });
      const owns = this.hasAttribute("data-owns") ? 'aria-owns="group"' : "";
      root.innerHTML = `
        <a href="${this.getAttribute("href")}" role="treeitem" aria-expanded="true" tabindex="0" ${owns}><slot name="label"></slot></a>
        <div role="group" id="group"><slot></slot></div>`;
    }
  }
}

/**
 * Shape U, Web Awesome 3.12.0+'s: the host keeps role="menuitem" and focus, and an empty, aria-hidden <a> in the shadow
 * root is clicked synthetically, copying the modifier keys of the event that selected the item.
 */
class ProtoHiddenLink extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<a id="link" href="${this.getAttribute("href")}" tabindex="-1" aria-hidden="true"></a><slot></slot>`;
      this.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          root.querySelector("a")!.dispatchEvent(
            new MouseEvent("click", {
              bubbles: false,
              cancelable: true,
              composed: false,
              altKey: event.altKey,
              ctrlKey: event.ctrlKey,
              metaKey: event.metaKey,
              shiftKey: event.shiftKey,
            }),
          );
        }
      });
    }
    this.setAttribute("role", "menuitem");
    this.tabIndex = 0;
  }
}

/** True when the browser's hit test at the centre of `el` lands inside an <a href>, in any tree. */
function linkUnderPointer(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const roots: (Document | ShadowRoot)[] = [
    document,
    ...(el.shadowRoot ? [el.shadowRoot] : []),
  ];
  return roots.some((root) =>
    root.elementsFromPoint(x, y).some((hit) => hit.closest("a[href]")),
  );
}

/** Mirrors cs-dropdown's topology: role="menu" is inside the shadow root and the items arrive through a slot. */
class ProtoSlottedMenu extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<div role="menu" aria-label="${this.getAttribute("data-label")}"><slot></slot></div>`;
    }
  }
}

customElements.define("proto-slotted-menu", ProtoSlottedMenu);
customElements.define("proto-hidden-link", ProtoHiddenLink);
customElements.define("proto-host-role", ProtoHostRole);
customElements.define("proto-inner-role", ProtoInnerRole);
customElements.define("proto-inner-tree-parent", ProtoInnerTreeParent);

describe("#179 research: item links", () => {
  beforeEach(resetHash);
  afterEach(resetHash);

  describe("today: an <a> slotted into cs-dropdown-item", () => {
    const menu = () => html`
      <section id="dd-region" aria-label="Dropdown harness">
        <cs-dropdown id="dd">
          <cs-button slot="trigger">Menu</cs-button>
          <cs-dropdown-item id="dd-one"
            ><a id="dd-link" href="#dd-slotted"
              >Slotted link</a
            ></cs-dropdown-item
          >
          <cs-dropdown-item value="two">Plain item</cs-dropdown-item>
        </cs-dropdown>
      </section>
      <button id="dd-after">After</button>
    `;

    it("Enter on the focused item fires cs-select and closes, but does not follow the link", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div>${menu()}</div>`);
      const dropdown = wrapper.querySelector<any>("#dd");
      const item = wrapper.querySelector<any>("#dd-one");
      dropdown.open = true;
      await oneEvent(dropdown, "cs-after-show");
      await waitUntil(() => document.activeElement === item);

      const selected = oneEvent(dropdown, "cs-select");
      await sendKeys({ press: "Enter" });
      const event = await selected;
      await aTimeout(50);

      log(
        "dropdown slotted: Enter followed link",
        location.hash === "#dd-slotted",
      );
      log("dropdown slotted: cs-select item", event.detail.item.id);
      expect(location.hash).to.equal("");
      expect(event.detail.item).to.equal(item);
    });

    it("a click on the slotted link navigates, and the menu also selects and closes", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div>${menu()}</div>`);
      const dropdown = wrapper.querySelector<any>("#dd");
      dropdown.open = true;
      await oneEvent(dropdown, "cs-after-show");

      const selected = oneEvent(dropdown, "cs-select");
      wrapper.querySelector<HTMLAnchorElement>("#dd-link")!.click();
      await selected;
      await aTimeout(50);

      log(
        "dropdown slotted: click followed link",
        location.hash === "#dd-slotted",
      );
      log("dropdown slotted: open after click", dropdown.open);
      expect(location.hash).to.equal("#dd-slotted");
      expect(dropdown.open).to.be.false;
    });

    it("Tab from the focused item", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div>${menu()}</div>`);
      const dropdown = wrapper.querySelector<any>("#dd");
      const item = wrapper.querySelector<any>("#dd-one");
      dropdown.open = true;
      await oneEvent(dropdown, "cs-after-show");
      await waitUntil(() => document.activeElement === item);

      await sendKeys({ press: "Tab" });
      await aTimeout(50);
      const active = document.activeElement as HTMLElement;
      log(
        "dropdown slotted: focus after Tab",
        `${active?.localName}#${active?.id}`,
      );
    });

    it("control: Tab from an open menu of plain items", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div>
          <cs-dropdown id="dd-plain">
            <cs-button slot="trigger">Menu</cs-button>
            <cs-dropdown-item id="dd-plain-one">Plain one</cs-dropdown-item>
            <cs-dropdown-item>Plain two</cs-dropdown-item>
          </cs-dropdown>
          <button id="dd-plain-after">After</button>
        </div>
      `);
      const dropdown = wrapper.querySelector<any>("#dd-plain");
      const item = wrapper.querySelector<any>("#dd-plain-one");
      dropdown.open = true;
      await oneEvent(dropdown, "cs-after-show");
      await waitUntil(() => document.activeElement === item);

      await sendKeys({ press: "Tab" });
      await aTimeout(50);
      const active = document.activeElement as HTMLElement;
      log(
        "dropdown control (no link): focus after Tab",
        `${active?.localName}#${active?.id}`,
      );
    });

    it("accessibility tree and axe with the menu open", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div>${menu()}</div>`);
      const dropdown = wrapper.querySelector<any>("#dd");
      dropdown.open = true;
      await oneEvent(dropdown, "cs-after-show");

      log("dropdown slotted: a11y tree", outline(await snapshot("menu")));
      log("dropdown slotted: axe violations", await axeViolations(dropdown));
    });
  });

  describe("today: an <a> slotted into cs-tree-item", () => {
    const tree = () => html`
      <button id="tree-before">Before</button>
      <cs-tree id="tree">
        <cs-tree-item id="ti-one"
          ><a id="ti-link-one" href="#tree-one">One</a></cs-tree-item
        >
        <cs-tree-item id="ti-two"
          ><a id="ti-link-two" href="#tree-two">Two</a></cs-tree-item
        >
        <cs-tree-item id="ti-three"
          ><a id="ti-link-three" href="#tree-three">Three</a></cs-tree-item
        >
      </cs-tree>
      <button id="tree-after">After</button>
    `;

    it("Enter on the focused item selects it and does not follow the link", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div>${tree()}</div>`);
      const item = wrapper.querySelector<any>("#ti-one");
      await item.updateComplete;
      item.focus();
      await sendKeys({ press: "Enter" });
      await aTimeout(50);

      log("tree slotted: Enter followed link", location.hash === "#tree-one");
      log("tree slotted: Enter selected item", item.selected);
      expect(location.hash).to.equal("");
      expect(item.selected).to.be.true;
    });

    it("Tab from the focused item reaches the link, and Enter there navigates", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div>${tree()}</div>`);
      const item = wrapper.querySelector<any>("#ti-one");
      await item.updateComplete;
      item.focus();
      await sendKeys({ press: "Tab" });
      const active = document.activeElement as HTMLElement;
      log(
        "tree slotted: focus after Tab from item",
        `${active?.localName}#${active?.id}`,
      );

      if (engine() === "webkit") {
        // macOS leaves links out of the Tab sequence unless "Press Tab to highlight each item" is on; Option+Tab
        // reaches them regardless.
        item.focus();
        await sendKeys({ press: "Alt+Tab" });
        const altActive = document.activeElement as HTMLElement;
        log(
          "tree slotted: focus after Option+Tab from item",
          `${altActive?.localName}#${altActive?.id}`,
        );
      }

      if (active?.id === "ti-link-one") {
        await sendKeys({ press: "Enter" });
        await aTimeout(50);
        log(
          "tree slotted: Enter on focused link followed it",
          location.hash === "#tree-one",
        );
        log("tree slotted: Enter on focused link selected item", item.selected);
      }
    });

    it("counts the Tab stops through a tree of three linked items", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div>${tree()}</div>`);
      await wrapper.querySelector<any>("#ti-three").updateComplete;
      const stops = await tabStops(
        wrapper.querySelector<HTMLElement>("#tree-before")!,
        wrapper.querySelector<HTMLElement>("#tree-after")!,
      );
      log("tree slotted: Tab stops", stops);
    });

    it("after ArrowDown to item two, Tab reaches item two's link", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div>${tree()}</div>`);
      const one = wrapper.querySelector<any>("#ti-one");
      const two = wrapper.querySelector<any>("#ti-two");
      await two.updateComplete;
      one.focus();
      await sendKeys({ press: "ArrowDown" });
      await waitUntil(() => document.activeElement === two);
      log(
        "tree slotted: tabindex of item one / item two after ArrowDown",
        `${one.getAttribute("tabindex")} / ${two.getAttribute("tabindex")}`,
      );
      await sendKeys({ press: "Tab" });
      const active = document.activeElement as HTMLElement;
      log(
        "tree slotted: focus after ArrowDown then Tab",
        `${active?.localName}#${active?.id}`,
      );
    });

    it("a click on the slotted link navigates and also selects the item", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div>${tree()}</div>`);
      const item = wrapper.querySelector<any>("#ti-two");
      await item.updateComplete;
      const link = wrapper.querySelector<HTMLAnchorElement>("#ti-link-two")!;
      link.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, composed: true }),
      );
      link.click();
      await aTimeout(50);

      log("tree slotted: click followed link", location.hash === "#tree-two");
      log("tree slotted: click selected item", item.selected);
    });

    it("accessibility tree and axe", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div>${tree()}</div>`);
      await wrapper.querySelector<any>("#ti-three").updateComplete;
      log("tree slotted: a11y tree", outline(await snapshot("tree")));
      log(
        "tree slotted: axe violations",
        await axeViolations(wrapper.querySelector("#tree")!),
      );
    });
  });

  describe('prototype A1: role and focus on the host, inner <a tabindex="-1">', () => {
    it("menu: accessibility tree, axe, and Enter", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div role="menu" id="a1-menu" aria-label="A1">
          <proto-host-role id="a1-one" href="#a1-one"
            >Host role one</proto-host-role
          >
          <proto-host-role href="#a1-two">Host role two</proto-host-role>
        </div>
      `);
      const item = wrapper.querySelector<HTMLElement>("#a1-one")!;
      item.focus();
      log("A1 menu: a11y tree", outline(await snapshot("menu", "A1")));
      log("A1 menu: axe violations", await axeViolations(wrapper));

      await sendKeys({ press: "Enter" });
      await aTimeout(50);
      log(
        "A1 menu: Enter followed link (via JS click())",
        location.hash === "#a1-one",
      );
    });

    it("tree: accessibility tree and axe", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div role="tree" id="a1-tree" aria-label="A1 tree">
          <proto-host-role data-role="treeitem" href="#a1-t1"
            >Host treeitem one</proto-host-role
          >
          <proto-host-role data-role="treeitem" href="#a1-t2"
            >Host treeitem two</proto-host-role
          >
        </div>
      `);
      log("A1 tree: a11y tree", outline(await snapshot("tree", "A1 tree")));
      log("A1 tree: axe violations", await axeViolations(wrapper));
    });
  });

  describe("prototype A2: no role on the host, role and focus on the inner <a>", () => {
    it("menu: accessibility tree, axe, and native Enter", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div role="menu" id="a2-menu" aria-label="A2">
          <proto-inner-role id="a2-one" href="#a2-one"
            >Inner role one</proto-inner-role
          >
          <proto-inner-role href="#a2-two">Inner role two</proto-inner-role>
        </div>
      `);
      const item = wrapper.querySelector<HTMLElement>("#a2-one")!;
      item.focus();
      const inner = item.shadowRoot!.activeElement;
      log(
        "A2 menu: host.focus() lands on",
        `${inner?.localName}[role=${inner?.getAttribute("role")}]`,
      );
      log("A2 menu: a11y tree", outline(await snapshot("menu", "A2")));
      log("A2 menu: axe violations", await axeViolations(wrapper));

      await sendKeys({ press: "Enter" });
      await aTimeout(50);
      log("A2 menu: native Enter followed link", location.hash === "#a2-one");
      expect(location.hash).to.equal("#a2-one");
    });

    it('menu in cs-dropdown\'s topology (role="menu" in a shadow root, items slotted)', async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <proto-slotted-menu data-label="A2 slotted">
          <proto-inner-role id="a2s-one" href="#a2s-one"
            >Slotted inner one</proto-inner-role
          >
          <proto-inner-role href="#a2s-two">Slotted inner two</proto-inner-role>
        </proto-slotted-menu>
      `);
      wrapper.querySelector<HTMLElement>("#a2s-one")!.focus();
      log(
        "A2 slotted menu: a11y tree",
        outline(await snapshot("menu", "A2 slotted")),
      );
      log("A2 slotted menu: axe violations", await axeViolations(wrapper));
      await sendKeys({ press: "Enter" });
      await aTimeout(50);
      log(
        "A2 slotted menu: native Enter followed link",
        location.hash === "#a2s-one",
      );
    });

    it("a document keydown listener that cancels Enter, as cs-dropdown's does, blocks the native link", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <proto-slotted-menu data-label="A2 cancelled">
          <proto-inner-role id="a2c-one" href="#a2c-one"
            >Cancelled one</proto-inner-role
          >
        </proto-slotted-menu>
      `);
      const cancelEnter = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      };
      document.addEventListener("keydown", cancelEnter);
      try {
        wrapper.querySelector<HTMLElement>("#a2c-one")!.focus();
        await sendKeys({ press: "Enter" });
        await aTimeout(50);
        log(
          "A2 with Enter cancelled at document: link followed",
          location.hash === "#a2c-one",
        );
      } finally {
        document.removeEventListener("keydown", cancelEnter);
      }
    });

    it("tree parent: is the nested group inside the treeitem, without and with aria-owns?", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div>
          <section id="a2-region" aria-label="A2 no owns">
            <div role="tree" id="a2-tree" aria-label="A2 tree">
              <proto-inner-tree-parent href="#a2-parent">
                <span slot="label">Parent</span>
                <proto-inner-role data-role="treeitem" href="#a2-child"
                  >Child</proto-inner-role
                >
              </proto-inner-tree-parent>
            </div>
          </section>
          <section id="a2-region-owns" aria-label="A2 owns">
            <div role="tree" id="a2-tree-owns" aria-label="A2 tree owns">
              <proto-inner-tree-parent href="#a2-parent-owns" data-owns>
                <span slot="label">Parent owns</span>
                <proto-inner-role data-role="treeitem" href="#a2-child-owns"
                  >Child owns</proto-inner-role
                >
              </proto-inner-tree-parent>
            </div>
          </section>
        </div>
      `);
      log(
        "A2 tree parent, no aria-owns: a11y tree",
        outline(await snapshot("tree", "A2 tree")),
      );
      log(
        "A2 tree parent, aria-owns: a11y tree",
        outline(await snapshot("tree", "A2 tree owns")),
      );
      if (engine() === "webkit") {
        const page = await executeServerCommand<AXNode, Record<string, never>>(
          "a11y-snapshot",
          {},
        );
        log("A2 tree parent: webkit full page", outline(page));
      }
      log("A2 tree parent: axe violations", await axeViolations(wrapper));
    });
  });

  describe("the disclosure navigation alternative for cs-tree", () => {
    it("cs-details with plain text in its summary and links inside", async () => {
      const wrapper = await fixture<HTMLElement>(html`
        <nav aria-label="Disclosure plain">
          <cs-details appearance="plain" summary="Project one" open>
            <a href="#dn-overview" aria-current="page">Overview</a>
            <a href="#dn-work">Work items</a>
          </cs-details>
        </nav>
      `);
      await wrapper.querySelector<any>("cs-details").updateComplete;
      log(
        "disclosure, text summary: axe violations",
        await axeViolations(wrapper),
      );
    });

    it("cs-details with a link and a button in its summary, as Flightdeck's sidebar rows have", async () => {
      const wrapper = await fixture<HTMLElement>(html`
        <nav aria-label="Disclosure link summary">
          <cs-details appearance="plain" open>
            <span slot="summary"
              ><a href="#dn-project">Project one</a>
              <cs-button appearance="plain" size="xs"
                ><cs-icon name="star" label="Favorite"></cs-icon></cs-button
            ></span>
            <a href="#dn-overview-2">Overview</a>
          </cs-details>
        </nav>
      `);
      await wrapper.querySelector<any>("cs-details").updateComplete;
      log(
        "disclosure, link and button in summary: axe violations",
        await axeViolations(wrapper),
      );
    });
  });

  describe("native link affordances: upstream hidden link (U) vs inner role (A2) vs slotted (today)", () => {
    it("is an <a href> under the pointer over the item?", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div>
          <proto-slotted-menu data-label="Pointer">
            <proto-hidden-link id="ptr-u" href="#ptr-u"
              >Hidden link item</proto-hidden-link
            >
            <proto-inner-role id="ptr-a2" href="#ptr-a2"
              >Inner role item</proto-inner-role
            >
          </proto-slotted-menu>
          <cs-dropdown id="ptr-dd" open>
            <cs-button slot="trigger">Menu</cs-button>
            <cs-dropdown-item id="ptr-slotted"
              ><a href="#ptr-slotted">Slotted link item</a></cs-dropdown-item
            >
          </cs-dropdown>
        </div>
      `);
      const dropdown = wrapper.querySelector<any>("#ptr-dd");
      await dropdown.updateComplete;
      await aTimeout(300);
      log(
        "pointer: U hidden link under pointer",
        linkUnderPointer(wrapper.querySelector<HTMLElement>("#ptr-u")!),
      );
      log(
        "pointer: A2 inner role link under pointer",
        linkUnderPointer(wrapper.querySelector<HTMLElement>("#ptr-a2")!),
      );
      log(
        "pointer: slotted link under pointer (centre of item)",
        linkUnderPointer(wrapper.querySelector<HTMLElement>("#ptr-slotted")!),
      );
    });

    // Modifier keys can open a new tab, and a new tab on a #fragment of this page would boot the test page again, which
    // the runner reads as a reload. So these run in a same-origin srcdoc iframe: navigating in place changes the
    // iframe's hash, and a new tab opens about:srcdoc instead of the test page. The <base> matters: a srcdoc document
    // otherwise resolves "#u" against the parent's URL, and following it loads the test page into the frame. Shadow DOM plays no part in how a
    // browser treats modifier keys, so plain markup stands in for each shape here.
    async function modifierFrame() {
      const frame = await fixture<HTMLIFrameElement>(html`
        <iframe
          srcdoc=${`<!doctype html><base href="about:srcdoc"><div role="menu" aria-label="Modifiers">
            <div role="menuitem" tabindex="0" id="u">Hidden link item<a id="u-link" href="#u" tabindex="-1" aria-hidden="true"></a></div>
            <a role="menuitem" tabindex="0" id="a2" href="#a2">Inner role item</a>
          </div>`}
        ></iframe>
      `);
      await waitUntil(() => frame.contentDocument?.getElementById("u"));
      const doc = frame.contentDocument!;
      const win = frame.contentWindow as Window & typeof globalThis;
      doc
        .getElementById("u")!
        .addEventListener("keydown", (event: KeyboardEvent) => {
          if (event.key === "Enter") {
            doc.getElementById("u-link")!.dispatchEvent(
              new win.MouseEvent("click", {
                bubbles: false,
                cancelable: true,
                composed: false,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey,
              }),
            );
          }
        });
      return { doc, win };
    }

    for (const combo of [
      "Enter",
      "Meta+Enter",
      "Control+Enter",
      "Shift+Enter",
    ]) {
      it(`${combo}: does the frame navigate in place?`, async () => {
        for (const id of ["u", "a2"]) {
          const { doc, win } = await modifierFrame();
          (doc.getElementById(id) as HTMLElement).focus();
          await sendKeys({ press: combo });
          await aTimeout(150);
          log(
            `${combo}: ${id === "u" ? "U" : "A2"} navigated in place`,
            win.location.hash === `#${id}`,
          );
        }
      });
    }
  });
});
