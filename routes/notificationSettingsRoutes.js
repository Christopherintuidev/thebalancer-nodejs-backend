const express = require("express");
const router = express.Router();

const {getAllNotificationSettings, updateNotificationSettings} = require('../controllers/notificationSettingsController')

//The api route to get all the user account notifications settings - requires authentication
router.get('/getSettings', getAllNotificationSettings);

//The api route to update the user account notifications settings - requires authentication
router.post('/updateSettings', updateNotificationSettings);

module.exports = {
    routes: router,
}