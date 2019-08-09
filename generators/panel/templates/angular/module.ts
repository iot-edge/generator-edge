import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import defaultsDeep from 'lodash/defaultsDeep';

import { DataFrame } from '@grafana/data';

interface KeyValue {
  key: string;
  value: any;
}

export default class ${ctrlName} extends MetricsPanelCtrl {
  static templateUrl = 'panels/${panelName}/partials/module.html';

  panelDefaults = {
    text: 'Hello World',
  };

  // Simple example showing the last value of all data
  firstValues: KeyValue[] = [];

  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector);
    defaultsDeep(this.panel, this.panelDefaults);

    // Get results directly as DataFrames
    (this as any).dataFormat = 'series';

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
  }

  onInitEditMode() {
    this.addEditorTab('Options', `public/plugins/${pkgName}/panels/${panelName}/partials/options.html`, 2);
  }

  onRender() {}

  onDataError(err: any) {
    console.log('onDataError', err);
  }

  // 6.3+ get typed DataFrame directly
  handleDataFrame(data: DataFrame[]) {
    const values: KeyValue[] = [];

    for (const frame of data) {
      for (let i = 0; i < frame.fields.length; i++) {
        values.push({
          key: frame.fields[i].name,
          value: frame.rows[0][i],
        });
      }
    }

    this.firstValues = values;

    // Turn off the spinner
    this.loading = false;
    this.renderingCompleted();
  }
}

export { ${ctrlName} as PanelCtrl };
