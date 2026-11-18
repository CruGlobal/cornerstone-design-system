import { expect } from '@open-wc/testing';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { serverModulesFor, type ServerComponents } from './fixture.js';

const COMPONENTS: ServerComponents = {
  'cs-button': { module: '/button.js', dependencies: ['cs-icon', 'cs-spinner'] },
  'cs-button-group': { module: '/button-group.js', dependencies: [] },
  'cs-icon': { module: '/icon.js', dependencies: [] },
  'cs-option': { module: '/option.js', dependencies: [] },
  'cs-spinner': { module: '/spinner.js', dependencies: [] },
  'cs-tag': { module: '/tag.js', dependencies: ['cs-button'] },
};
const ALL = Object.values(COMPONENTS).map((component) => component.module);

describe('serverModulesFor', () => {
  it('should pick the module of each cs-* tag in the template', () => {
    const template = html`<cs-option></cs-option><cs-icon name="x"></cs-icon>`;

    expect(serverModulesFor(template, COMPONENTS)).to.deep.equal(['/icon.js', '/option.js']);
  });

  it('should add the modules a tag declares as dependencies', () => {
    expect(serverModulesFor(html`<cs-button></cs-button>`, COMPONENTS)).to.deep.equal([
      '/button.js',
      '/icon.js',
      '/spinner.js',
    ]);
  });

  it('should follow dependencies of dependencies', () => {
    expect(serverModulesFor(html`<cs-tag></cs-tag>`, COMPONENTS)).to.deep.equal([
      '/button.js',
      '/icon.js',
      '/spinner.js',
      '/tag.js',
    ]);
  });

  it('should not take a tag for another whose name it starts with', () => {
    expect(serverModulesFor(html`<cs-button-group></cs-button-group>`, COMPONENTS)).to.deep.equal(['/button-group.js']);
  });

  it('should find tags in nested templates and lists', () => {
    const items = ['a', 'b'].map((value) => html`<cs-option value=${value}>${value}</cs-option>`);
    const template = html`<form>${html`<cs-icon></cs-icon>${items}`}</form>`;

    expect(serverModulesFor(template, COMPONENTS)).to.deep.equal(['/icon.js', '/option.js']);
  });

  it('should find tags in markup passed as a value', () => {
    const template = html`<div>${unsafeHTML('<cs-icon name="x"></cs-icon>')}</div>`;

    expect(serverModulesFor(template, COMPONENTS)).to.deep.equal(['/icon.js']);
  });

  it('should leave out a cs-* tag that is not a component when the template has one that is', () => {
    const template = html`<cs-icon></cs-icon><cs-unknown></cs-unknown>`;

    expect(serverModulesFor(template, COMPONENTS)).to.deep.equal(['/icon.js']);
  });

  it('should fall back to every module when it finds no cs-* tag', () => {
    expect(serverModulesFor(html`<div>Plain</div>`, COMPONENTS)).to.deep.equal(ALL);
  });

  it('should fall back to every module when no tag it finds is a component', () => {
    expect(serverModulesFor(html`<cs-unknown></cs-unknown>`, COMPONENTS)).to.deep.equal(ALL);
  });

  it('should give cs-time-input the icon it renders but does not import', () => {
    const modules = serverModulesFor(html`<cs-time-input></cs-time-input>`);

    expect(modules).to.include('/dist/unbundled/components/time-input/time-input.js');
    expect(modules).to.include('/dist/unbundled/components/icon/icon.js');
  });
});
