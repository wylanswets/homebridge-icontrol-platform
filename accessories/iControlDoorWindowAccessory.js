var iControlAccessory = require("./iControlAccessory.js");

function iControlDoorWindowAccessory(log, accessory, sensor, session) {
    iControlAccessory.call(this, log, accessory, sensor, session);

    this.sensor = sensor;

    this.service = this.accessory.getService(global.Service.ContactSensor);

    this.service
        .getCharacteristic(global.Characteristic.ContactSensorState)
        .on('get', this._getCurrentState.bind(this));

    this.service
        .getCharacteristic(global.Characteristic.StatusTampered)
        .on('get', this._getTamperStatus.bind(this));


    this.accessory.updateReachability(true);

}

iControlDoorWindowAccessory.prototype = Object.create(iControlAccessory.prototype);


iControlDoorWindowAccessory.prototype.event = function(event) {
 
    //Check if this event is for this sensor
    if(event.deviceId === this.sensor.id) {
        console.log(event);
        //Faulted is contact open or closed
        if(event.name === 'isFaulted') {
            var targetState = this._getHomeKitStateFromCurrentState(event.value);
            this.service
                .getCharacteristic(Characteristic.ContactSensorState)
                .setValue(targetState);
        }

        //trouble -> senTamp / senTampRes is tamper
        if(event.name === 'trouble') {
            if(event.value === 'senTamp' || event.value === 'senTampRes') {
                var tamperStatus = this._getHomeKitTamperStateFromTamperState(event.value);
                this.service
                    .getCharacteristic(Characteristic.StatusTampered)
                    .setValue(tamperStatus);
            }
        }

    }
}

iControlDoorWindowAccessory.prototype._getTamperStatus = function(callback) {
    var self = this;
    this.session._getCurrentStatus(function(data, error) {
        if(error === null) {
            for(var i in data.devices) {
                var device = data.devices[i];
                if(device.serialNumber == self.sensor.serialNumber) {
                  var tampered = false;
                  if(device.trouble.length !== 0) {
                      for(var j in device.trouble) {
                          if(device.trouble[j].name === 'senTamp') {
                              tampered = true;
                          }
                      }
                  }
      
                  var tamperStatus = self._getHomeKitTamperStateFromTamperState(tampered);
      
                  callback(tamperStatus);
                }
                
              }
        } else {
            callback(null);
        }
        
    });
}

iControlDoorWindowAccessory.prototype._getCurrentState = function(callback) {
  var self = this;
  this.session._getCurrentStatus(function(data, error) {
      if(error === null) {
        for(var i in data.devices) {
            var device = data.devices[i];
            if(device.serialNumber == self.sensor.serialNumber) {
                var currentState = self._getHomeKitStateFromCurrentState(device.properties.isFaulted);
                callback(null, currentState);
            }
            
          }
      } else {
          callback(null, null);
      }
      
  });
}

iControlDoorWindowAccessory.prototype._getHomeKitStateFromCurrentState = function(isFaulted) {
  switch (isFaulted) {
    case true: 
    case 'true':
        return Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
    case false: 
    case 'false':
        return Characteristic.ContactSensorState.CONTACT_DETECTED;
    
  }
}

iControlDoorWindowAccessory.prototype._getHomeKitTamperStateFromTamperState = function(tamperValue) {
    switch (tamperValue) {
      case true: 
      case 'senTamp':
          return Characteristic.StatusTampered.TAMPERED;
      case false: 
      case 'senTampRes':
          return Characteristic.StatusTampered.NOT_TAMPERED;
      
    }
}

module.exports = iControlDoorWindowAccessory;
