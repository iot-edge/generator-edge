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
      slug: '',
      addToNav: 'n',
    }

  }
  async prompting() {

    const prompts = [
      {
        type: "input",
        name: "name",
        message: "Dashboard name",
        default: "New Dashboard"
      },
      {
        type: "input",
        name: "addToNav",
        message: "Add to navbar (y/n)?",
        default: "n"
      },
    ];

    deepExtend(this.model, await this.prompt(prompts));
    this.model.slug = this.model.name.toLowerCase().replace(/ /g,'-').replace(/[^\w-]/g,'');
  }

  async configuring() {}
  async default() {}

  async writing() {
    let fs = this.fs;

    // Create the dashboard file
    let dashTmpl = _.template(fs.read(this.templatePath('dashboard.json')));
    fs.write(this.destinationPath('src/dashboards/' + this.model.slug + '.json'), dashTmpl(this.model));

    // Add dashboard to the to plugin.json (without asking the user)
    let plugin = this.fs.readJSON(this.destinationPath("src/plugin.json"), {});
    plugin.includes.push(
      {
        type: "dashboard",
        name: this.model.name,
        path: "dashboards/" + this.model.slug + '.json',
        addToNav: this.model.addToNav == 'y',
        defaultNav: false
      }
    );
    writeFileSync(this.destinationPath("src/plugin.json"), JSON.stringify(plugin,null,2));
    writeFileSync(this.destinationPath("test-site/data/grafana/touch-to-restart"), "restart");
  }

  end() {
    this.log(`   ${chalk.green("merged")} dashboard definition into plugin.json`);
    this.log("");
    this.log("Grafana restarted.");
    this.log("");
    this.log(`Navigate to http://localhost:8000/edge/plugins/${this.model.pkgName}/?page=dashboards to import.`);
    this.log("");
  }

};