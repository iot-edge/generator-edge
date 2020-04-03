/* Edge Server Plugin Generator */
"use strict";
const Generator = require("yeoman-generator");
const _ = require("lodash");
const path = require("path");
const deepExtend = require('deep-extend');
const chalk = require('chalk');
const { execFileSync } = require('child_process');
const mtz = require('moment-timezone');
const DEFAULT_HTTP_PORT = 8000;
const DEFAULT_MQTT_PORT = 1883;
const DEFAULT_MQTT_WS_PORT = 9001;

module.exports = class extends Generator {

  initializing() {

    // This should never be called if not first run
    this.firstRun = !this.config.get("projectType");
    let pkg = this.fs.readJSON(this.destinationPath("package.json"), {});

    // Define the template data model for this generator type
    this.model = {
      pkgName: pkg.name || path.basename(this.destinationRoot()),
      description: pkg.description || "",
      pkgVersion: pkg.version || "0.0.1",
      author: pkg.author || {
        name: this.user.git.name() || null,
        email: "",
        website: ""
      },
      license: pkg.license || "MIT",
    }

  }

  async prompting() {

    const prompts = [
      {
        name: "pkgName",
        message: "Plugin name",
        default: this.model.pkgName,
      },
      {
        name: "description",
        message: "Plugin Description",
        default: this.model.description,
      }
    ];

    deepExtend(this.model, await this.prompt(prompts));
  }

  default() {

    this.composeWith(require.resolve('generator-license'), {
      name: this.model.author.name,
      email: this.model.author.email,
      website: this.model.author.website,
      defaultLicense: this.model.license,
    });

    console.log(require.resolve('generator-license'));
    console.log(require.resolve('generator-edge'));
    
    this.composeWith(require.resolve('generator-edge/generators/server'), {
      prompt: '\nGenerating a plugin test server\n',
      serverDir: 'test-site/',
      noderedPluginVolume: "\n      - '../node-red:/data/node_modules/node-red-contrib-" + this.model.pkgName + "'",
      grafanaPluginVolume: "\n      - '..:/var/lib/grafana/plugins/" + this.model.pkgName + "'",
      siteId: 'edge',
      siteName: this.model.description,
      siteFQDN: "localhost"
    });
  }

  async writing() {
    let fs = this.fs;

    // Start by copying all files
    fs.copy(this.templatePath('**'), this.destinationPath(), { globOptions: { dot: true } });

    // Apply data model to template files
    const templateFiles = [
      "package.json", "README.md", "node-red/package.json", "node-red/README.md",
      "src/plugin.json", "src/components/appConfig/index.html"
    ]
    templateFiles.forEach((filename)=> {
      let tmpl = _.template(fs.read(this.templatePath(filename)));
      fs.write(this.destinationPath(filename), tmpl(this.model));
    });

  }

  end() {
    if (this.firstRun) {
      this.config.set("projectType", "plugin");
      this.config.save();
    }

    // Copy the license to node-red
    this.fs.copy(this.destinationPath('LICENSE'), this.destinationPath('node-red/LICENSE'));

    this.log("");
    this.log(`Your plugin has been created.`);
    this.log(`Run ${chalk.red("npm start")} to start the test server.`)
    this.log(`Run ${chalk.red("yo edge")} to build plugin components.`)
    this.log("");
  }

};