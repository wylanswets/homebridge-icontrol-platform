var iControlAccessory = require("./iControlAccessory.js");

function iControlLightAccessory(log, accessory, light, session) {
    iControlAccessory.call(this, log, accessory, light, session);

    this.light = light;

    this.service = this.accessory.getService(global.Service.Lightbulb);

    this.service
        .getCharacteristic(global.Characteristic.On)
        .on('get', this._getCurrentState.bind(this))
        .on('set', this._setOnOffState.bind(this));

    if(this.light.properties.dimAllowed) {
        this.service
            .getCharacteristic(global.Characteristic.Brightness)
            .on('get', this._getBrightnessState.bind(this))
            .on('set', this._setBrightnessState.bind(this));
    }
    
    this._gettingState = false;
    this._gettingBrightness = false;
    var date = new Date();
    this._lastSetDate = date.getTime();

    this.accessory.updateReachability(true);

}

iControlLightAccessory.prototype = Object.create(iControlAccessory.prototype);


iControlLightAccessory.prototype.event = function(event) {

    var self = this;
    if(event.deviceId === this.light.id) {
        //This is for brightness
        self.service
            .getCharacteristic(global.Characteristic.Brightness)
            .setValue(event.metadata.level, null, "internal");

    } else if(event.metadata.commandType === "lightingUpdate") {
        //Since the API does not tell us which light it is, every light will have to get its own status again.
        this._getCurrentState(function(error, result) {
            if(error === null) {
                this._gettingState = false;
                self.service
                    .getCharacteristic(global.Characteristic.On)
                    .setValue(result, null, "internal");
            }
        });
    }
}

iControlLightAccessory.prototype._getBrightnessState = function(callback) {
    var self = this;
    this.session._getCurrentStatus(function(data, error) {
        if(error === null) {
            for(var i in data.devices) {
                var device = data.devices[i];
                if(device.hardwareId == self.light.hardwareId) {
                    callback(null, device.properties.level);
                    return;
                }
            }
        } else {
                callback(error, null);
        }
    });
}

iControlLightAccessory.prototype._setBrightnessState = function(brightness, callback, context) {
    
    if (context == "internal") {
        return callback(null);
    }
    this._lastSetDate = new Date();
    var self = this;

    var req = {
        method: "POST",
        path: "client/icontrol/update/device",
        form: {
            path: this.light._links.level.href,
            value: brightness
        }
    }

    this.session._makeAuthenticatedRequest(req, function(data, error) {
        if(error === null) {
            self.service
                .getCharacteristic(global.Characteristic.Brightness)
                .setValue(brightness, null, "internal");
            callback(null);
        }
    });


}

iControlLightAccessory.prototype._getCurrentState = function(callback) {
  var self = this;
  this.session._getCurrentStatus(function(data, error) {
      if(error === null) {
        for(var i in data.devices) {
            var device = data.devices[i];
            if(device.hardwareId == self.light.hardwareId) {
                callback(null, device.properties.isOn);
                return;
            }
          }
      } else {
            callback(error, null);
      }
  });
}

iControlLightAccessory.prototype._setOnOffState = function(targetState, callback, context) {
    if (context == "internal") {
        return callback(null);
    }
    this._lastSetDate = new Date();
    var self = this;

    var req = {
        method: "POST",
        path: "client/icontrol/update/device",
        form: {
            path: this.light._links.isOn.href,
            value: targetState
        }
    }

    this.session._makeAuthenticatedRequest(req, function(data, error) {
        if(error === null) {
            self.service
                .getCharacteristic(global.Characteristic.On)
                .setValue(targetState, null, "internal");
            callback(null);
        }
    });

}

module.exports = iControlLightAccessory;
