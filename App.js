import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_APP_URL;

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <WebView
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  webview: {
    flex: 1,
  },
});