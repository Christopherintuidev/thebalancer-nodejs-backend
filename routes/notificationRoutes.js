const express = require("express");

const router = express.Router();

const {addNotification, getAllNotifications, cancelNotifications, getYesterdayDoneNotifications, getCurrentWeekNotifications, cancelSpecificNotifications} = require("../controllers/notificationController");

//The api route to add notification - requires authentication
router.post("/addNotification", addNotification);

//The api route to get all user notifications - requires authentication
router.get("/getAllNotifications", getAllNotifications);

//The api route to get yesterday done user notifications - requires authentication
router.get("/getYesterdayDoneNotifications", getYesterdayDoneNotifications);

//The api route to get current week notifications - requires authentication
router.get("/getCurrentWeekNotifications", getCurrentWeekNotifications);

//The api route to cancel all the user notifications - requires authentication
router.delete("/cancelNotifications", cancelNotifications);

//The api route to cancel the specific notification
router.delete("/cancelSpecificNotification", cancelSpecificNotifications);

module.exports = {
    routes: router
}