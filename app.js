 /*
 * This example program connects to already paired buttons and register event listeners on button events.
 * Run the newscanwizard.js program to add buttons.
 */

var fliclib = require("./fliclibNodeJs");
var FlicClient = fliclib.FlicClient;
var FlicConnectionChannel = fliclib.FlicConnectionChannel;
var FlicScanner = fliclib.FlicScanner;

var client = new FlicClient("localhost", 5551);

var LifxClient = require('node-lifx').Client;
var lifxClient = new LifxClient();

/**
 * Displays information and ids of lights on the network
 */
//  lifxClient.on('light-new', function(light) {
//   console.log('New light found.');
//   console.log('ID: ' + light.id);
//   console.log('IP: ' + light.address + ':' + light.port);
//   light.getState(function(err, info) {
//     if (err) {
//       console.log(err);
//     }
//     console.log('Label: ' + info.label);
//     console.log('Power:', (info.power === 1) ? 'on' : 'off');
//     console.log('Color:', info.color);
//   });

//   light.getHardwareVersion(function(err, info) {
//     if (err) {
//       console.log(err);
//     }
//     console.log('Device Info: ' + info.vendorName + ' - ' + info.productName);
//     console.log('Features: ', info.productFeatures, '\n');
//   });
// });

function listenToButton(bdAddr) {
  var cc = new FlicConnectionChannel(bdAddr);
  client.addConnectionChannel(cc);
  cc.on("buttonSingleOrDoubleClickOrHold", function(clickType, wasQueued, timeDiff) {
    switch (bdAddr) {
      case '80:e4:da:72:cc:37': // Small bedroom Flic
        const colors = {
          red: { hue: 0, saturation: 100, brightness: 50, kelvin: 2500 },
          white: { hue: 300, saturation: 0, brightness: 100, kelvin: 4500 },
          warm: { hue: 300, saturation: 0, brightness: 100, kelvin: 2500 },
        }

        if (clickType == 'ButtonDoubleClick') {
          console.log('double');

          var light = lifxClient.light('d073d5004981');
          if (light) {
            var { hue, saturation, brightness, kelvin } = colors.white
            light.color(hue, saturation, brightness, kelvin);
          }
        }
        if (clickType == 'ButtonHold') {
          console.log('hold');

          var light = lifxClient.light('d073d5004981');
          if (light) {
            light.getState(function (error, data) {

              if (!data) {
                return;
              }

              const getColorValue = (color) => {
                return color.hue + color.kelvin
              }

              if (getColorValue(data.color) < 2650) {
                var { hue, saturation, brightness, kelvin } = colors.white
                light.color(hue, saturation, brightness, kelvin);
              } else if (getColorValue(data.color) < 2900) {
                var { hue, saturation, brightness, kelvin } = colors.red
                light.color(hue, saturation, brightness, kelvin);
              } else if (getColorValue(data.color) < 4900) {
                var { hue, saturation, brightness, kelvin } = colors.warm
                light.color(hue, saturation, brightness, kelvin);
              } else {
                var { hue, saturation, brightness, kelvin } = colors.white
                light.color(hue, saturation, brightness, kelvin);
              }
            });
          }
        }
        if (clickType == 'ButtonSingleClick') {
          console.log('single');

          var light = lifxClient.light('d073d5004981');
          //var light2 = lifxClient.light('d073d5298159');
          if (light) {
            light.getPower(function(error,data) {
              if (data == 0) {
                light.on();
              }
              else {
                light.off();
              }
            });
          }

        }
        break;
      default:
        console.log("Unknown " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");
      }
  });
  // cc.on("connectionStatusChanged", function(connectionStatus, disconnectReason) {
  //   console.log(bdAddr + " " + connectionStatus + (connectionStatus == "Disconnected" ? " " + disconnectReason : ""));
  // });
}

client.once("ready", function() {
  console.log("Connected to daemon!");
  client.getInfo(function(info) {
    info.bdAddrOfVerifiedButtons.forEach(function(bdAddr) {
      listenToButton(bdAddr);
    });
  });
});

client.on("newVerifiedButton", function(bdAddr) {
  console.log("A new button was added: " + bdAddr);
  listenToButton(bdAddr);
});

// client.on("bluetoothControllerStateChange", function(state) {
//   console.log("Bluetooth controller state change: " + state);
// });

// client.on("error", function(error) {
//   console.log("Daemon connection error: " + error);
// });

// client.on("close", function(hadError) {
//   console.log("Connection to daemon is now closed");
// });

// lifxClient.on('listening', function() {
//   var address = lifxClient.address();
//   console.log(
//     'Started LIFX listening on ' +
//     address.address + ':' + address.port + '\n'
//   );
// });

lifxClient.init({
  broadcast: '192.168.0.255',
  //lightOfflineTolerance: 10
});
