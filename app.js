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

 lifxClient.on('light-new', function(light) {
  console.log('New light found.');
  console.log('ID: ' + light.id);
  console.log('IP: ' + light.address + ':' + light.port);
  light.getState(function(err, info) {
    if (err) {
      console.log(err);
    }
    console.log('Label: ' + info.label);
    console.log('Power:', (info.power === 1) ? 'on' : 'off');
    console.log('Color:', info.color);
  });

  light.getHardwareVersion(function(err, info) {
    if (err) {
      console.log(err);
    }
    console.log('Device Info: ' + info.vendorName + ' - ' + info.productName);
    console.log('Features: ', info.productFeatures, '\n');
  });
});

function listenToButton(bdAddr) {
  var cc = new FlicConnectionChannel(bdAddr);
  client.addConnectionChannel(cc);
  cc.on("buttonSingleOrDoubleClickOrHold", function(clickType, wasQueued, timeDiff) {
          switch (bdAddr) {
        case '80:e4:da:72:cc:37': // Kitchen Flic
          if (clickType == 'ButtonSingleClick') {
                  console.log('ding');
                  var light = lifxClient.light('d073d5004981');
                  //var light2 = lifxClient.light('d073d5298159');
                  if (light) {
                    light.getPower(function(error,data) {
                      if (data == 0) {
                              light.on(1000);
                      }
                      else {
                              light.off(1000);
                      }
                    });
                  }
                  else {
                    console.log("Kitchen Back could not be found");
                  }

          }
          break;
        default:
          console.log("Unknown " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");
      }
  });
  cc.on("connectionStatusChanged", function(connectionStatus, disconnectReason) {
    //console.log(bdAddr + " " + connectionStatus + (connectionStatus == "Disconnected" ? " " + disconnectReason : ""));
  });
}

client.once("ready", function() {
  console.log("Connected to daemon!");
  client.getInfo(function(info) {
    info.bdAddrOfVerifiedButtons.forEach(function(bdAddr) {
      listenToButton(bdAddr);
    });
  });
});

client.on("bluetoothControllerStateChange", function(state) {
  console.log("Bluetooth controller state change: " + state);
});

client.on("newVerifiedButton", function(bdAddr) {
  console.log("A new button was added: " + bdAddr);
  listenToButton(bdAddr);
});

client.on("error", function(error) {
  console.log("Daemon connection error: " + error);
});

client.on("close", function(hadError) {
  console.log("Connection to daemon is now closed");
});

lifxClient.on('listening', function() {
  var address = lifxClient.address();
  console.log(
    'Started LIFX listening on ' +
    address.address + ':' + address.port + '\n'
  );
});

lifxClient.init({broadcast:'192.168.0.255'});
