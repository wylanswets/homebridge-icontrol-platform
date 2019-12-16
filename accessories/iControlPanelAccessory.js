var iControlAccessory = require("./iControlAccessory.js");

function iControlPanelAccessory(log, accessory, panel, session) {
  iControlAccessory.call(this, log, accessory, panel, session);

  this.panel = panel;

  this.service = this.accessory.getService(global.Service.SecuritySystem);
  
  this.service
      .getCharacteristic(global.Characteristic.SecuritySystemTargetState)
      .on('get', this._getTargetState.bind(this))
      .on('set', this._setTargetState.bind(this));

  this.service
      .getCharacteristic(global.Characteristic.SecuritySystemCurrentState)
      .on('get', this._getCurrentState.bind(this));
    


  this.accessory.updateReachability(true);

}

iControlPanelAccessory.prototype = Object.create(iControlAccessory.prototype);


iControlAccessory.prototype.event = function(event) {
  // console.log("Event is now in panel accessory");
  // console.log(event);

  if(event.mediaType == "event/securityStateChange") {
    var armType = event.metadata.armType || 'disarmed';
    // console.log("Setting arm state to " + armType);
    // console.log(event);

    this.service
      .getCharacteristic(global.Characteristic.SecuritySystemTargetState)
      .setValue(this._getHomeKitStateFromArmState(armType), null, "internal");

    if(event.metadata.status != 'arming') {
      this.service
        .getCharacteristic(global.Characteristic.SecuritySystemCurrentState)
        .setValue(this._getHomeKitStateFromArmState(armType));
    }
    
  }

}

iControlPanelAccessory.prototype._getTargetState = function(callback) {
  var self = this;
  this.session._getCurrentStatus(function(data, error) {
    if(error === null) {
      for(var i in data.devices) {
        var device = data.devices[i];
        if(device.serialNumber == self.panel.serialNumber) {
          var armType = device.properties.armType || "disarmed"; // "away", "night", "stay", or null (disarmed)
          var currentState = self._getHomeKitStateFromArmState(armType);
          callback(null, currentState);
        }
        
      }
    } else {
      callback(null, null);
    }
      
  });
}

iControlPanelAccessory.prototype._getCurrentState = function(callback) {
  var self = this;
  this.session._getCurrentStatus(function(data, error) {
    if(error === null) {
      for(var i in data.devices) {
        var device = data.devices[i];
        if(device.serialNumber == self.panel.serialNumber) {
          var armType = device.properties.armType || "disarmed"; // "away", "night", "stay", or null (disarmed)
          if(armType != "disarmed" && device.properties.status == "arming") {
            //We are here when we have not yet fully armed the panel yet.
            //Disarmed is the correct current state, target state is the arm state.
            armType = 'disarmed'; 
          }
          var currentState = self._getHomeKitStateFromArmState(armType);
          callback(null, currentState);
        }
        
      }
    } else {
      callback(null, null);
    }
      
  });
}

iControlPanelAccessory.prototype._setTargetState = function(targetState, callback, context) {
  if (context == "internal") return callback(null); // we set this state ourself, no need to react to it

  var armState = this._getArmStateFromHomeKitState(targetState);
  

  var endpoint = (armState == "disarmed" ? "disarm" : "arm");
  var form = {
    code: this.session.pinCode
  }
  
  if (endpoint !== "disarm"){
    form.armType = armState;
    form.path = this.panel._links['panel/arm'].href;
  } else {
    form.path = this.panel._links['panel/disarm'].href;
  }
    

  var req = {
    method: "POST",
    path: "client/icontrol/panel/" + endpoint,
    form: form
  }
  var self = this;
  this.session._makeAuthenticatedRequest(req, function(data, error) {
    if(error === null) {
      self.service
        .getCharacteristic(Characteristic.SecuritySystemTargetState)
        .setValue(targetState, null, "internal");

      //There is no event trigger to tell homekit we did disarm, so set it right now.
      if(armState == 'disarmed') {
        self.service
          .getCharacteristic(Characteristic.SecuritySystemCurrentState)
          .setValue(targetState);
      }
      callback(null);
    } else {
      callback(null);
    }
    
  });

}


iControlPanelAccessory.prototype._getHomeKitStateFromArmState = function(armState) {
  switch (armState) {
    case "disarmed": return Characteristic.SecuritySystemCurrentState.DISARMED;
    case "away": return Characteristic.SecuritySystemCurrentState.AWAY_ARM;
    case "night": return Characteristic.SecuritySystemCurrentState.NIGHT_ARM;
    case "stay": return Characteristic.SecuritySystemCurrentState.STAY_ARM;
  }
}

iControlPanelAccessory.prototype._getArmStateFromHomeKitState = function(homeKitState) {
  switch (homeKitState) {
    case Characteristic.SecuritySystemCurrentState.DISARMED: return "disarmed";
    case Characteristic.SecuritySystemCurrentState.AWAY_ARM: return "away";
    case Characteristic.SecuritySystemCurrentState.NIGHT_ARM: return "night";
    case Characteristic.SecuritySystemCurrentState.STAY_ARM: return "stay";
  }
}




module.exports = iControlPanelAccessory;
