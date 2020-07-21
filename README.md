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
            "path": "/OPTIONAL/your/absolute/path/persist,
            "refresh_token": "refresh token that you got by using a proxy on your phone"
        }
    ]


## Path parameter (optional): 
Can be an absolute path or relative path - in most cases if you have a spot you know works, just use the absolute path to that folder. If you do not provide a "path" parameter it will default to the relative execution path.

## Refresh Token (optional - workaround for login no longer working)
Due to recent updates from Comcast on their OAuth flow, it initially looks like it will be tricky to get a full login flow working again. As such I have updated the plugin to accept a refresh token in the configuration which can be captured using a proxy (like burpsuite) to intercept the refresh token when your phone app is initially starting up (I was able to see it when booting up the app that was already logged in).

I am not sure how much time I will spend on finding other workarounds or ways forward... as the refresh tokens are very reliable once you have one. The trick is to have a SEPARATE account that Homebridge uses so that the refresh token will not be replaced when you log in to your app with that same account. If there is a need I can point out more helpful instructions for intercepting the tokens, and appologize there is not more that can be done at this time.

Once the refresh token has been used to log in, it can be removed from the config so the internally cached refresh token will be used.

## Not yet done:
* Alarm being set off to trigger homekit alarm "triggered" state.

## Supports:
* Alarm Panel (does not yet trigger alarm state in homekit - haven't set my alarm off to test yet)
* Door / Window sensors (gives live open / close state)
* "Lights" (outlets) - when these are in dimmable mode homekit will show a dimmer, when in on/off mode you will only get a switch. 

## Does not support:
* Motion sensors - these only trigger motion notices when the alarm is set for away mode rendering these unhelpful for automations and thus cluttering up homekit


### Notes
Started from https://github.com/nfarina/homebridge-icontrol

I helped to update the iControl accessory plugin above, then was inspired to fully support the platform by supporting all peripherals.
