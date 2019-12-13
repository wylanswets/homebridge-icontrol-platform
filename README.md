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

# Current progress:

Only supports the security panel but has an under the hood enhancement for supporting their "notification" system that will have much more up to date status as the panel is actually armed / disarmed.
This notification work will allow future supported devices on the platform to be used in automations provided they send a live status update. 
  
