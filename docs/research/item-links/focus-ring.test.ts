// Accessibility review harness for #179 (Esther). Throwaway, like harness.test.ts beside it, and run the same way:
//
//   cp docs/research/item-links/focus-ring.test.ts packages/components/src/research/item-links.test.ts
//   cp docs/research/item-links/web-test-runner.research.config.js packages/components/
//   cd packages/components && npm run build
//   WTR_CONCURRENCY=1 npx web-test-runner --config web-test-runner.research.config.js
//
// then delete the two copies. It proves the focus-ring numbers in the "Accessibility ruling" section of
// docs/research/item-links.md: the resolved ring and surface colours per brand and scheme, the ratios between them,
// whether the ring is clipped by the menu at each size, the item's target size, what forced colours (emulated, not a
// real high-contrast environment) does to the ring, whether :focus-visible reaches an inner <a>, and what a disabled
// link exposes in cs-button and cs-pagination. Each finding logs one "[179-a11y]" line.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { aTimeout, expect, fixture, html, oneEvent } from "@open-wc/testing";
import {
  emulateMedia,
  executeServerCommand,
  sendKeys,
} from "@web/test-runner-commands";

type AXNode = {
  role: string;
  name?: string;
  disabled?: boolean;
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
    `[179-a11y] ${engine()} | ${finding} | ${typeof value === "string" ? value : JSON.stringify(value)}`,
  );

//
// Colour resolution. A computed colour can come back as rgb(), oklch() or color(srgb ...), so each one is painted
// onto a 1x1 canvas over the surface behind it and read back as sRGB bytes. That composites any alpha over the real
// surface before the ratio is taken, and treats every colour syntax the same way.
//
const canvas = document.createElement("canvas");
canvas.width = 1;
canvas.height = 1;
const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

function paint(color: string, over: string): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = over;
  ctx.fillRect(0, 0, 1, 1);
  // A colour the canvas cannot parse is ignored silently, which would leave `over` in place and read as 1:1. Paint a
  // sentinel first so an unparsed colour shows up as the sentinel instead.
  ctx.fillStyle = "#010203";
  ctx.fillStyle = color;
  if (ctx.fillStyle === "#010203" && color.replace(/\s/g, "") !== "#010203") {
    throw new Error(`canvas could not parse colour "${color}"`);
  }
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

const hex = ([r, g, b]: [number, number, number]) =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;

function luminance([r, g, b]: [number, number, number]) {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function ratio(a: [number, number, number], b: [number, number, number]) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/** A shape-A2 link item: no role on the host, role and focus on an inner <a>, with the host's styles moved onto it. */
class ProtoLinkItem extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({
        mode: "open",
        delegatesFocus: this.hasAttribute("data-delegates"),
      });
      root.innerHTML = `
        <style>
          :host { display: block; position: relative; isolation: isolate; }
          :host(:focus-within) { z-index: 1; }
          a {
            display: flex; align-items: center; padding: 0.5em 1em;
            border-radius: var(--cs-border-radius-s);
            color: inherit; text-decoration: none; line-height: var(--cs-line-height-condensed);
          }
          a:focus { outline: none; }
          a:focus-visible { outline: var(--cs-focus-ring); background-color: var(--cs-color-neutral-fill-normal); }
        </style>
        <a part="link" role="menuitem" tabindex="-1" href="${this.getAttribute("href")}"><slot></slot></a>`;
    }
  }
  focus(options?: FocusOptions) {
    this.shadowRoot!.querySelector("a")!.focus(options);
  }
}
customElements.define("proto-link-item", ProtoLinkItem);

/** Opens a cs-dropdown, moves focus with the keyboard so :focus-visible applies, and returns what is focused. */
async function openWithKeyboard(dropdown: any) {
  dropdown.open = true;
  await oneEvent(dropdown, "cs-after-show");
  await sendKeys({ press: "ArrowDown" });
  await sendKeys({ press: "ArrowUp" });
  await aTimeout(50);
}

/**
 * Measures the ring on whichever element is focused inside `item`, against the menu it sits in. The item transitions
 * its background and text colour on focus, so this waits for those transitions to finish and measures the settled
 * state, not a frame partway through.
 */
async function measureRing(
  label: string,
  ringEl: HTMLElement,
  menu: HTMLElement,
  textEl: HTMLElement,
) {
  await Promise.all(ringEl.getAnimations().map((animation) => animation.finished));
  const ring = getComputedStyle(ringEl);
  const menuStyle = getComputedStyle(menu);
  const surface = paint(menuStyle.backgroundColor, "#ffffff");
  const focusFill = paint(ring.backgroundColor, hex(surface));
  const ringColor = paint(ring.outlineColor, hex(surface));
  const text = paint(getComputedStyle(textEl).color, hex(focusFill));
  log(`${label}: raw`, {
    outline: `${ring.outlineStyle} ${ring.outlineWidth} ${ring.outlineColor}`,
    offset: ring.outlineOffset,
    menuBackground: menuStyle.backgroundColor,
    focusBackground: ring.backgroundColor,
  });
  log(`${label}: resolved`, {
    ring: hex(ringColor),
    surface: hex(surface),
    focusFill: hex(focusFill),
    text: hex(text),
  });
  log(`${label}: ratios`, {
    ringVsSurface: ratio(ringColor, surface),
    ringVsFocusFill: ratio(ringColor, focusFill),
    textVsFocusFill: ratio(text, focusFill),
  });
  return { ringVsSurface: ratio(ringColor, surface) };
}

function ringClearance(ringEl: HTMLElement, menu: HTMLElement) {
  const ring = getComputedStyle(ringEl);
  const reach = parseFloat(ring.outlineWidth) + parseFloat(ring.outlineOffset);
  const r = ringEl.getBoundingClientRect();
  const m = menu.getBoundingClientRect();
  // overflow: auto clips at the padding box, which is the border box inset by the border widths.
  const pad = {
    top: m.top + menu.clientTop,
    left: m.left + menu.clientLeft,
    right: m.left + menu.clientLeft + menu.clientWidth,
  };
  return {
    top: Math.round((r.top - reach - pad.top) * 100) / 100,
    left: Math.round((r.left - reach - pad.left) * 100) / 100,
    right: Math.round((pad.right - (r.right + reach)) * 100) / 100,
  };
}

const menuOf = (dropdown: any) =>
  dropdown.shadowRoot!.querySelector("#menu") as HTMLElement;

describe("#179 accessibility review: focus ring, forced colours, disabled links", () => {
  for (const brand of ["default", "cru"]) {
    it(`${brand} theme: ring contrast on the menu surface, light and dark, plain and danger, today and A2`, async () => {
      let link: HTMLLinkElement | undefined;
      if (brand === "cru") {
        link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/dist/bundled/styles/themes/cru.css";
        const loaded = new Promise((resolve) =>
          link!.addEventListener("load", resolve),
        );
        document.head.append(link);
        await loaded;
      }
      try {
        for (const scheme of ["light", "dark"]) {
          const wrapper = await fixture<HTMLDivElement>(html`
            <div class=${`cs-${scheme}`}>
              <cs-dropdown>
                <cs-button slot="trigger">Menu</cs-button>
                <cs-dropdown-item id="plain">Plain item</cs-dropdown-item>
                <cs-dropdown-item id="danger" variant="danger"
                  >Danger item</cs-dropdown-item
                >
                <proto-link-item id="proto" href="#proto"
                  >A2 link item</proto-link-item
                >
              </cs-dropdown>
            </div>
          `);
          const dropdown = wrapper.querySelector<any>("cs-dropdown");
          const menu = menuOf(dropdown);
          await openWithKeyboard(dropdown);

          const plain = wrapper.querySelector<HTMLElement>("#plain")!;
          expect(document.activeElement).to.equal(plain);
          log(
            `${brand} ${scheme}: host matches :focus-visible`,
            plain.matches(":focus-visible"),
          );
          await measureRing(`${brand} ${scheme} plain (today, host)`, plain, menu, plain);

          await sendKeys({ press: "ArrowDown" });
          await aTimeout(50);
          const danger = wrapper.querySelector<HTMLElement>("#danger")!;
          await measureRing(`${brand} ${scheme} danger (today, host)`, danger, menu, danger);

          // The prototype is not a cs-dropdown-item, so the menu's roving focus skips it; focus it from script right
          // after a key press, which is what makes :focus-visible apply to programmatic focus.
          const proto = wrapper.querySelector<HTMLElement>("#proto")!;
          await sendKeys({ press: "Shift" });
          proto.focus();
          await aTimeout(50);
          const a = proto.shadowRoot!.querySelector("a")!;
          log(`${brand} ${scheme}: A2 inner <a> focused`, proto.shadowRoot!.activeElement === a);
          log(`${brand} ${scheme}: A2 inner <a> matches :focus-visible`, a.matches(":focus-visible"));
          await measureRing(`${brand} ${scheme} plain (A2, inner <a>)`, a, menu, a);
        }
      } finally {
        link?.remove();
      }
    });
  }

  it("ring clearance inside the menu's scroll box, and item target size, at every size (default light)", async () => {
    for (const size of ["xs", "s", "m", "l", "xl"]) {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div class="cs-light">
          <cs-dropdown size=${size}>
            <cs-button slot="trigger">Menu</cs-button>
            <cs-dropdown-item id="first">First</cs-dropdown-item>
            <cs-dropdown-item>Second</cs-dropdown-item>
          </cs-dropdown>
        </div>
      `);
      const dropdown = wrapper.querySelector<any>("cs-dropdown");
      await openWithKeyboard(dropdown);
      const first = wrapper.querySelector<HTMLElement>("#first")!;
      const rect = first.getBoundingClientRect();
      log(`size ${size}: ring clearance from menu padding edge (px, negative = clipped)`, ringClearance(first, menuOf(dropdown)));
      log(`size ${size}: item target (px)`, `${Math.round(rect.width)}x${Math.round(rect.height * 100) / 100}`);
    }
  });

  it("forced colours (emulated): does the ring survive, in what colour, and does the focus fill drop?", async () => {
    await emulateMedia({ forcedColors: "active" } as any);
    try {
      log("forced: (forced-colors: active) matches", matchMedia("(forced-colors: active)").matches);
      const wrapper = await fixture<HTMLDivElement>(html`
        <div class="cs-light">
          <cs-dropdown>
            <cs-button slot="trigger">Menu</cs-button>
            <cs-dropdown-item id="plain">Plain item</cs-dropdown-item>
            <cs-dropdown-item id="other">Other item</cs-dropdown-item>
            <proto-link-item id="proto" href="#proto">A2 link item</proto-link-item>
          </cs-dropdown>
        </div>
      `);
      const dropdown = wrapper.querySelector<any>("cs-dropdown");
      await openWithKeyboard(dropdown);
      const plain = wrapper.querySelector<HTMLElement>("#plain")!;
      const other = wrapper.querySelector<HTMLElement>("#other")!;
      await measureRing("forced plain (today, host)", plain, menuOf(dropdown), plain);
      log("forced: focused vs unfocused item background", `${getComputedStyle(plain).backgroundColor} vs ${getComputedStyle(other).backgroundColor}`);

      const proto = wrapper.querySelector<HTMLElement>("#proto")!;
      await sendKeys({ press: "Shift" });
      proto.focus();
      await aTimeout(50);
      const a = proto.shadowRoot!.querySelector("a")!;
      await measureRing("forced plain (A2, inner <a>)", a, menuOf(dropdown), a);
      log("forced: A2 <a> text colour vs plain item text colour", `${getComputedStyle(a).color} vs ${getComputedStyle(other).color}`);
    } finally {
      await emulateMedia({ forcedColors: "none" } as any);
    }
  });

  it("does the host match :focus-visible or :focus-within when only its inner <a> has focus?", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <button id="before">Before</button>
        <proto-link-item id="override" href="#o">focus() override</proto-link-item>
        <proto-link-item id="delegates" data-delegates href="#d">delegatesFocus</proto-link-item>
      </div>
    `);
    for (const id of ["override", "delegates"]) {
      const host = wrapper.querySelector<HTMLElement>(`#${id}`)!;
      await sendKeys({ press: "Shift" });
      host.focus();
      await aTimeout(20);
      log(`${id}: host :focus / :focus-visible / :focus-within`, [
        host.matches(":focus"),
        host.matches(":focus-visible"),
        host.matches(":focus-within"),
      ]);
    }
  });

  it("what a disabled link exposes: cs-button href disabled, cs-pagination disabled, and the shapes proposed instead", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <section aria-label="Disabled links">
        <cs-button id="btn" href="#btn" disabled>Disabled link button</cs-button>
        <cs-pagination
          id="pg"
          total="30"
          page="2"
          href-template="#p{page}"
          label="Results"
          disabled
        ></cs-pagination>
        <a id="role-link" role="link" aria-disabled="true" tabindex="-1">Proposed disabled link</a>
        <div role="menu" aria-label="Proposed menu">
          <a role="menuitem" aria-disabled="true">Proposed disabled link item</a>
          <a role="menuitem" href="#current" aria-current="page">Proposed current link item</a>
        </div>
      </section>
    `);
    await (wrapper.querySelector("#btn") as any).updateComplete;
    await (wrapper.querySelector("#pg") as any).updateComplete;
    const inner = (wrapper.querySelector("#btn") as any).shadowRoot.querySelector("[part~=button]");
    log("cs-button disabled href: inner element", inner.outerHTML.replace(/<!--.*?-->/g, "").split(">")[0] + ">");
    const pageLinks = [...(wrapper.querySelector("#pg") as any).shadowRoot.querySelectorAll("a")].slice(0, 3);
    log("cs-pagination disabled: first page anchors", pageLinks.map((a: HTMLAnchorElement) => a.outerHTML.replace(/<!--.*?-->/g, "").split(">")[0] + ">"));
    const page = await executeServerCommand<AXNode, Record<string, never>>("a11y-snapshot", {});
    // Every node whose name is one of these, with its role and disabled flag. A name that is missing from the
    // snapshot is reported as missing, which is itself the finding for an element exposed as generic text.
    const wanted = [
      "Disabled link button",
      "Previous page",
      "1",
      "2",
      "Proposed disabled link",
      "Proposed disabled link item",
      "Proposed current link item",
    ];
    const found: Record<string, string[]> = {};
    const walk = (node: AXNode) => {
      if (node.name && wanted.includes(node.name)) {
        (found[node.name] ??= []).push(
          `${node.role}${node.disabled ? " [disabled]" : ""}`,
        );
      }
      (node.children ?? []).forEach(walk);
    };
    walk(page);
    for (const name of wanted) {
      log(`a11y node "${name}"`, found[name] ?? "not in snapshot");
    }
  });

  it("check 2 of the research: Enter on a slotted-link item closes the menu", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <cs-dropdown id="dd">
          <cs-button slot="trigger">Menu</cs-button>
          <cs-dropdown-item id="one"><a href="#slotted">Slotted link</a></cs-dropdown-item>
        </cs-dropdown>
      </div>
    `);
    const dropdown = wrapper.querySelector<any>("#dd");
    dropdown.open = true;
    await oneEvent(dropdown, "cs-after-show");
    await sendKeys({ press: "Enter" });
    await aTimeout(300);
    log("slotted: open after Enter", dropdown.open);
    history.replaceState(null, "", location.pathname + location.search);
  });
});
