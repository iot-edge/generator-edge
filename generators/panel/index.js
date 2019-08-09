/* Grafana Dashboard Generator */
"use strict";
const Generator = require("yeoman-generator");
const _ = require("lodash");
const chalk = require("chalk");
const { writeFileSync } = require('fs');
const deepExtend = require('deep-extend');

module.exports = class extends Generator {

  async initializing() {

    // This should never be called on first run
    this.firstRun = !this.config.get("projectType");
    if (this.firstRun || this.config.get('projectType') !== 'plugin') {
      this.log(`This generator must be run within a plugin project`)
      process.exit(1);
    }

    let pkg = this.fs.readJSON(this.destinationPath("package.json"), {});

    // Define the template data model for this generator type
    this.model = {
      name: '',
      pkgName: pkg.name,
      panelId: '',
      panelName: '',
      reactOrAngular: 'r',
    }

  }
  async prompting() {

    const prompts = [
      {
        type: "input",
        name: "name",
        message: "Panel name",
        default: "New Panel"
      },
      {
        type: "input",
        name: "reactOrAngular",
        message: "React or Angular (r/a)?",
        default: "r"
      },
    ];

    deepExtend(this.model, await this.prompt(prompts));
    this.model.name = this.model.name.trim();
    this.model.panelId = _.kebabCase(this.model.pkgName + ' ' + this.model.name);
    this.model.panelName = this.model.name.replace(/ /g,'');
    this.model.ctrlName = this.model.panelName + 'Ctrl';
  }

  async configuring() {}
  async default() {}

  async writing() {
    const fs = this.fs;
    const templatePath = this.templatePath(this.model.reactOrAngular == 'a' ? 'angular' : 'react');

    // Copy template files
    const panelDir = 'src/panels/' + this.model.panelName + '/';
    fs.copy(templatePath + '/**', this.destinationPath(panelDir), { globOptions: { dot: true } });

    // Determine template files to replace
    const templateFiles = [];
    if (this.model.reactOrAngular == 'a') {
      templateFiles.push('module.ts', 'plugin.json');
    }
    else {
      templateFiles.push('module.tsx', 'Panel.tsx', 'PanelEditor.tsx', 'plugin.json', 'README.md', 'types.ts');
    }
    templateFiles.forEach((filename)=> {
      let tmpl = _.template(fs.read(templatePath + '/' + filename));
      fs.write(this.destinationPath(panelDir + '/' + filename), tmpl(this.model));
    });

    // Add panel to the to plugin.json (without asking the user)
    let plugin = this.fs.readJSON(this.destinationPath("src/plugin.json"), {});
    plugin.includes.push(
      {
        type: "panel",
        name: this.model.name,
        id: this.model.panelId,
      }
    );
    writeFileSync(this.destinationPath("src/plugin.json"), JSON.stringify(plugin,null,2));
    writeFileSync(this.destinationPath("test-site/data/grafana/touch-to-restart"), "restart");
  }

  end() {
    this.log(`   ${chalk.green("merged")} panel definition into plugin.json`);
    this.log("");
    this.log("Grafana restarted.");
    this.log("");
    this.log(`Navigate to http://localhost:8000/edge/plugins/${this.model.pkgName} to view.`);
    this.log("");
  }

};