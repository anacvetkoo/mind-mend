import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
// 🔥 Spremenjeno v /legacy uvoz, da TypeScript ne javlja napak in koda deluje stabilno:
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Potrebno za pravilno zapiranje browser popup-a po OAuth
WebBrowser.maybeCompleteAuthSession();

const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_APP_URL;
const BIOMETRIC_AUTH_KEY = "mindmendBiometricAuthEnabled";

const ANDROID_CLIENT_ID = "163326676496-r2uh0s7ooi6pmv3sdp3b6r04r7a8lbek.apps.googleusercontent.com";
const IOS_CLIENT_ID = "163326676496-r2uh0s7ooi6pmv3sdp3b6r04r7a8lbek.apps.googleusercontent.com";
const WEB_CLIENT_ID = "163326676496-r2uh0s7ooi6pmv3sdp3b6r04r7a8lbek.apps.googleusercontent.com";

// ─── Push Notifications setup ─────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'bcbde360-111d-4d94-ad8b-679d820f6ae1',
  });

  return tokenData.data;
};

export default function App() {
  const webViewRef = useRef(null);
  const pendingRoleRef = useRef("user");

  const [isCheckingBiometricAuth, setIsCheckingBiometricAuth] = useState(true);
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [biometricError, setBiometricError] = useState("");

  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
  });

  // ─── Registracija Expo push tokena ───────────────────────────────────────────

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token && webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({ type: 'EXPO_PUSH_TOKEN', token })
        );
      }
    });
  }, []);

  // ─── Obdelaj Google OAuth odgovor ──────────────────────────────────────────

  useEffect(() => {
    if (!googleResponse || !webViewRef.current) return;

    if (googleResponse.type === "success") {
      const idToken =
        googleResponse.params?.id_token ??
        googleResponse.authentication?.idToken;

      if (idToken) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "GOOGLE_SIGN_IN_RESULT",
            idToken,
            role: pendingRoleRef.current,
          })
        );
      } else {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "GOOGLE_SIGN_IN_ERROR",
            error: "No ID token received from Google.",
          })
        );
      }
    }

    if (googleResponse.type === "error") {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "GOOGLE_SIGN_IN_ERROR",
          error: googleResponse.error?.message ?? "Google sign-in failed.",
        })
      );
    }

    if (googleResponse.type === "dismiss") {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "GOOGLE_SIGN_IN_ERROR",
          error: "cancelled",
        })
      );
    }
  }, [googleResponse]);

  // ─── Biometric auth ─────────────────────────────────────────────────────────

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

  // ─── WebView message handler ─────────────────────────────────────────────────

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "GOOGLE_SIGN_IN_REQUEST") {
        pendingRoleRef.current = data.role ?? "user";
        await promptGoogleAsync();
        return;
      }

      if (data.type === "biometricAuthChanged") {
        await AsyncStorage.setItem(BIOMETRIC_AUTH_KEY, String(data.enabled));
        return;
      }

      if ((data.type === "openURL" || data.type === "openExternalUrl") && data.url) {
        const canOpen = await Linking.canOpenURL(data.url);
        if (canOpen) {
          await Linking.openURL(data.url);
        }
        return;
      }

      // shranjevanje pdf
      if (data.type === "downloadPDF") {
        const fileUri = `${FileSystem.documentDirectory}${data.fileName}`;
        
        await FileSystem.writeAsStringAsync(fileUri, data.html, {
          encoding: FileSystem.EncodingType.UTF8
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/html',
            dialogTitle: 'Save Cognitive Report',
            UTI: 'public.html'
          });
        } else {
          alert("Sharing is not available on this device.");
        }
        return;
      }

    } catch (error) {
      console.log("Invalid WebView message:", error);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (isCheckingBiometricAuth) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.centeredContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
          <ActivityIndicator size="large" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!isBiometricVerified) {
    return (
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://mindmend-a8839.web.app' }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          onMessage={handleMessage}
          automaticallyAdjustKeyboardInsets={true} //da ne skoči chat gor izven ekrana, isto dodano "softwareKeyboardLayoutMode": "resize" v app.json
        />
      </SafeAreaView>
    </SafeAreaProvider>
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