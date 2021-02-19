package com.reactlibrary;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class JDRnPushClientService extends HeadlessJsTaskService {

    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        return new HeadlessJsTaskConfig(
                "MyTestService",
                extras != null ? Arguments.fromBundle(extras) : null,
                1000 * 60 * 60 * 24,
                true
        );
    }

}
