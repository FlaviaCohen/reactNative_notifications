import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, View, Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import Constants from "expo-constants";

// This only needs to run once when the app starts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// npx eas build:configure
const projectId = Constants.expoConfig.extra.eas.projectId;

export default function App() {
  const permissionsHandler = async () => {
    const settings = await Notifications.getPermissionsAsync();

    const isGranted = settings.granted;
    if (isGranted) {
      Alert.alert(
        "Permission has already been granted!",
        "You can receive notifications"
      );
    } else {
      const request = await Notifications.requestPermissionsAsync();

      if (request.granted) {
        Alert.alert(
          "You have granted permissions",
          "You can now receive notifications"
        );
      } else {
        Alert.alert(
          "You did not grant permissions",
          "You will be unable to receive notifications"
        );
      }
    }
  };

  const scheduleNotificationHandler = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the body of the notification",
        // not visible
        data: {
          userName: "Flavia",
        },
      },
      trigger: {
        seconds: 2,
      },
    });
  };

  // Push notifications, not suported on simulators
  const pushTokenHandler = async () => {
    const configurePushNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();

      if (status !== "granted") {
        const { status } = Notifications.requestPermissionsAsync();
      }

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "push notifications need the appropriate permissions"
        );
      }
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    };
    configurePushNotifications();
  };

  useEffect(() => {
    pushTokenHandler();
  }, []);

  // Local notifications
  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        const userName = notification.request.content.data.userName;
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const userName = response.notification.request.content.data.userName;
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  const sendPushNotificationHandler = () => {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[zrvnjLBjATJ1DB7adaGYmz]",
        title: "Test - sent from a device",
        body: "This is a test!",
      }),
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Button
        title="Schedule notification"
        onPress={scheduleNotificationHandler}
      />
      <View>
        <Button title="Permissions" onPress={permissionsHandler} />
      </View>
      <View style={{ marginBottom: 20 }}>
        <Button
          title="Send Push Notification"
          onPress={sendPushNotificationHandler}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
