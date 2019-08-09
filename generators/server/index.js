/* Microclimates Plugin Generator */

"use strict";
const Generator = require("yeoman-generator");
const _ = require("lodash");
const deepExtend = require('deep-extend');
const mtz = require('moment-timezone');
const DEFAULT_HTTP_PORT = 8000;
const DEFAULT_MQTT_PORT = 1883;
const DEFAULT_MQTT_WS_PORT = 9001;
const chalk = require('chalk');
const util = require('util');
const ini = require('ini');

module.exports = class extends Generator {
  
  constructor(args, opts) {
    super(args, opts)
  }

  async initializing() {

    // Get prior model values from the edge-env file
    this.options = this.options || {};
    this.options.serverDir = this.options.serverDir || "";
    this.options.noderedPluginVolume = this.options.noderedPluginVolume || "";
    this.options.grafanaPluginVolume = this.options.grafanaPluginVolume || "";
    let opts = this.options;
    let edgeEnv = {};
    this.firstRun = true;
    try {
      let iniFile = this.fs.readJSON('./' + this.options.serverDir + '.env');
      edgeEnv = ini.parse(iniFile);
      this.firstRun = false;
    } catch(e){}

    // Define the template data model for this generator type
    this.model = {
      proceed: true,
      siteId: edgeEnv.SITE_ID || opts.siteId || 'edge',
      siteName: edgeEnv.SITE_NAME || opts.siteName || "Edge Site",
      siteFQDN: edgeEnv.SITE_FQDN || opts.siteFQDN || "localhost",
      httpPort: edgeEnv.HTTP_PORT || opts.httpPort || DEFAULT_HTTP_PORT,
      mqttPort: edgeEnv.MQTT_PORT || opts.mqttPort || DEFAULT_MQTT_PORT,
      mqttWebSocketPort: edgeEnv.MQTT_WS_PORT || opts.mqttWebSocketPort || DEFAULT_MQTT_WS_PORT,
      tz: edgeEnv.TZ || mtz.tz.guess(),
      noderedPluginVolume: opts.noderedPluginVolume,
      grafanaPluginVolume: opts.grafanaPluginVolume,

      // Retain these as variables during template replacement
      SITE_ID: '${SITE_ID}',
      SITE_NAME: '${SITE_NAME}',
      SITE_FQDN: '${SITE_FQDN}',
      TZ: '${TZ}',
      HTTP_PORT: '${HTTP_PORT}',
      MQTT_PORT: '${MQTT_PORT}',
      MQTT_WS_PORT: '${MQTT_WS_PORT}',
      MNT_DIR: '${MNT_DIR}',

    }

  }

  async prompting() {

    let opts = this.options;

    if (opts.prompt) {
      this.log(opts.prompt);
    }

    // Ask to proceed unless we've been told to generate
    if (!opts.serverDir) {
      deepExtend(this.model, await this.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: this.firstRun ? 'Install an edge server in this directory' : 'Update site config for ' + this.model.siteName,
          default: true
        }
      ]));
    }
    if (!this.model.proceed) {
      this.log(`OK`);
      process.exit(1);
    }

    let prompts = [];
    if (!opts.siteName) {
      prompts.push({
        name: 'siteName',
        message: 'What should I call this site',
        default: this.model.siteName
      })
    }
   
    if (!opts.siteId) {
      prompts.push({
        name: 'siteId',
        message: 'What should the site ID be (short identifier)',
        default: this.model.siteId
      })
    }

    if (!opts.siteFQDN) {
      prompts.push({
        name: 'siteFQDN',
        message: 'What is the network name or IP address for this site',
        default: this.model.siteFQDN
      })
    }

    if (!opts.httpPort) {
      prompts.push({
        name: 'httpPort',
        message: 'What HTTP port should this server listen on (80,8080,...)',
        default: this.model.httpPort
      })
    }

    if (!opts.mqttPort) {
      prompts.push({
        name: 'mqttPort',
        message: 'What MQTT port should the server listen on',
        default: this.model.mqttPort
      })
    }

    deepExtend(this.model, await this.prompt(prompts));

  }

  async writing() {

    // Obtain a silent mem-fs store
    let store = require("mem-fs").create();
    let fs = require("mem-fs-editor").create(store);

    // Offset the MQTT socket port the same as the mqtt port offset
    this.model.mqttWebSocketPort = DEFAULT_MQTT_WS_PORT + (this.model.mqttPort - DEFAULT_MQTT_PORT);

    // Start by copying all files
    fs.copy(this.templatePath('**'), this.destinationPath(this.options.serverDir), { globOptions: { dot: true } });

    // Apply data model to template files
    const templateFiles = [
      ".env",
      "docker-compose.yml",
      "data/edge/docs/index.html",
      "data/edge/docs/README.md",
      "data/edge/docs/_coverpage.md",
      "data/edge/docs/_sidebar.md",
    ]
    templateFiles.forEach((filename)=> {
      let tmpl = _.template(fs.read(this.templatePath(filename)));
      fs.write(this.destinationPath(this.options.serverDir + filename), tmpl(this.model));
    });

    // Commit changes
    const commit = util.promisify(fs.commit.bind(fs));
    await commit([]);

  }

  end() {

    // Mute output if being generated elsewhere
    if (!this.options.serverDir) {
      this.log("");
      this.log(`Your site has been created.`);
      this.log(`Run ${chalk.red("npm start")} to start, then open ${chalk.red("http://" + this.model.siteFQDN + ":" + this.model.httpPort)} to view.`)
      this.log("");

      if (this.firstRun) {
        this.config.set("projectType", "edge");
        this.config.save();
      }
    }

  }

};