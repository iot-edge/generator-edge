/* Node-Red Node Generator */
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
      nodeName: 'newNode',
      description: '',
    }
  }

  async prompting() {

    const prompts = [
      {
        name: "nodeName",
        message: "Node name",
        default: this.model.nodeName,
      },
      {
        name: "description",
        message: "Node Description",
        default: this.model.description,
      }
    ];

    deepExtend(this.model, await this.prompt(prompts));
    this.model.pkgNodeName = this.model.pkgName + ':' + this.model.nodeName;
  }

  async writing() {
    let fs = this.fs;

    // Create the node .js and .html files
    let jsTmpl = _.template(fs.read(this.templatePath('node.js')));
    fs.write(this.destinationPath('node-red/lib/' + this.model.nodeName + '.js'), jsTmpl(this.model));
    let htmlTmpl = _.template(fs.read(this.templatePath('node.html')));
    fs.write(this.destinationPath('node-red/lib/' + this.model.nodeName + '.html'), htmlTmpl(this.model));

    // Add the node to package.json (without asking the user)
    let pkg = this.fs.readJSON(this.destinationPath("node-red/package.json"), {});
    pkg['node-red'].nodes[this.model.pkgNodeName] = 'lib/' + this.model.nodeName + '.js'
    writeFileSync(this.destinationPath("node-red/package.json"), JSON.stringify(pkg,null,2));

    // Restart
    fs.write(this.destinationPath('test-site/data/nodered/touch-to-restart'), '');
  }

  end() {
    let fs = this.fs;
    this.log(`Process restarted.`)
    this.log("");
    this.log(`Node "${this.model.description}" has been created.`);
    this.log(`Navigate to http://localhost:8000/edge/node-red/ to see it in the palette.`);
    this.log("");
  }

};