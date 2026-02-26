import { describe, expect, it } from 'vitest';
import { MENU_TABS } from '../src/core/actions.js';
import { UI1_DYNAMIC_PANEL_VIEWS, resolveUI1DynamicPanelView } from '../src/ui/skin-ui1/layout.js';

function stateWithMenu(activeTab, ui1Focus = MENU_TABS.BAG) {
  return {
    menu: {
      activeTab,
      ui1Focus
    }
  };
}

describe('ui1 dynamic square panel', () => {
  it('uses map view when active tab is MAP', () => {
    const view = resolveUI1DynamicPanelView(stateWithMenu(MENU_TABS.MAP, MENU_TABS.MON));
    expect(view).toBe(UI1_DYNAMIC_PANEL_VIEWS.MAP);
  });

  it('uses bag preview view when island mode is active and BAG is focused', () => {
    const view = resolveUI1DynamicPanelView(stateWithMenu(MENU_TABS.BAG, MENU_TABS.BAG));
    expect(view).toBe(UI1_DYNAMIC_PANEL_VIEWS.BAG_PREVIEW);
  });

  it('uses mon preview view when island mode is active and MON is focused', () => {
    const view = resolveUI1DynamicPanelView(stateWithMenu(MENU_TABS.BAG, MENU_TABS.MON));
    expect(view).toBe(UI1_DYNAMIC_PANEL_VIEWS.MON_PREVIEW);
  });

  it('falls back to bag preview when island mode is active and focus is unknown', () => {
    const view = resolveUI1DynamicPanelView(stateWithMenu(MENU_TABS.BAG, 'UNKNOWN'));
    expect(view).toBe(UI1_DYNAMIC_PANEL_VIEWS.BAG_PREVIEW);
  });
});
