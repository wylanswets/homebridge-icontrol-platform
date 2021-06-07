function iControlAccessory(log, accessory, data, session) {
  var info = accessory.getService(global.Service.AccessoryInformation);
  
  accessory.context.manufacturer = data.manufacturer;
  info.setCharacteristic(global.Characteristic.Manufacturer, accessory.context.manufacturer.toString());
  
  accessory.context.model = data.model;
  info.setCharacteristic(global.Characteristic.Model, accessory.context.model.toString());
  
  accessory.context.serial = data.serialNumber;
  if(data.serialNumber === undefined) {
    accessory.context.serial = data.hardwareId;
  }
  info.setCharacteristic(global.Characteristic.SerialNumber, accessory.context.serial.toString());
  
  accessory.context.revision = data.firmwareVersion;
  info.setCharacteristic(global.Characteristic.FirmwareRevision, accessory.context.revision.toString());
  
  this.accessory = accessory;
  this.log = log;
  this.session = session;
  this.deviceId = data.id;
}

iControlAccessory.prototype.event = function(event) {
  //This method needs to be overridden in each accessory type
}

module.exports = iControlAccessory;
