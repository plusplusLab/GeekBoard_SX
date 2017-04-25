(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // Extension API interactions
    var potentialDevices = [];

    ext._deviceConnected = function(dev) {
        potentialDevices.push(dev);

        if (!device) {
            tryNextDevice();
        }
    }

    var poller = null;
    var watchdog = null;
    function tryNextDevice() {
        // If potentialDevices is empty, device will be undefined.
        // That will get us back here next time a device is connected.
        device = potentialDevices.shift();
        if (!device) return;

        device.open({ stopBits: 0, bitRate: 115200, ctsFlowControl: 0 });
        device.set_receive_handler(function(data) {
            /*
            //console.log('Received: ' + data.byteLength);
            if(!rawData || rawData.byteLength == 18) rawData = new Uint8Array(data);
            else rawData = appendBuffer(rawData, data);

            if(rawData.byteLength >= 18) {
                //console.log(rawData);
                processData();
                //device.send(pingCmd.buffer);
            }
            */
        });

        // GeekBoard handshake
        var pingCmd = "1234";
        uint=new Uint8Array(pingCmd.length);
        for(var i=0,j=pingCmd.length;i<j;++i){
          uint[i]=pingCmd.charCodeAt(i);
        }

        poller = setInterval(function() {
            device.send(uint.buffer);
        }, 50);
        watchdog = setTimeout(function() {
            // This device didn't get good data in time, so give up on it. Clean up and then move on.
            // If we get good data then we'll terminate this watchdog.
            clearInterval(poller);
            poller = null;
            device.set_receive_handler(null);
            device.close();
            device = null;
            tryNextDevice();
        }, 250);
    };

    ext._deviceRemoved = function(dev) {
        if(device != dev) return;
        if(poller) poller = clearInterval(poller);
        device = null;
    };

    ext._shutdown = function() {
        if(device) device.close();
        if(poller) poller = clearInterval(poller);
        device = null;
    };

    ext._getStatus = function() {
        if(!device) return {status: 1, msg: 'GeekBoard disconnected'};
        if(watchdog) return {status: 1, msg: 'Scanning for a GeekBoard'};
        return {status: 2, msg: 'GeekBoard connected'};
    }


    // Block and block menu descriptions
    var descriptor = {
      blocks:[
<<<<<<< HEAD
        [' ', 'activer digital %m.digital_pins comme %m.digital_modes', 'activer'],
        [' ', 'activer analog %m.analog_pins comme entree', 'aactiver'],
        ['r', 'valeur digital %m.digital_pins', 'valeurd'],
        ['r', 'valeur analog %m.analog_pins', 'valeura']
     ],
     menus:{

=======
        [' ', 'digital %m.digital_pins comme %m.digital_modes', 'activer'],
        [' ', 'analog %m.analog_pins comme entree', 'aactiver'],
        ['r', 'valeur de %m.digital_pins', 'valeurd'],
        ['r', 'valeur de %m.analog_pins', 'valeura']
     ],
     menus:{
     
>>>>>>> ab8de27924a03b68fb73caec4cca65881d39f773
        digital_pins:['5', '6', '7', '8'],
        analog_pins:['1', '2', '3', '4'],
        digital_modes:['entree', 'sortie', 'moteur']
     }
    };

    // Register the extension
    ScratchExtensions.register('GeekBoard', descriptor, ext, {type:'Serial'});
})({});
