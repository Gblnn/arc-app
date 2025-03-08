// import type { Config } from "@netlify/functions";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import admin from "firebase-admin";

// import { db } from "../../src/firebase";

// // Define the Notification type
// interface Notification {
//   userId: string; // Assuming userId is a string (e.g., email or FCM token)
//   message: string;
// }

// export default async (req: Request) => {
//   try {
//     // Fetch active records
//     const recordsCollection = collection(db, "records");
//     const activeRecordsQuery = query(
//       recordsCollection,
//       where("status", "==", true)
//     );
//     const querySnapshot = await getDocs(activeRecordsQuery);

//     const notifications: Notification[] = []; // Define the notifications array

//     querySnapshot.forEach((doc) => {
//       const record = doc.data();
//       const startTime = record.start.toDate();
//       const endTime = record.end ? record.end.toDate() : new Date();

//       // Calculate total hours
//       const totalHours = (endTime - startTime) / (1000 * 60 * 60); // Convert milliseconds to hours

//       // Check if total hours exceed 3 hours
//       if (totalHours > 3) {
//         notifications.push({
//           userId: record.email, // Assuming email is used to identify the user
//           message: `Your record with ID ${doc.id} has exceeded 3 hours of overtime.`,
//         });
//       }
//     });

//     // Send notifications (you can use a service like Firebase Cloud Messaging)
//     for (const notification of notifications) {
//       const message = {
//         notification: {
//           title: "Overtime Alert",
//           body: notification.message,
//         },
//         token: notification.userId, // Assuming you have the user's FCM token
//       };

//       // Send a notification
//       await admin.messaging().send(message);
//     }

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "Overtime check completed." }),
//     };
//   } catch (error) {}

//   const { next_run } = await req.json();
//   console.log("Received event Next invocation at:", next_run);
// };

// export const config: Config = {
//   schedule: "* * * * * ",
// };
