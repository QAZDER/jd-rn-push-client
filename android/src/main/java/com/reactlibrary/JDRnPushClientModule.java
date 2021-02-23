package com.reactlibrary;

import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.reactlibrary.JDRnPushClientService;

public class JDRnPushClientModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public JDRnPushClientModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "JDRnPushClient";
    }

    @ReactMethod
    public void startPushService(Callback callback) {
        Intent intent1 = new Intent(getReactApplicationContext(), JDRnPushClientService.class);
        getReactApplicationContext().startService(intent1);
        callback.invoke("PushService Start...");
    }
}
