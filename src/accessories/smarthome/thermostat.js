'use strict';

const Logger = require('../../helper/logger.js');

class SmarthomeThermostatAccessory {

  constructor (api, accessory, handler, FakeGatoHistoryService) {
    
    this.api = api;
    this.accessory = accessory;
    this.FakeGatoHistoryService = FakeGatoHistoryService;
    
    this.handler = handler;
    
    this.getService();

  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  // Services
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  getService () {
    
    let service = this.accessory.getService(this.api.hap.Service.Thermostat);
    
    if(!service){
      Logger.info('Adding Thermostat service', this.accessory.displayName);
      service = this.accessory.addService(this.api.hap.Service.Thermostat, this.accessory.displayName, this.accessory.context.config.subtype);
    }
    
    if(this.accessory.context.config.battery){
      
      let batteryService = this.accessory.getService(this.api.hap.Service.BatteryService);
      
      if(!batteryService){
        Logger.info('Adding Battery service', this.accessory.displayName);
        batteryService = this.accessory.addService(this.api.hap.Service.BatteryService);
      }
      
      batteryService
        .setCharacteristic(this.api.hap.Characteristic.ChargingState, this.api.hap.Characteristic.ChargingState.NOT_CHARGEABLE);
      
    }
    
    service.getCharacteristic(this.api.hap.Characteristic.TargetHeatingCoolingState)
      .setProps({
        maxValue: 2
      });
      
    service.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
      .setProps({
        minValue: -100,
        maxValue: 100
      });
      
    service.getCharacteristic(this.api.hap.Characteristic.TargetTemperature)
      .setProps({
        minValue: 8,
        maxValue: 28,
        minStep: 0.5
      });
      
    service.getCharacteristic(this.api.hap.Characteristic.TemperatureDisplayUnits)
      .setProps({
        maxValue: 1
      });
      
    if (!service.testCharacteristic(this.api.hap.Characteristic.ValvePosition))
      service.addCharacteristic(this.api.hap.Characteristic.ValvePosition);
      
    /*if (!service.testCharacteristic(this.api.hap.Characteristic.ProgramCommand))
      service.addCharacteristic(this.api.hap.Characteristic.ProgramCommand);
      
    if (!service.testCharacteristic(this.api.hap.Characteristic.ProgramData))
      service.addCharacteristic(this.api.hap.Characteristic.ProgramData);*/
    
    this.historyService = new this.FakeGatoHistoryService('thermo', this.accessory, {storage:'fs', path: this.api.user.storagePath() + '/fritzbox/'}); 
    
    if(this.accessory.context.polling.timer && (!this.accessory.context.polling.exclude.includes(this.accessory.context.config.type) && !this.accessory.context.polling.exclude.includes(this.accessory.context.config.subtype) && !this.accessory.context.polling.exclude.includes(this.accessory.displayName))){

      service.getCharacteristic(this.api.hap.Characteristic.TargetHeatingCoolingState)
        .on('set', this.handler.set.bind(this, this.accessory, this.api.hap.Service.Thermostat, this.api.hap.Characteristic.TargetHeatingCoolingState, 'smarthome-thermostat', 'state'));
        
      service.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
        .on('change', this.handler.change.bind(this, this.accessory, this.accessory.context.config.subtype, this.accessory.displayName, this.historyService));

      service.getCharacteristic(this.api.hap.Characteristic.TargetTemperature)
        .on('set', this.handler.set.bind(this, this.accessory, this.api.hap.Service.Thermostat, this.api.hap.Characteristic.TargetTemperature, 'smarthome-thermostat', 'temperature'))
        .on('change', this.handler.change.bind(this, this.accessory, this.accessory.context.config.subtype, this.accessory.displayName, this.historyService));
        
      service.getCharacteristic(this.api.hap.Characteristic.ValvePosition)
        .on('change', this.handler.change.bind(this, this.accessory, this.accessory.context.config.subtype, this.accessory.displayName, this.historyService));
 
    } else {
 
      service.getCharacteristic(this.api.hap.Characteristic.CurrentHeatingCoolingState)
        .on('get', this.handler.get.bind(this, this.accessory, this.api.hap.Service.Thermostat, false, this.accessory.context.config.subtype, false));
        
      service.getCharacteristic(this.api.hap.Characteristic.TargetHeatingCoolingState)
        .on('get', this.handler.get.bind(this, this.accessory, this.api.hap.Service.Thermostat, false, this.accessory.context.config.subtype, false))
        .on('set', this.handler.set.bind(this, this.accessory, this.api.hap.Service.Thermostat, this.api.hap.Characteristic.TargetHeatingCoolingState, 'smarthome-thermostat', 'state'));
        
      service.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
        .on('get', this.handler.get.bind(this, this.accessory, this.api.hap.Service.Thermostat, false, this.accessory.context.config.subtype, false))
        .on('change', this.handler.change.bind(this, this.accessory, this.accessory.context.config.subtype, this.accessory.displayName, this.historyService));
        
      service.getCharacteristic(this.api.hap.Characteristic.TargetTemperature)
        .on('get', this.handler.get.bind(this, this.accessory, this.api.hap.Service.Thermostat, false, this.accessory.context.config.subtype, false))
        .on('set', this.handler.set.bind(this, this.accessory, this.api.hap.Service.Thermostat, this.api.hap.Characteristic.TargetTemperature, 'smarthome-thermostat', 'temperature'))
        .on('change', this.handler.change.bind(this, this.accessory, this.accessory.context.config.subtype, this.accessory.displayName, this.historyService));
        
      service.getCharacteristic(this.api.hap.Characteristic.ValvePosition)
        .on('change', this.handler.change.bind(this, this.accessory, this.accessory.context.config.subtype, this.accessory.displayName, this.historyService));
 
    }
    
  }

}

module.exports = SmarthomeThermostatAccessory;