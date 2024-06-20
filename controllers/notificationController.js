const e = require("express");
const db = require("../src/db");

const addNotification = async (req, res) => {

    let body = req.body;
    let query = `INSERT INTO notifications SET ?`;
    let post = {
        notification_id : body['notificationId'],
        user_id : body['userId'],
        notification_category_name : body['categoryName'],
        notification_message : body['message'],
        notification_creation_date : body['creationDate'],
    };

    db.query(query, post, (error) => {

        if (error) {

            console.log('Error while adding notificaiton');
            res.status(500).send('Error while adding notification');

        } else {

            console.log('Successfully added notification');
            res.status(200).send('Succsessfully added notification');

        }

    });

}

const getAllNotifications = async (req, res) => {

    let body = req.query;
    let userId = body['id'];

    let query = `SELECT * FROM notifications WHERE user_id = "${userId}"`;

    db.query(query, (error, result) => {

        if (error) {
            console.log('Error while fetching all the user\'s notifications');
            res.status(500).send('Ops! Something went wrong while fetching user\'s notifications');
        } else {

            if (result.length != 0) {

                const obj = JSON.stringify(result);
                const notifications = JSON.parse(obj);

                console.log('Successfully fetched all the user\'s notifications.');
                res.status(200).send({notifications: notifications});

            } else {
              console.log('Error while fetching all the user\'s notifications');
              res.status(200).send({notifications: []});
            }

        }

    });

}

const getYesterdayDoneNotifications = async (req, res) => {

    let body = req.query;
    let userId = body['id'];
    let startDate = body['startDate'];
    let endDate = body['endDate'];


    let query = `SELECT * FROM notifications WHERE user_id = "${userId}" AND notification_creation_date BETWEEN "${startDate}" AND "${endDate}"`;

    db.query(query, (error, result) => {

        if (error) {
            console.log('Error while fetching the user\'s yesterday notifications: ', error);
            res.status(500).send('Ops! Something went wrong while fetching user\'s yesterday notifications');
        } else {

            if (result.length != 0) {

                const obj = JSON.stringify(result);
                const notifications = JSON.parse(obj);

                console.log('Successfully fetched all the user\'s yesterday notifications.');
                res.status(200).send({notifications: notifications});

            } else {
              console.log('Yesterday notifications are empty.');
              res.status(200).send({notifications: []});
            }

        }

    });

}

const getCurrentWeekNotifications = async (req, res) => {

    let body = req.query;
    let userId = body['id'];
    let startDate = body['startDate'];
    let endDate = body['endDate'];

    let query = `SELECT * FROM notifications WHERE user_id = "${userId}" AND notification_creation_date BETWEEN "${startDate}" AND "${endDate}"`;

    db.query(query, (error, result) => {

        if (error) {
            console.log('Error while fetching the user\'s current week notifications: ', error);
            res.status(500).send('Ops! Something went wrong while fetching user\'s current week notifications');
        } else {

            if (result.length != 0) {

                const obj = JSON.stringify(result);
                const notifications = JSON.parse(obj);

                console.log('Successfully fetched all the user\'s current week notifications.');
                res.status(200).send({notifications: notifications});

            } else {
              console.log('Current Week Notifications are empty.');
              res.status(200).send({notifications: []});
            }

        }

    });

}

const cancelNotifications = async (req, res) => {

    let body = req.query;
    let userId = body['userId'];
    let userName = req.claims['user_name'];

    let query = `DELETE FROM notifications WHERE user_id = "${userId}"`; 

    db.query(query, (error) => {
        if (error) {
            console.log('Error while deleteing all the user\'s notifications');
            let details = JSON.stringify({'action':`CANCEL ALL NOTIFICATIONS`,'status':'FAIL', 'message':`Failed to cancel all the notifications for the username ${userName}.`, 'error':`Occured ERROR - ${error}`});
            let cancelActivitiesInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let cancelActivitiesInActivitylogQueryData = {user_id: userName, action:"CANCEL ALL NOTIFICATIONS",  status:'FAIL' , details: details,}
            db.query(cancelActivitiesInActivitylogQuery, cancelActivitiesInActivitylogQueryData, (err) => console.log(err))
            res.status(500).send('Ops! something went wrong while deleting user\'s notifications');
        } else {
            console.log('Successfully deleted all the user\'s notifications');
            let details = JSON.stringify({'action':`CANCEL ALL NOTIFICATIONS`,'status':'PASS', 'message':`Successfully canceled all the notifications for the username ${userName}.`});
            let cancelActivitiesInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let cancelActivitiesInActivitylogQueryData = {user_id: userName, action:"CANCEL ALL NOTIFICATIONS",  status:'PASS' , details: details,}
            db.query(cancelActivitiesInActivitylogQuery, cancelActivitiesInActivitylogQueryData, (err) => console.log(err))
            res.status(200).send('Successfully! deleted all the user\'s notifications');
        }
    });

}

const cancelSpecificNotifications = async (req, res) => {

    let body = req.query;
    let notificationId = body['notificationId'];
    let userName = req.claims['user_name'];

    let query = `DELETE FROM notifications WHERE notification_id = "${notificationId}"`; 

    db.query(query, (error) => {
        if (error) {
            console.log('Error while deleteing the specific notifications');
            let details = JSON.stringify({'action':`CANCEL ALL NOTIFICATIONS`,'status':'FAIL', 'message':`Failed to cancel the notification of Id ${notificationId} for the username ${userName}.`, 'error':`Occured ERROR - ${error}`});
            let cancelSpecificActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let cancelSpecificActivityInActivitylogQueryData = {user_id: userEmail, action:"CANCEL ALL NOTIFICATIONS",  status:'FAIL' , details: details,}
            db.query(cancelSpecificActivityInActivitylogQuery, cancelSpecificActivityInActivitylogQueryData, (err) => console.log(err))
            res.status(500).send('Ops! something went wrong while deleting the specific notifications');
        } else {
            console.log('Successfully deleted the specific notifications');
            let details = JSON.stringify({'action':`CANCEL ALL NOTIFICATIONS`,'status':'PASS', 'message':`Successfully canceled the notification of Id ${notificationId} for the username ${userName}.`, 'error':`Occured ERROR - ${error}`});
            let cancelSpecificActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let cancelSpecificActivityInActivitylogQueryData = {user_id: userEmail, action:"CANCEL ALL NOTIFICATIONS",  status:'PASS' , details: details,}
            db.query(cancelSpecificActivityInActivitylogQuery, cancelSpecificActivityInActivitylogQueryData, (err) => console.log(err))
            res.status(200).send('Successfully! deleted the specific notifications');
        }
    });

}

module.exports = {
    addNotification,
    getAllNotifications,
    getYesterdayDoneNotifications,
    getCurrentWeekNotifications,
    cancelNotifications,
    cancelSpecificNotifications
}