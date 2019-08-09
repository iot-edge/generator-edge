// Libraries
import React, { PureComponent, ChangeEvent } from 'react';

// Components
import { PanelEditorProps, PanelOptionsGroup } from '@grafana/ui';

// Local Types
import { ${panelName}Options } from './types';

export class ${panelName}PanelEditor extends PureComponent<PanelEditorProps<${panelName}Options>> {
  onTitleChange = (event: ChangeEvent<HTMLElement>) => {
    this.props.onOptionsChange({ ...this.props.options, title: (event.target as any).value });
  };

  render() {
    const { title } = this.props.options;

    return (
      <PanelOptionsGroup title="${panelName}">
        <div className="gf-form-inline">
          <div className="gf-form">
            <span className="gf-form-label">Title</span>
            <input type="text" className="gf-form-input" onChange={this.onTitleChange} value={title} />
          </div>
        </div>
      </PanelOptionsGroup>
    );
  }
}
