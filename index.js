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

// Endpoint to save the device token
app.post("/save-token", (req, res) => {
  const { token } = req.body;
  // Save the token to your database (e.g., in-memory array for simplicity)
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
app.post("/send-notification", (req, res) => {
  const { token, message } = req.body;
  console.log(global.tokens);
  const payload = {
    notification: {
      title: message.title || "Default Title",
      body: message.body || "Default Body",
    },
    token: token,
  };

  admin
    .messaging()
    .send(payload)
    .then((response) => {
      console.log("Successfully sent message:", response);
      res.status(200).send({ message: "Notification sent successfully" });
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
      res.status(500).send({ error: "Failed to send notification" });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
