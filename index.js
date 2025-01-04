const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with service account
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

app.get("/*", (req, res) => {
  res.status(200).send({ message: "Backend is running 2" });
});

app.post("/user/save-device-token/v2", (req, res) => {
  const { token } = req.body;
  if (!global.tokens) {
    global.tokens = [];
  }
  if (!global.tokens.includes(token)) {
    console.log(global.tokens);
    global.tokens.push(token);
  }
  console.log("Saved token:", token);
  res.status(200).send({ message: "Token saved successfully" });
});

// Endpoint to send a push notification
app.post("/api/send-notification", async (req, res) => {
  try {
    const { token, payload } = req.body;

    //res.body data...........
    // {
    //   "token": "fKN31vVvTjuhuPKKb3EDGK:APA91bFpi1lusHTJnD9BPFF8gZ8KUeWJ3mziLX7gVI2a9E9JRJJ87SShdTdtcBezLH8VfmlNoatpkVa4TbxvACv2nX0phORIhfNVu65atR6Osax3Rv4MxDA",
    //    "message": {
    //     "title": "shuvajit",
    //     "body": "Test Notification from a real device"
    //   },
    //   "data":{
    //   "name": "Mitul Das",
    //   "chatId": "65b88a159a049b00190b3f30",
    //   "parentMessage": "undefined",
    //   "image": "https://ts4uportal-all-files-upload.nyc3.digitaloceanspaces.com/1726243868288-MY_PIC.JPEG",
    //   "path": "message",
    //   "messageId": "676a4614778b08001af097f6"
    //  }
    // }

    if (!token) {
      return res.status(400).send({ error: "Device token is required." });
    }

    if (!message) {
      return res.status(400).send({ error: "Message content is required." });
    }
    if (!data) {
      return res.status(400).send({ error: "No data available, Need to send data from frontend." });
    }

    // Construct the data-only payload
    // const payload = {
    //   data: {
    //     ...data,
    //     ...message,
    //   },
    //   token: token,
    //   android: {
    //     priority: "high",
    //     ttl: 60 * 60 * 24,
    //   },
    //   apns: {
    //     headers: {
    //       "apns-push-type": "background",
    //       "apns-priority": "5",
    //       "apns-topic": "com.schoolshub.ai",
    //     },
    //     payload: {
    //       aps: {
    //         "content-available": true,
    //         // contentAvailable: true,
    //       },
    //     },
    //   },
    // };

    const response = await admin.messaging().send(payload);
    console.log("Successfully sent message:", response);
    res.status(200).send({ message: "Notification sent successfully", messageId: response });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).send({ error: "Failed to send notification", details: error.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
