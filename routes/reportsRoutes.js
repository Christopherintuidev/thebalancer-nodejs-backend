const express = require("express");
const router = express.Router();
const verifyToken = require("../controllers/authMiddleware");
const {insertReport, fetchReports, updateReports, resetReportData} = require("../controllers/reportsController");


// The api route to insert report for the user at account creation time
router.post("/insertReport", insertReport);

//The api route to fetch user reports
router.get("/getReports", verifyToken, fetchReports);

//The api route to update user reports
router.patch("/updateReports", verifyToken, updateReports);

//The api route to reset selected year reports
router.delete("/resetReport", verifyToken, resetReportData);


module.exports ={
    routes: router,
}