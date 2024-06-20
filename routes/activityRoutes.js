const express = require("express");

const router = express.Router();

const {
    addActivity, 
    deleteActivity, 
    updateActivity,  
    fetchUserActivities,
    searchUserActivities,
    fetchUserActualPercentages, 
    updateActualPercentages, 
    updateStartEndWeekDates,
    updateStartEndYearDates,
    getYearActivities} = require("../controllers/activityController");

//The api route activity/fetchUserActivities - requires authentication
router.get('/fetchUserActivities', fetchUserActivities);

//The api route activity/searchUserActivities - requires authentication
router.get('/searchUserActivities', searchUserActivities);

//The api route to activity/fetchUserActualPercentages - requires authentication
router.get('/fetchUserActualPercentages', fetchUserActualPercentages);

//The api route to activity/updateUserActualPercentages - requires authentication
router.patch('/updateActualPercentages', updateActualPercentages);

//The api route activity/updateUserStartEndWeekDates - requires authentication
router.patch('/updateStartEndWeekDates', updateStartEndWeekDates);

//The api route activity/updateStartEndYearDates - requires authentication
router.patch('/updateStartEndYearDates', updateStartEndYearDates);

//The api route activity/addActivity - requires authentication
router.post('/addActivity', addActivity);

//The api route activity/deleteActivity - requires authentication
router.delete('/deleteActivity', deleteActivity)

//The api route activity/updateActivity - requires authentication
router.patch('/updateActivity', updateActivity);

//The api route activity/getYearActivities - requires authentication
router.get('/getYearActivities', getYearActivities);


module.exports = {
    routes: router
}