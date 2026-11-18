import { expect } from '@open-wc/testing';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { serverModulesFor } from './fixture.js';

const ALL = [
  '/dist/unbundled/components/button/button.js',
  '/dist/unbundled/components/button-group/button-group.js',
  '/dist/unbundled/components/icon/icon.js',
  '/dist/unbundled/components/option/option.js',
];

describe('serverModulesFor', () => {
  it('should pick the module of each cs-* tag in the template', () => {
    const template = html`<cs-button><cs-icon name="x"></cs-icon></cs-button>`;

    expect(serverModulesFor(template, ALL)).to.deep.equal([ALL[0], ALL[2]]);
  });

  it('should not take a tag for another whose name it starts with', () => {
    expect(serverModulesFor(html`<cs-button-group></cs-button-group>`, ALL)).to.deep.equal([ALL[1]]);
  });

  it('should find tags in nested templates and lists', () => {
    const items = ['a', 'b'].map((value) => html`<cs-option value=${value}>${value}</cs-option>`);
    const template = html`<form>${html`<cs-button>${items}</cs-button>`}</form>`;

    expect(serverModulesFor(template, ALL)).to.deep.equal([ALL[0], ALL[3]]);
  });

  it('should find tags in markup passed as a value', () => {
    const template = html`<div>${unsafeHTML('<cs-icon name="x"></cs-icon>')}</div>`;

    expect(serverModulesFor(template, ALL)).to.deep.equal([ALL[2]]);
  });

  it('should fall back to every module when it finds no cs-* tag', () => {
    expect(serverModulesFor(html`<div>Plain</div>`, ALL)).to.deep.equal(ALL);
  });

  it('should fall back to every module when no tag it finds has a module', () => {
    expect(serverModulesFor(html`<cs-unknown></cs-unknown>`, ALL)).to.deep.equal(ALL);
  });
});
