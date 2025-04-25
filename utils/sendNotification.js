const admin = require("../config/firebase");

// This is for sent notification to all usere in app
const sendNotification = async (token, title, body) => {
    const message = {
        notification: { title, body },
        token: token,
    };

    try {
        await admin.messaging().send(message);
        console.log("Notification sent successfully!");
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

module.exports = sendNotification;
