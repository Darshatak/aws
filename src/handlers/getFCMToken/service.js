const admin = require("firebase-admin");
const serviceAccount = require("./service.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.getFCMToken = async (parameter) => {
  try {
    const userId = String(parameter.userId);

    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return { token: null, message: "User not found" };
    }

    const { FCMToken } = userDoc.data();

    if (!FCMToken) {
      return { token: null, message: "No FCM token found for this user" };
    }

    console.log("FCMToken:", FCMToken);
    console.log("User ID:", userId);

    return {
      userId: userId,
      token: FCMToken,
    };
  } catch (error) {
    throw error;
  }
};
