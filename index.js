var iControl = require('icontrol-api').iControl;
var process = require('process');
var Accessory, Service, Characteristic, UUIDGen;

var iControlPanelAccessory = require('./accessories/iControlPanelAccessory');
var iControlDoorWindowAccessory = require('./accessories/iControlDoorWindowAccessory');
var iControlLightAccessory = require('./accessories/iControlLightAccessory');

module.exports = function(homebridge) {

    // Accessory must be created from PlatformAccessory Constructor
    Accessory = homebridge.platformAccessory; global.Accessory = homebridge.platformAccessory;

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service; global.Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic; global.Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    // For platform plugin to be considered as dynamic platform plugin,
    // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
    homebridge.registerPlatform("homebridge-icontrol-platform", "iControl", iControlPlatform, true);
}

function iControlPlatform(log, config, api) {
    this.log = log;
    this.accessories = [];
    this.api = api;
    var platform = this;

    if(config !== null) {
        this.iControl = new iControl({
            system: iControl.Systems[config.system],
            email: config.email,
            password: config.password,
            pinCode: config.pin
        }); 
        this.iControl.login();

        this.api.on('didFinishLaunching', function() {

            if(config === null) {
                for(var i in platform.accessories) {
                    platform.removeAccessory(platform.accessories[i]);
                }
                
            } else {
                platform.iControl._getAccessories(function(data, error) {
                    if(error === null) {
                        platform.addAccessories(data);
                        platform.subscribeEvents();
                    }
                });
            }
        });
    }
}

iControlPlatform.prototype.subscribeEvents = function() {

    //Do this on repeat and send statuses to all accessories
    var self = this;
    
    var recurse = function() {
        process.nextTick(() => {
            self.iControl.subscribeEvents(function(error, data) {
                if(error !== null) {
                    self.log(error);
                } else {
                    //Loop through each event and send it to every accessory
                    //This way each accessory can decide if it needs to do anything with the event
                    //Most accessories will likely look at if the deviceId matches their ID
                    for(var i in data) {
                        var event = data[i];
                        for(var j in self.accessories) {
                            self.accessories[j].event(event);
                        }
                    }
                }
        
                //We're done with this, open a new one
                recurse();
            });
        });
    }

    recurse();

    
}

iControlPlatform.prototype.configureAccessory = function(accessory) {
    this.accessories[accessory.UUID] = accessory;
}

iControlPlatform.prototype.addAccessories = function(APIAccessories) {
    var self = this;
    for(var i in APIAccessories) {
        
        var newAccessory = APIAccessories[i];

        switch(newAccessory.deviceType) {
            case "panel":
            case "sensor":
            case "lightDimmer":
            case "lightSwitch":
                //Supported accessory, continue down below.
                break;
            default:
                //Will skip below for unsupported accessories and move on to the next one in the list.
                //Type of "peripheral" does not have a serial number and cannot be controlled
                continue;
        }

        var uuid = null;
        if(newAccessory.serialNumber === undefined) {
            uuid = UUIDGen.generate(newAccessory.hardwareId);
        } else {
            uuid = UUIDGen.generate(newAccessory.serialNumber);
        }
         
        var accessory = this.accessories[uuid];

        switch(newAccessory.deviceType) {
            case "panel":
                if(accessory === undefined) {
                    self.registerPanelAccessory(newAccessory);
                } else {
                    self.accessories[uuid] = new iControlPanelAccessory(self.log, (accessory instanceof iControlPanelAccessory ? accessory.accessory : accessory), newAccessory, self.iControl);
                }
                break;
            case "sensor":
                //Sensors can be dryContact or motion
                switch(newAccessory.properties.sensorType) {
                    case "dryContact":
                        if(accessory === undefined) {
                            self.registerDoorWindowAccessory(newAccessory);
                        } else {
                            self.accessories[uuid] = new iControlDoorWindowAccessory(self.log, (accessory instanceof iControlDoorWindowAccessory ? accessory.accessory : accessory), newAccessory, self.iControl);
                        }
                        break;
                    
                }
                break;
            case "lightSwitch":
            case "lightDimmer":
                if(accessory === undefined) {
                    self.registerLightAccessory(newAccessory);
                } else {
                    self.accessories[uuid] = new iControlLightAccessory(self.log, (accessory instanceof iControlLightAccessory ? accessory.accessory : accessory), newAccessory, self.iControl);
                }
                break;
        }
        
    }
    this.log("Finished loading.");
}

iControlPlatform.prototype.registerDoorWindowAccessory = function(accessory) {
    var uuid = UUIDGen.generate(accessory.serialNumber);
    var name = accessory.name == '' ? "Dry Contact" : accessory.name;
    var acc = new Accessory(name, uuid);

    acc.addService(Service.ContactSensor);

    this.accessories[uuid] = new iControlDoorWindowAccessory(this.log, acc, accessory, this.iControl);

    this.api.registerPlatformAccessories("homebridge-icontrol-platform", "iControl", [acc]);

}

iControlPlatform.prototype.registerPanelAccessory = function(accessory) {
    var uuid = UUIDGen.generate(accessory.serialNumber);
    var name = accessory.name == '' ? "Security System" : accessory.name;
    var acc = new Accessory(name, uuid);

    acc.addService(Service.SecuritySystem, name);

    this.accessories[uuid] = new iControlPanelAccessory(this.log, acc, accessory, this.iControl);

    this.api.registerPlatformAccessories("homebridge-icontrol-platform", "iControl", [acc]);
}

iControlPlatform.prototype.registerLightAccessory = function(accessory) {
    var uuid = UUIDGen.generate(accessory.hardwareId);
    var name = accessory.name == '' ? "Light" : accessory.name;
    var acc = new Accessory(name, uuid);

    acc.addService(Service.Lightbulb, name);

    this.accessories[uuid] = new iControlLightAccessory(this.log, acc, accessory, this.iControl);

    this.api.registerPlatformAccessories("homebridge-icontrol-platform", "iControl", [acc]);

}

iControlPlatform.prototype.removeAccessory = function(accessory) {
    this.log("Removed all accessories.");
    // return;
    if (accessory) {
        this.log("[" + accessory.name + "] Removed from HomeBridge.");
        if (this.accessories[accessory.UUID]) {
            delete this.accessories[accessory.UUID];
        }
        this.api.unregisterPlatformAccessories("homebridge-icontrol-platform", "iControl", [accessory]);
    }
};