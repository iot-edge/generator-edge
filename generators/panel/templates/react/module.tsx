import { PanelPlugin } from '@grafana/ui';

import { ${panelName}PanelEditor } from './PanelEditor';
import { ${panelName}Panel } from './Panel';
import { ${panelName}Options, defaultOptions } from './types';

export const plugin = new PanelPlugin<${panelName}Options>(${panelName}Panel).setDefaults(defaultOptions).setEditor(${panelName}PanelEditor);
/*
  .setPanelChangeHandler((options: ${panelName}Options, prevPluginId: string, prevOptions: any) => {
    return defaultOptions;
  });
*/
