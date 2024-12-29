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
    const { token, message } = req.body;

    if (!token) {
      return res.status(400).send({ error: "Device token is required." });
    }

    if (!message) {
      return res.status(400).send({ error: "Message content is required." });
    }

    // Construct the data-only payload
    const payload = {
      data: {
        title: message.title || "Default Title",
        body: message.body || "Default Body",
        chatId: message.chatId || "", // Include any additional data you need
        path: message.path || "DefaultPath", // For navigation purposes
        // Add other custom data fields as needed
      },
      token: token,
      android: {
        priority: "high",
        ttl: 60 * 60 * 24,
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
        payload: {
          aps: {
            "content-available": 1,
          },
        },
      },
    };

    // Send the message using Firebase Admin SDK
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
