const admin = require("firebase-admin");
const serviceAccount = require("./service.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

exports.send_notification = async (parameter) => {
  console.log("Inside sendNotification method");
  try {
    const { token, title, body } = parameter;

    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: token,
    };

    console.log("Sending notification:", message);

    const response = await admin.messaging().send(message);

    console.log("Notification sent successfully:", response);

    return {
      success: true,
      messageId: response,
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
