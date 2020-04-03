/**
 * ${description}
 * Node-Red Node: ${nodeName}
 * Node-Red Package: ${pkgDescription}
 */

module.exports = function(RED) {
  "use strict";

  function ${nodeName}Node(config) {
    var node = this;

    var verboseLog = function (msg){
      if (RED.settings.verbose) {
        node.log(msg);
      }
    }.bind(node)

    // Create the node
    RED.nodes.createNode(node,config);

    // Process inputs
    node.on('input', function(msg) {
      var topic = msg.topic;
      var payload = msg.payload;
      var nodeName = config.nodeName;
      node.status({fill:"green",shape:"dot",text:""});
    });

    node.on("close", function(done) {
      verboseLog("Destroying a ${nodeName} node");
      done();
    });
  }

  RED.nodes.registerType("${pkgNodeName}", ${nodeName}Node);
}