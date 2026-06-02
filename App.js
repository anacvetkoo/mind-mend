import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_APP_URL;
const BIOMETRIC_AUTH_KEY = "mindmendBiometricAuthEnabled";

export default function App() {
  const [isCheckingBiometricAuth, setIsCheckingBiometricAuth] = useState(true);
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [biometricError, setBiometricError] = useState("");

  useEffect(() => {
    checkBiometricAuth();
  }, []);

  const checkBiometricAuth = async () => {
    try {
      const savedBiometricAuthEnabled = await AsyncStorage.getItem(BIOMETRIC_AUTH_KEY);
      const biometricAuthEnabled = savedBiometricAuthEnabled === "true";

      if (!biometricAuthEnabled) {
        setIsBiometricVerified(true);
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setBiometricError("Biometric authentication is not available on this device.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock MindMend",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsBiometricVerified(true);
      } else {
        setBiometricError("Authentication is required to open MindMend.");
      }
    } catch (error) {
      setBiometricError("Something went wrong. Please try again.");
    } finally {
      setIsCheckingBiometricAuth(false);
    }
  };

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "biometricAuthChanged") {
        await AsyncStorage.setItem(BIOMETRIC_AUTH_KEY, String(data.enabled));
      }

      if (data.type === "openURL") {
        await Linking.openURL(data.url);
      }

    } catch (error) {
      console.log("Invalid WebView message:", error);
    }
  };

  if (isCheckingBiometricAuth) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!isBiometricVerified) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <View style={styles.authCard}>
          <Text style={styles.title}>MindMend is locked</Text>
          <Text style={styles.description}>{biometricError}</Text>
          <TouchableOpacity style={styles.button} onPress={checkBiometricAuth}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <WebView
        source={{ uri: 'https://mindmend-a8839.web.app' }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        onMessage={handleMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  authCard: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#A78BFA",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  webview: {
    flex: 1,
  },
});