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
      ctrlName: '',
      camelName: '',
      addToNav: 'n',
    }

  }
  async prompting() {

    const prompts = [
      {
        type: "input",
        name: "name",
        message: "Page name",
        default: "New Page"
      },
      {
        type: "input",
        name: "addToNav",
        message: "Add to navbar (y/n)?",
        default: "n"
      },
    ];

    deepExtend(this.model, await this.prompt(prompts));
    this.model.ctrlName = this.model.name.trim().replace(/ /g,'') + 'Ctrl';
    this.model.camelName = _.camelCase(this.model.name);
  }

  async configuring() {}
  async default() {}

  async writing() {
    let fs = this.fs;

    // Copy the template files
    let pageDir = 'src/pages/' + this.model.camelName + '/';
    fs.copy(this.templatePath('page'), this.destinationPath(pageDir), { globOptions: { dot: true } });

    // Apply data model to template files
    const templateFiles = [
      "index.html", "index.js"
    ]
    templateFiles.forEach((filename)=> {
      let tmpl = _.template(fs.read(this.templatePath('page/' + filename)));
      fs.write(this.destinationPath(pageDir + '/' + filename), tmpl(this.model));
    });

    // Add the control to the module.ts file (without asking)
    let module = this.fs.read(this.destinationPath("src/module.ts"), '');
    module = `${module}export { ${this.model.ctrlName} } from './pages/${this.model.camelName}';\n`
    writeFileSync(this.destinationPath("src/module.ts"), module);

    // Add page to the to plugin.json (without asking the user)
    let plugin = this.fs.readJSON(this.destinationPath("src/plugin.json"), {});
    plugin.includes.push(
      {
        type: "page",
        name: this.model.name,
        component: this.model.ctrlName,
        role: "Viewer", 
        addToNav: this.model.addToNav == 'y',
        defaultNav: false,
      }
    );
    writeFileSync(this.destinationPath("src/plugin.json"), JSON.stringify(plugin,null,2));
    writeFileSync(this.destinationPath("test-site/data/grafana/touch-to-restart"), "restart");
  }

  end() {
    this.log(`   ${chalk.green("merged")} page control into module.ts`);
    this.log(`   ${chalk.green("merged")} page definition into plugin.json`);
    this.log("");
    this.log("Grafana restarted.");
    this.log("");
    this.log(`Navigate to http://localhost:8000/edge/plugins/${this.model.pkgName} to view.`);
    this.log("");
  }

};