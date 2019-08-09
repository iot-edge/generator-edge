// Grafana panels to use as examples:
// https://github.com/grafana/grafana/tree/master/public/app/plugins/panel

// Libraries
import React, { PureComponent } from 'react';
import { debounce } from 'lodash';

// Types
import { ${panelName}Options } from './types'; // Options: this panels props (managed by this panel editor)
import { PanelProps } from '@grafana/ui'; // PanelProps: Grafana panel props (contains props.options)
interface Props extends PanelProps<${panelName}Options> {} // Props: Full panel props structure (including options)

// State = transient state in the browser
interface State {
  title: string;
}

export class ${panelName}Panel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      title: '' + this.processTitle(props.options),
    };
  }

  componentDidUpdate(prevProps: Props) {
    // Since any change could be referenced in a template variable,
    // This needs to process everytime (with debounce)
    this.updateState();
  }

  updateState = debounce(() => {
    const title = this.processTitle(this.props.options);
    if (title !== this.state.title) {
      this.setState({ title });
    }
  }, 150);

  processTitle(options: ${panelName}Options): string {
    const { title } = options;
    return title;
  }

  render() {
    const { title } = this.state;

    return (
      <div className="text-center dashboard-header">
        <span>{title}</span>
      </div>
    );
  }
}
