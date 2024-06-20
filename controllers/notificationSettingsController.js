const db = require("../src/db");


const getAllNotificationSettings = async (req, res) => {

    let body = req.claims;

    let userName = body['user_name'];

    let query = `SELECT user_id FROM users WHERE user_name = "${userName}"`;

    db.query(query, (error, result) => {

        if (error) {
            console.log('Error While Fetching User: ', error);
            res.status(404).send('Something went wrong at the moment');
        } else {

            if (result.length !== 0) {

                const obj = JSON.stringify(result);
                const user = JSON.parse(obj);

                let user_id = user[0]['user_id'];

                let query = `SELECT * FROM notifications_settings WHERE user_id = "${user_id}"`;

                db.query(query, (error, result) => {
                    if (error) {
                        console.log('Error While Fetching User Notification Settings');
                        res.status(404).send('Error While Fetching User Notification Settings');
                    } else {

                        if (result.length !== 0) {
                            const obj = JSON.stringify(result);
                            const settings = JSON.parse(obj);

                            res.status(200).send({settings: settings});

                        } else {
                            console.log('Error While Fetching User Notification Settings');
                            res.status(404).send('Error While Fetching User Notification Settings');
                        }

                    }

                });

            } else {
                console.log('No User Found', error);
                res.status(404).send('Something went wrong at the moment');
            }

        }

    });

    

}

const updateNotificationSettings = async (req, res) => {

    let body = req.body;
    let settings = body['settings'];
    let user_id = body['user_id'];
    let userName = req.claims['user_name'];

    let query = `UPDATE notifications_settings SET ? WHERE user_id = "${user_id}"`;

    let post = {

        all_notification : settings['isAllNotificationsOn'],
        deficiency_reminders: settings['isDeficiencyRemindersOn'],
        surplus_reminders: settings['isSurplusRemindersOn'],
        badges: settings['isBadgesOn'],
        notification_frequency: settings['notificationFrequency'],
        block_notification_check: settings['isBlockNotificaitonsIsOpen'],
        block_notification_period: settings['blockNotificationPeriod'],
        block_notification_frequency: settings['blockNotificationFrequency']
    }

    db.query(query, post, (error) => {
        if (error) {
            console.log('Error While Updating the Users Notification settings: ', error);
            let details = JSON.stringify({'action':`UPDATE NOTIFICATION SETTINGS`,'status':'FAIL', 'message':`Failed to update notification settings for username ${userName}.`, 'error':`Occured ERROR - ${err}`});
            let updateNotificationSettingsInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let updateNotificationSettingsInActivitylogQueryData = {user_id: userName, action:"UPDATE NOTIFICATION SETTINGS",  status:'FAIL' , details: details,}
            db.query(updateNotificationSettingsInActivitylogQuery, updateNotificationSettingsInActivitylogQueryData, (err) => console.log(err));
            res.status(500).send('Ops! Something went wrong');
        } else {
            console.log('Successfully updated the users notification settings');
            let details = JSON.stringify({'action':`UPDATE NOTIFICATION SETTINGS`,'status':'PASS', 'message':`Successfully updated notification settings for username ${userName}.`});
            let updateNotificationSettingsInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let updateNotificationSettingsInActivitylogQueryData = {user_id: userName, action:"UPDATE NOTIFICATION SETTINGS",  status:'PASS' , details: details,}
            db.query(updateNotificationSettingsInActivitylogQuery, updateNotificationSettingsInActivitylogQueryData, (err) => console.log(err));
            res.status(200).send('Success');
        }
    })

}



module.exports = {
    getAllNotificationSettings,
    updateNotificationSettings
}