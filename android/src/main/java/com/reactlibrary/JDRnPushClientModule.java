package com.reactlibrary;

import android.content.Intent;
import android.util.Log;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.reactlibrary.JDRnPushHeadlessService;
import com.facebook.react.bridge.Callback;

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

    /**
     * JS调用, 启动HeadlessService
     */
    @ReactMethod
    public void startHeadlessService(Callback callback) {
        Intent serviceIntent = new Intent(getReactApplicationContext(), JDRnPushHeadlessService.class);
        getReactApplicationContext().startService(serviceIntent);
        HeadlessJsTaskService.acquireWakeLockNow(getReactApplicationContext());

        callback.invoke("ReactMethod Headless Service Start...");
    }
}
