import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

// Development URL: use the Network URL from Vite, e.g. http://192.168.1.23:5173
// Production URL: replace this with your deployed HTTPS URL before Android build.
const WEB_APP_URL = 'http://192.168.1.12:5173';

const injectedJavaScript = `
  (function () {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');

    var style = document.createElement('style');
    style.innerHTML = ` + "`" + `
      html, body, #root {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        min-height: 100% !important;
        background: #FFFBF5 !important;
        overscroll-behavior: none !important;
        -webkit-text-size-adjust: 100% !important;
      }
      body {
        overflow-x: hidden !important;
        touch-action: manipulation !important;
      }
      * {
        box-sizing: border-box;
      }
    ` + "`" + `;
    document.head.appendChild(style);
  })();
  true;
`;

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar hidden translucent backgroundColor="transparent" />
      <WebView
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        containerStyle={styles.webviewContainer}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        allowsBackForwardNavigationGestures
        startInLoadingState
        setSupportMultipleWindows={false}
        bounces={false}
        overScrollMode="never"
        mixedContentMode="always"
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        injectedJavaScript={injectedJavaScript}
        scalesPageToFit={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFBF5',
    marginTop: 0,
    marginBottom: 0,
  },
});
