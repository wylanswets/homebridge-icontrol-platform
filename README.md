# homebridge-icontrol-platform
Enables iControl home security systems and other accessories in Homebridge for homekit
Currently only supports XFinity Home (the one I have)

Started from https://github.com/nfarina/homebridge-icontrol

I helped to update the iControl accessory plugin above, then was inspired to fully support the platform by supporting all peripherals.

# Current progress:

Only supports the security panel but has an under the hood enhancement for supporting their "notification" system that will have much more up to date status as the panel is actually armed / disarmed.
This notification work will allow future supported devices on the platform to be used in automations provided they send a live status update. 
