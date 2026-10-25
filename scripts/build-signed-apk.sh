#!/usr/bin/env bash
set -e

echo "🚀 Building official production Android APK for Merchant Radar & Bayyaa (radar-al-tajer-signed.apk)..."

WORKSPACE="/tmp/android-apk-build"
rm -rf "$WORKSPACE"
mkdir -p "$WORKSPACE"/src/com/radaregypt/merchant
mkdir -p "$WORKSPACE"/res/mipmap-hdpi
mkdir -p "$WORKSPACE"/res/mipmap-mdpi
mkdir -p "$WORKSPACE"/res/mipmap-xhdpi
mkdir -p "$WORKSPACE"/res/mipmap-xxhdpi
mkdir -p "$WORKSPACE"/res/mipmap-xxxhdpi
mkdir -p "$WORKSPACE"/res/values
mkdir -p "$WORKSPACE"/bin

# Copy app icons from public
if [ -f "public/icon-192.png" ]; then
  cp public/icon-192.png "$WORKSPACE"/res/mipmap-hdpi/ic_launcher.png
  cp public/icon-192.png "$WORKSPACE"/res/mipmap-mdpi/ic_launcher.png
  cp public/icon-192.png "$WORKSPACE"/res/mipmap-xhdpi/ic_launcher.png
  cp public/pwa-512x512.png "$WORKSPACE"/res/mipmap-xxhdpi/ic_launcher.png
  cp public/pwa-512x512.png "$WORKSPACE"/res/mipmap-xxxhdpi/ic_launcher.png
fi

# 1. Strings & Styles XML
cat << 'EOF' > "$WORKSPACE"/res/values/strings.xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">رادار التاجر | منصة بياع</string>
</resources>
EOF

# 2. AndroidManifest.xml (Valid XML with minSdk=24, targetSdk=34)
cat << 'EOF' > "$WORKSPACE"/AndroidManifest.xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.radaregypt.merchant"
    android:versionCode="205"
    android:versionName="2.5.0">

    <uses-sdk
        android:minSdkVersion="24"
        android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">

        <activity
            android:name="com.radaregypt.merchant.MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# 3. Java Source Code: MainActivity.java
cat << 'EOF' > "$WORKSPACE"/src/com/radaregypt/merchant/MainActivity.java
package com.radaregypt.merchant;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.content.Intent;
import android.net.Uri;
import android.widget.Toast;

public class MainActivity extends Activity {
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private static final int FILE_CHOOSER_RESULT_CODE = 1001;
    private static final String APP_URL = "https://ais-pre-cb7qhbahqlyxmzg4wbchd2-68418496670.europe-west2.run.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setUserAgentString(settings.getUserAgentString() + " RadarEgyptMerchantApp/2.5.0");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }
                view.loadUrl(url);
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                MainActivity.this.filePathCallback = filePathCallback;
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_RESULT_CODE);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        webView.loadUrl(APP_URL);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (filePathCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    if (data.getData() != null) {
                        results = new Uri[]{data.getData()};
                    } else if (data.getClipData() != null) {
                        int count = data.getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = data.getClipData().getItemAt(i).getUri();
                        }
                    }
                }
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
EOF

# 4. Compile R.java and package resources with AAPT
echo "Compiling Android resources with aapt..."
aapt package -f -m \
  -J "$WORKSPACE"/src \
  -M "$WORKSPACE"/AndroidManifest.xml \
  -S "$WORKSPACE"/res \
  -I /tmp/android.jar

# 5. Compile Java Source to bytecode
echo "Compiling Java sources..."
javac -source 1.8 -target 1.8 \
  -bootclasspath /tmp/android.jar \
  -cp /tmp/android.jar \
  -d "$WORKSPACE"/bin \
  "$WORKSPACE"/src/com/radaregypt/merchant/*.java

# 6. Convert bytecode to Dalvik Executable (classes.dex) with D8
echo "Running D8 to generate classes.dex..."
java -cp /tmp/r8.jar com.android.tools.r8.D8 \
  --min-api 24 \
  --lib /tmp/android.jar \
  --output "$WORKSPACE"/bin \
  "$WORKSPACE"/bin/com/radaregypt/merchant/*.class

# 7. Package unsigned APK with AAPT
echo "Creating base APK..."
aapt package -f \
  -M "$WORKSPACE"/AndroidManifest.xml \
  -S "$WORKSPACE"/res \
  -I /tmp/android.jar \
  -F "$WORKSPACE"/bin/unsigned.apk

# Add classes.dex to APK
cd "$WORKSPACE"/bin
aapt add unsigned.apk classes.dex
cd -

# 8. Align APK with zipalign (4-byte alignment)
echo "Aligning APK with zipalign..."
zipalign -v -p 4 "$WORKSPACE"/bin/unsigned.apk "$WORKSPACE"/bin/aligned.apk

# 9. Create a keystore if not exists
KEYSTORE="/tmp/radar_release.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "Generating Android release signing key..."
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias radar_merchant \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass radar2026pass \
    -keypass radar2026pass \
    -dname "CN=Merchant Radar Egypt, OU=Mobile Division, O=Radar Egypt Inc, L=Cairo, ST=Cairo, C=EG"
fi

# 10. Sign APK with apksigner (v1, v2, v3 signature schemes)
echo "Signing APK with apksigner (v1 + v2 + v3 schemes)..."
apksigner sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:radar2026pass \
  --ks-key-alias radar_merchant \
  --key-pass pass:radar2026pass \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --v3-signing-enabled true \
  --out "$WORKSPACE"/radar-al-tajer-signed.apk \
  "$WORKSPACE"/bin/aligned.apk

# 11. Verify APK signature and integrity
echo "Verifying signed APK..."
apksigner verify --verbose "$WORKSPACE"/radar-al-tajer-signed.apk

# 12. Copy signed APK to public/ and dist/
cp "$WORKSPACE"/radar-al-tajer-signed.apk public/radar-al-tajer-signed.apk
if [ -d "dist" ]; then
  cp "$WORKSPACE"/radar-al-tajer-signed.apk dist/radar-al-tajer-signed.apk
fi

echo "✅ SUCCESS: radar-al-tajer-signed.apk generated and verified! Size: $(ls -lh public/radar-al-tajer-signed.apk | awk '{print $5}')"
