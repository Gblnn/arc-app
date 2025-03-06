// netlify/functions/checkOvertime.js
import { db } from "../../src/firebase"; // Adjust the path to your Firebase setup
import { getDocs, collection, query, where } from "firebase/firestore";
import admin from "firebase-admin";
import serviceAccount from "./path/to/your/serviceAccountKey.json"; // Path to your Firebase service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const handler = async (event, context) => {
  try {
    // Fetch active records
    const recordsCollection = collection(db, "records");
    const activeRecordsQuery = query(
      recordsCollection,
      where("status", "==", true)
    );
    const querySnapshot = await getDocs(activeRecordsQuery);

    const notifications = [];

    querySnapshot.forEach((doc) => {
      const record = doc.data();
      const startTime = record.start.toDate();
      const endTime = record.end ? record.end.toDate() : new Date();

      // Calculate total hours
      const totalHours = (endTime - startTime) / (1000 * 60 * 60); // Convert milliseconds to hours

      // Check if total hours exceed 3 hours
      if (totalHours > 3) {
        notifications.push({
          userId: record.email, // Assuming email is used to identify the user
          message: `Your record with ID ${doc.id} has exceeded 3 hours of overtime.`,
        });
      }
    });

    // Send notifications (you can use a service like Firebase Cloud Messaging)
    notifications.forEach(async (notification) => {
      const message = {
        notification: {
          title: "Overtime Alert",
          body: notification.message,
        },
        token: notification.userId, // Assuming you have the user's FCM token
      };

      // Send a notification
      await admin.messaging().send(message);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Overtime check completed." }),
    };
  } catch (error) {
    console.error("Error checking overtime:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to check overtime." }),
    };
  }
};