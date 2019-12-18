# homebridge-icontrol-platform
Enables iControl home security systems and other accessories in Homebridge for homekit
Currently only supports XFinity Home (the one I have)

To install:

    npm install -g homebridge-icontrol-platform

To configure, add this to your homebridge config.json file:
    
    
    "platforms": [
        {
            "platform": "iControl",
            "name": "iControl Platform",
            "system": "XFINITY_HOME",
            "email": "email@email.com",
            "password": "password_here",
            "pin": "1234",
            "ignored_devices": []
        }
    ]

Note: ignored_devices are not currently used and may change - but the long term concept is you could filter out devices on the platform you do not actually want shown in homekit.

Started from https://github.com/nfarina/homebridge-icontrol

I helped to update the iControl accessory plugin above, then was inspired to fully support the platform by supporting all peripherals.

## Not yet done:
* Alarm being set off to trigger homekit alarm "triggered" state.

## Supports:
* Alarm Panel (does not yet trigger alarm state in homekit - haven't set my alarm off to test yet)
* Door / Window sensors (gives live open / close state)
* "Lights" (outlets) - when these are in dimmable mode homekit will show a dimmer, when in on/off mode you will only get a switch. 

## Does not support:
* Motion sensors - these only trigger motion notices when the alarm is set for away mode rendering these unhelpful for automations and thus cluttering up homekit
