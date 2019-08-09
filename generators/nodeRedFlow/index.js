/* Node-Red Flow Generator */
"use strict";
const Generator = require("yeoman-generator");
const _ = require("lodash");
const path = require("path");
const deepExtend = require('deep-extend');
const { writeFileSync } = require('fs');
const chalk = require('chalk');

module.exports = class extends Generator {

  initializing() {

    // This should never be called on first run
    this.firstRun = !this.config.get("projectType");
    if (this.firstRun || this.config.get('projectType') !== 'plugin') {
      this.log(`This generator must be run within a plugin project`)
      process.exit(1);
    }
    let pkg = this.fs.readJSON(this.destinationPath("package.json"), {});

    // Define the template data model for this generator type
    this.model = {
      pkgName: pkg.name,
      pkgDescription: pkg.description,
      flowName: 'newFlow',
      flowTitle: 'New Flow',
      install: 'y',
    }
  }

  async prompting() {

    const prompts = [
      {
        name: "flowName",
        message: "Flow name",
        default: this.model.flowName,
      },
      {
        name: "flowTitle",
        message: "Flow title",
        default: this.model.flowTitle,
      },
      {
        name: "install",
        message: "Add on install (y/n)",
        default: this.model.install,
      }
    ];

    deepExtend(this.model, await this.prompt(prompts));
  }

  async writing() {
    let fs = this.fs;

    // Create the flow .json file
    fs.write(this.destinationPath('node-red/flows/' + this.model.flowName + '.json'), '');

    // Add the flow to package.json if requested to add on install 
    if (this.model.install == 'y') {
      let pkg = this.fs.readJSON(this.destinationPath("node-red/package.json"), {});
      pkg['node-red'].flows[this.model.flowTitle] = 'flows/' + this.model.flowName + '.json'
      writeFileSync(this.destinationPath("node-red/package.json"), JSON.stringify(pkg,null,2));
    }
  }

  end() {
    let fs = this.fs;
    this.log("");
    this.log(`Flow "${this.model.flowTitle}" has been added.`);
    this.log(`Paste the flow export into node-red/flows/${this.model.flowName}.json`);
    this.log("");
  }

};