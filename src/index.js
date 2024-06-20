const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config");
const verifyToken = require("../controllers/authMiddleware");
const appRoutes = require("../routes/routes");
const activityRoutes = require("../routes/activityRoutes");
const notificationRoutes = require("../routes/notificationRoutes");
const notificationSettingsRoutes = require("../routes/notificationSettingsRoutes");
const reportsRoutes = require("../routes/reportsRoutes");
const upload = require("../controllers/mutlerMiddleware");

const app = express();

app.use(cors());
app.use(bodyParser.json());

console.log(__dirname);
app.use(express.static(__dirname + '/uploads/profileImages'));

//The api route to create database
app.use("/createDB", appRoutes.routes);

//The api route just to check if user name exists or not
app.use("/check", appRoutes.routes);

//The api route to authenticate user
app.use("/auth", appRoutes.routes);

//The api route to create new user
app.use("/create", appRoutes.routes);

//The api route to verify user email
app.use("/verify", appRoutes.routes)

//The api route to fetch user details etc
app.use("/get", verifyToken ,appRoutes.routes);

//The api route to update user details or settings;
app.use("/update", verifyToken, appRoutes.routes);

//The api route to update user profile picture
app.use("/updateProfile", verifyToken , upload.single("image"), appRoutes.routes);

//The api route to handle activities
app.use("/activity", verifyToken, activityRoutes.routes);

//The api route to handle user accounts notification settings
app.use("/settings", verifyToken, notificationSettingsRoutes.routes);

//The api route to handel user notifications
app.use("/notifications", verifyToken, notificationRoutes.routes);

//The api route to handle user reports
app.use("/reports", reportsRoutes.routes);

app.listen(config.port, () => {
    console.log(`listening on port ${config.port}`);
})
