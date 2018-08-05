package com.yezwallet;

import android.app.Application;

import com.facebook.react.ReactApplication;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import io.invertase.firebase.RNFirebasePackage;
import org.reactnative.camera.RNCameraPackage;
import co.airbitz.fastcrypto.RNFastCryptoPackage;
import com.crypho.scrypt.RNScryptPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.CallbackManager;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

protected static CallbackManager getCallbackManager() {
  return mCallbackManager;
}

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNGoogleSigninPackage(),
            new RNFirebasePackage(),
            new RNCameraPackage(),
            new RNFastCryptoPackage(),
            new RNScryptPackage()
      );
    }

     @Override
    protected String getJSMainModuleName() {
      return "index";
    }
};

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

 

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
