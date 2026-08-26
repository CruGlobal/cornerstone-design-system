import { expect, fixture, html } from '@open-wc/testing';
import type CsCheckboxGroup from './checkbox-group.js';

describe('<cs-checkbox-group>', () => {
  it('should render a labeled group of checkboxes', async () => {
    const el = await fixture<CsCheckboxGroup>(html`
      <cs-checkbox-group label="Toppings">
        <cs-checkbox value="cheese">Cheese</cs-checkbox>
        <cs-checkbox value="olives">Olives</cs-checkbox>
      </cs-checkbox-group>
    `);

    expect(el).to.exist;
  });

  it('should be accessible', async () => {
    const el = await fixture<CsCheckboxGroup>(html`
      <cs-checkbox-group label="Toppings" hint="Choose any you like.">
        <cs-checkbox value="cheese">Cheese</cs-checkbox>
        <cs-checkbox value="olives">Olives</cs-checkbox>
      </cs-checkbox-group>
    `);

    await expect(el).to.be.accessible();
  });

  it('should expose a role="group" wrapper labeled by the label', async () => {
    const el = await fixture<CsCheckboxGroup>(html`
      <cs-checkbox-group label="Toppings">
        <cs-checkbox value="cheese">Cheese</cs-checkbox>
      </cs-checkbox-group>
    `);

    const group = el.shadowRoot!.querySelector('[role="group"]')!;
    expect(group).to.exist;
    expect(group.getAttribute('aria-labelledby')).to.equal('label');
    expect(group.getAttribute('aria-describedby')).to.equal('hint');
  });

  it('should default to vertical orientation', async () => {
    const el = await fixture<CsCheckboxGroup>(html`
      <cs-checkbox-group label="Toppings">
        <cs-checkbox value="cheese">Cheese</cs-checkbox>
      </cs-checkbox-group>
    `);

    expect(el.orientation).to.equal('vertical');
  });

  it('should not change the size of grouped checkboxes when no group size is set', async () => {
    const el = await fixture<CsCheckboxGroup>(html`
      <cs-checkbox-group label="Toppings">
        <cs-checkbox value="cheese" size="xs">Cheese</cs-checkbox>
        <cs-checkbox value="olives" size="xl">Olives</cs-checkbox>
      </cs-checkbox-group>
    `);

    await el.updateComplete;
    const checkboxes = [...el.querySelectorAll('cs-checkbox')];
    expect(checkboxes[0].getAttribute('size')).to.equal('xs');
    expect(checkboxes[1].getAttribute('size')).to.equal('xl');
  });

  it('should apply the group size to all grouped checkboxes', async () => {
    const el = await fixture<CsCheckboxGroup>(html`
      <cs-checkbox-group label="Toppings" size="l">
        <cs-checkbox value="cheese">Cheese</cs-checkbox>
        <cs-checkbox value="olives" size="xs">Olives</cs-checkbox>
      </cs-checkbox-group>
    `);

    await el.updateComplete;
    const checkboxes = [...el.querySelectorAll('cs-checkbox')];
    // The group always wins, mirroring <cs-radio-group>, even when a child declares its own size.
    expect(checkboxes[0].getAttribute('size')).to.equal('l');
    expect(checkboxes[1].getAttribute('size')).to.equal('l');
  });

  it('should apply the group size to grouped switches', async () => {
    const el = await fixture<CsCheckboxGroup>(html`
      <cs-checkbox-group label="Settings" size="s">
        <cs-switch value="wifi">Wi-Fi</cs-switch>
        <cs-switch value="bluetooth">Bluetooth</cs-switch>
      </cs-checkbox-group>
    `);

    await el.updateComplete;
    const switches = [...el.querySelectorAll('cs-switch')];
    expect(switches[0].getAttribute('size')).to.equal('s');
    expect(switches[1].getAttribute('size')).to.equal('s');
  });

  it('should update grouped checkboxes when the group size changes at runtime', async () => {
    const el = await fixture<CsCheckboxGroup>(html`
      <cs-checkbox-group label="Toppings" size="s">
        <cs-checkbox value="cheese">Cheese</cs-checkbox>
        <cs-checkbox value="olives">Olives</cs-checkbox>
      </cs-checkbox-group>
    `);

    await el.updateComplete;
    el.size = 'xl';
    await el.updateComplete;

    const checkboxes = [...el.querySelectorAll('cs-checkbox')];
    expect(checkboxes[0].getAttribute('size')).to.equal('xl');
    expect(checkboxes[1].getAttribute('size')).to.equal('xl');
  });

  it('should apply the group size to checkboxes added after initial render', async () => {
    const el = await fixture<CsCheckboxGroup>(html`
      <cs-checkbox-group label="Toppings" size="l">
        <cs-checkbox value="cheese">Cheese</cs-checkbox>
      </cs-checkbox-group>
    `);

    await el.updateComplete;

    const added = document.createElement('cs-checkbox');
    added.setAttribute('value', 'olives');
    el.appendChild(added);
    await el.updateComplete;
    await added.updateComplete;

    expect(added.getAttribute('size')).to.equal('l');
  });
});
