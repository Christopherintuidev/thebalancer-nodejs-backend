const db = require("../src/db");
const jwt = require("jsonwebtoken");

const {createTransporter} = require("../services/nodemailer");

const {
    makeRegistrationSuccessfullMessage, 
    makeUserEmailVerificationMessage, 
    makeUserForgotPassEmailVerificationMessage,
    makeSuccessfullChangePassMessage} = require("../services/nodemailer");

const createNewUser = async (req, res) => {

    let reqBody = req.body;
    const token = generateAuthToken(reqBody['userName']);
    const hashedPassword = await getHashValue(reqBody['userPassword']);
    const startingWeekDate = new Date(Date.now());
    const temp = new Date(Date.now());
    temp.setDate(temp.getDate() + 6);

    const currentYear = new Date(Date.now()).getFullYear();
    const startingYearDate = new Date(currentYear, 0, 31, 0, 0);
    const endingYearDate = new Date(currentYear, 11, 31, 23, 59);

    let query = "INSERT INTO users SET ?";
    let insertNotificationSettingsQuery = 'INSERT INTO notifications_settings SET ?';
    let actualPercentagesQuery = "INSERT INTO percentages_table SET ?";

    let post = {user_id: reqBody['userId'],user_name: reqBody['userName'],user_email: reqBody['userEmail'],user_password: hashedPassword,user_firstname: null,user_lastname: null,user_phonenumber: null,user_birthday: null,accountcreationdate: null,user_image:reqBody['userImage'],user_desiredpercentages: reqBody['userDesiredPercentages'],user_sign_in_method: reqBody['userSignInMethod'],jwt_token: token};
    let notificationSettings = {notification_settings_id: reqBody['notificationSettingsId'],user_id: reqBody['userId'],all_notification: true,deficiency_reminders: false,surplus_reminders: false,badges: false,notification_frequency: 0,block_notification_check: false,block_notification_period: 1,block_notification_frequency: 0};
    let defaultActualPercentages = {
        user_id: reqBody['userId'],
        starting_week_date: startingWeekDate,
        ending_week_date: temp,
        starting_year_date: startingYearDate,
        ending_year_date: endingYearDate,
        counts: reqBody['userDesiredPercentages'],
        actual_percentages: reqBody['userDesiredPercentages'],
    };

    db.query(query, post, (err) => {
        if(err){
            console.log('Error While Creating User in DB: ',err);
            //CREATE NEW USER - FAIL
            let details = JSON.stringify({'action':'CREATE NEW USER','status':'FAIL', 'message':`User with ID ${reqBody['userId']} is failed to create.`, 'error':`Occured ERROR - ${err}` });
            let addUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let addUserActivitylogQueryData = {user_id: null, action:"CREATE NEW USER", status:'FAIL' , details:details,}
            db.query(addUserActivitylogQuery, addUserActivitylogQueryData, (err) => console.log(err));

            res.status(500).send('Ops! something went wrong while creating user.');
        }
        else {

            //CREATE NEW USER - PASS
            let details = JSON.stringify({'action':'CREATE NEW USER','status':'PASS', 'message':`User with ID ${reqBody['userId']} is successfully created.`, });
            let addUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let addUserActivitylogQueryData = {user_id: null, action:"CREATE NEW USER", status:'PASS' , details:details,}
            db.query(addUserActivitylogQuery, addUserActivitylogQueryData, (err) => console.log(err));

            db.query(insertNotificationSettingsQuery, notificationSettings, (err) => {
                if(err){
                    console.log('Error While Creating User Notification Settings in DB: ',err);

                    //USER NOTIFICATION SETTINGS - FAIL
                    let details = JSON.stringify({'action':`INSERT NOTIFICATION SETTINGS`,'status':'FAIL', 'message':`Failed to add Notificaiton settings for User with ID ${reqBody['userId']}.`, 'error':`Occured ERROR - ${err}`});
                    let addUserNotificationSettingsActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let addUserNotificationSettingsActivitylogQueryData = {user_id: null, action:"INSERT NOTIFICATION SETTINGS",  status:'FAIL' , details:details,}
                    db.query(addUserNotificationSettingsActivitylogQuery, addUserNotificationSettingsActivitylogQueryData, (err) => console.log(err));

                    res.status(500).send('Ops! something went wrong while creating user notification settings.');
                }
                else {

                    //USER NOTIFICATION SETTINGS - PASS
                    let details = JSON.stringify({'action':`INSERT NOTIFICATION SETTINGS`,'status':'PASS', 'message':`Successfully added Notificaiton settings for User with ID ${reqBody['userId']}.`});
                    let addUserNotificationSettingsActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let addUserNotificationSettingsActivitylogQueryData = {user_id: null, action:"INSERT NOTIFICATION SETTINGS", status:'PASS' , details: details,}
                    db.query(addUserNotificationSettingsActivitylogQuery, addUserNotificationSettingsActivitylogQueryData, (err) => console.log(err));

                    db.query(actualPercentagesQuery, defaultActualPercentages, (error) => {

                        if (error) {
                            console.log("Failed to insert actual percentages");

                            //USER ACTUAL PERCENTAGES - FAIL
                            let details = JSON.stringify({'action':`INSERT ACTUAL PERCENTAGES`,'status':'FAIL', 'message':`Failed to add actual percentages for User with ID ${reqBody['userId']}.`, 'error':`Occured ERROR - ${error}`});
                            let addUserActualPercentagesActivitylogQuery = 'INSERT INTO activity_log SET ?'
                            let addUserActualPercentagesActivitylogQueryData = {user_id: null, action:"INSERT ACTUAL PERCENTAGES",  status:'FAIL' , details: details,}
                            db.query(addUserActualPercentagesActivitylogQuery, addUserActualPercentagesActivitylogQueryData, (err) => console.log(err));

                            res.status(500).send('Failed to create user account');
                        } else {

                            console.log('Successfully created User account');

                            //USER ACTUAL PERCENTAGES - PASS
                            let details = JSON.stringify({'action':`INSERT ACTUAL PERCENTAGES`,'status':'FAIL', 'message':`Successfully added actual percentages for User with ID ${reqBody['userId']}.`});
                            let addUserActualPercentagesActivitylogQuery = 'INSERT INTO activity_log SET ?'
                            let addUserActualPercentagesActivitylogQueryData = {user_id: null, action:"INSERT ACTUAL PERCENTAGES",  status:'PASS' , details: details,}
                            db.query(addUserActualPercentagesActivitylogQuery, addUserActualPercentagesActivitylogQueryData, (err) => console.log(err));

                            res.status(200).send({response: true, token : token});
                        }

                    });

                }
            });

        }
    });

    if(reqBody['userEmail'] !== null) {
        const accountCreationMessage = makeRegistrationSuccessfullMessage(reqBody['userEmail'], reqBody['userName']);
        const transporter = createTransporter();
    
        transporter.sendMail(accountCreationMessage, (err) => {
            if (err) {
                //USER ACCOUNT CREATION EMAIL - FAIL
                let details = JSON.stringify({'action':`SEND USER ACCOUNT CREATED EMAIL`,'status':'FAIL', 'message':`Failed to send account creation email for User with ID ${reqBody['userId']}.`, 'error':`Occured ERROR - ${err}`});
                let addUserAccEmailActivitylogQuery = 'INSERT INTO activity_log SET ?'
                let addUserAccEmailActivitylogQueryData = {user_id: null, action:"SEND USER ACCOUNT CREATED EMAIL",  status:'FAIL' , details: details,}
                db.query(addUserAccEmailActivitylogQuery, addUserAccEmailActivitylogQueryData, (err) => console.log(err));
                console.log('Failed to send email',err);
            } else {
                //USER ACCOUNT CREATION EMAIL - PASS
                let details = JSON.stringify({'action':`SEND USER ACCOUNT CREATED EMAIL`,'status':'PASS', 'message':`Successfully sended account creation email for User with ID ${reqBody['userId']}.`});
                let addUserAccEmailActivitylogQuery = 'INSERT INTO activity_log SET ?'
                let addUserAccEmailActivitylogQueryData = {user_id: null, action:"SEND USER ACCOUNT CREATED EMAIL",  status:'PASS' , details: details,}
                db.query(addUserAccEmailActivitylogQuery, addUserAccEmailActivitylogQueryData, (err) => console.log(err));
                console.log('Email sent');
            }
        });
    }

    

}

const checkIfUserNameIsAvailable =  async (req, res) => {

    let body = req.body;
    let userName = body['userName'];
    console.log(body['userName']);
    
    if(!isNaN(userName)){
        res.status(200).send('false');
    } else {
        let query = `SELECT * FROM users WHERE user_name = "${body['userName']}"`;
    
        db.query(query, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                const obj = JSON.stringify(result);
                const json = JSON.parse(obj);
                if (json.length !== 0) {
                    res.status(200).send('false');
    
                } else {
                    res.status(200).send('true');
                }
            }
        });    
    }

}

const loginUser = async (req, res) => {

    let body = req.body;

    let input = body['input'];
    let password = body['password'];
    let isEmail = body['isEmail'];

    if (isEmail) {
        
        let query = `SELECT * FROM users WHERE user_email = "${input}"`;

        db.query(query, async (err, result) => {

            if (err) {
                console.log('Error in fetching the user: ', err);
                let details = JSON.stringify({'action':`LOGGING USER BY EMAIL & PASSWORD`,'status':'FAIL', 'message':`Failed to Login User with email ${input}.`, 'error':`Occured ERROR - ${err}`});
                let loginUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                let loginUserActivitylogQueryData = {user_id: input, action:"LOGGING USER BY EMAIL & PASSWORD",  status:'FAIL' , details: details,}
                db.query(loginUserActivitylogQuery, loginUserActivitylogQueryData, (err) => console.log(err));
                
                res.status(404).send('The email and password is incorrect or the user might not exists.');
            } else {
                
                if (result.length !== 0) {
                    
                    const obj = JSON.stringify(result);
                    const json = JSON.parse(obj);
    
                    let hashedPassword = json[0]['user_password'];
    
                    let isPassCorrect = await compareHashValues(password, hashedPassword);
    
                    if (isPassCorrect) {
                        if (json.length !== 0) {
                            let newToken = generateAuthToken(json[0]['user_name']);
                            console.log('Login New Token: ', newToken);

                            let details = JSON.stringify({'action':`LOGGING USER BY EMAIL & PASSWORD`, 'status':'PASS', 'message':`Successfully Login User with email ${input}.`});
                            let loginUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                            let loginUserActivitylogQueryData = {user_id: input, action:"LOGGING USER BY EMAIL & PASSWORD",  status:'PASS' , details: details,}
                            db.query(loginUserActivitylogQuery, loginUserActivitylogQueryData, (err) => console.log(err));

                            res.status(200).send({token: newToken});
        
                        } 
                    } else {
                        let details = JSON.stringify({'action':`LOGGING USER BY EMAIL & PASSWORD`,'status':'FAIL', 'message':`Failed to Login User with email ${input}.`, 'error':`Occured ERROR - Incorrect password entered.`});
                        let loginUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                        let loginUserActivitylogQueryData = {user_id: input, action:"LOGGING USER BY EMAIL & PASSWORD",  status:'FAIL' , details: details,}
                        db.query(loginUserActivitylogQuery, loginUserActivitylogQueryData, (err) => console.log(err));
                        res.status(404).send('Incorrect password entered.');
                    }

                } else {
                    let details = JSON.stringify({'action':`LOGGING USER BY EMAIL & PASSWORD`,'status':'FAIL', 'message':`Failed to Login User with email ${input}.`, 'error':`Occured ERROR - The email and password is incorrect or the user might not exists.`});
                    let loginUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let loginUserActivitylogQueryData = {user_id: input, action:"LOGGING USER BY EMAIL & PASSWORD",  status:'FAIL' , details: details,}
                    db.query(loginUserActivitylogQuery, loginUserActivitylogQueryData, (err) => console.log(err));
                    res.status(404).send('The email and password is incorrect or the user might not exists.');
                }


            }

        });

    } else {

        let query = `SELECT * FROM users WHERE user_name = "${input}"`;
    
            db.query(query, async (err, result) => {
    
                if (err) {
                    console.log('Error in fetching the user: ', err);
                    let details = JSON.stringify({'action':`LOGGING USER BY USERNAME & PASSWORD`,'status':'FAIL', 'message':`Failed to Login User with username ${input}.`, 'error':`Occured ERROR - ${err}`});
                    let loginUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let loginUserActivitylogQueryData = {user_id: input, action:"LOGGING USER BY USERNAME & PASSWORD",  status:'FAIL' , details: details,}
                    db.query(loginUserActivitylogQuery, loginUserActivitylogQueryData, (err) => console.log(err));
                    res.status(404).send('The user name and password is incorrect or the user might not exists.');
                } else {
                    
                    if (result.length !== 0) {
                        
                        const obj = JSON.stringify(result);
                        const json = JSON.parse(obj);
        
                        console.log('The Json Object: ', json);
        
                        let hashedPassword = json[0]['user_password'];
        
                        let isPassCorrect = await compareHashValues(password, hashedPassword);
        
                        if (isPassCorrect) {
                            if (json.length !== 0) {
                                let newToken = generateAuthToken(json[0]['user_name']);
                                console.log('Login New Token: ', newToken);
                                let details = JSON.stringify({'action':`LOGGING USER BY USERNAME & PASSWORD`, 'status':'PASS', 'message':`Successfully Login User with username ${input}.`});
                                let loginUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                                let loginUserActivitylogQueryData = {user_id: input, action:"LOGGING USER BY EMAIL & PASSWORD",  status:'PASS' , details: details,}
                                db.query(loginUserActivitylogQuery, loginUserActivitylogQueryData, (err) => console.log(err));
                                
                                res.status(200).send({token: newToken});
            
                            } 
                        } else {
                            let details = JSON.stringify({'action':`LOGGING USER BY USERNAME & PASSWORD`,'status':'FAIL', 'message':`Failed to Login User with username ${input}.`, 'error':`Occured ERROR - Incorrect password entered.`});
                            let loginUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                            let loginUserActivitylogQueryData = {user_id: input, action:"LOGGING USER BY USERNAME & PASSWORD",  status:'FAIL' , details: details,}
                            db.query(loginUserActivitylogQuery, loginUserActivitylogQueryData, (err) => console.log(err));
                            res.status(404).send('Incorrect password entered.');
                        }
    
                    } else {
                        let details = JSON.stringify({'action':`LOGGING USER BY USERNAME & PASSWORD`,'status':'FAIL', 'message':`Failed to Login User with username ${input}.`, 'error':`Occured ERROR - The user name and password is incorrect or the user might not exists.`});
                        let loginUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                        let loginUserActivitylogQueryData = {user_id: input, action:"LOGGING USER BY USERNAME & PASSWORD",  status:'FAIL' , details: details,}
                        db.query(loginUserActivitylogQuery, loginUserActivitylogQueryData, (err) => console.log(err));
                        res.status(404).send('The user name and password is incorrect or the user might not exists.');
                    }
    
    
                }
    
            });
    }


}

const deleteAccount = async (req, res) => {

    let bodyData = req.body;
    let loggedInStatus = bodyData['logged_in_status'];

    if(loggedInStatus === 0) {

        let user_id = bodyData['user_id'];
        let userName = bodyData['user_name'];
        let userPassword = bodyData['user_password'];
    
        //All of the queries which will be run on DB sequentially one after one
        let fetchUserDetailsquery = `SELECT * FROM users WHERE user_name = "${userName}"`;
        let deleteFromActivitiesTableQuery = `DELETE FROM activities WHERE user_id = "${user_id}"`;
        let deleteFromNotificationsTableQuery = `DELETE FROM notifications WHERE user_id = "${user_id}"`;
        let deleteFromNotificationSettingsTableQuery = `DELETE FROM notifications_settings WHERE user_id = "${user_id}"`;
        let deleteFromPercentagesTableQuery = `DELETE FROM percentages_table WHERE user_id = "${user_id}"`;
        let deleteFromUsersTable = `DELETE FROM users WHERE user_id = "${user_id}"`;
    
        //Before running the queries on the DB we will check if the user is authentic or not
    
        db.query(fetchUserDetailsquery, async (err, result) => {
    
                if(err) {
                    console.log(err);
                } else {
                    if(result.length !== 0) {
    
                        const obj = JSON.stringify(result);
                        const json = JSON.parse(obj);
            
                        console.log('The Json Object: ', json);
            
                        let hashedPassword = json[0]['user_password'];
            
                        let isPassCorrect = await compareHashValues(userPassword, hashedPassword);
    
                        if (isPassCorrect) {
    
                            db.query(deleteFromActivitiesTableQuery, (err) => {
                                if(err) {
                                    console.log(err);
                                    let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - Cannot Delete From Activities`});
                                    let activitylogQuery = 'INSERT INTO activity_log SET ?'
                                    let activitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                                    db.query(activitylogQuery, activitylogQueryData, (err) => console.log(err));
                                    res.status(400).send('Failed to delete user account.');
    
                                } else {
                                    console.log('User Activities Are Deleted Successfully');
    
                                    db.query(deleteFromNotificationsTableQuery, (err) => {
                                        if(err) {
                                            console.log(err);
                                            let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - Cannot Delete From Notifications`});
                                            let activitylogQuery = 'INSERT INTO activity_log SET ?'
                                            let activitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                                            db.query(activitylogQuery, activitylogQueryData, (err) => console.log(err));
                                            res.status(400).send('Failed to delete user account.');
    
                                        } else {
                                            console.log('User Notifications Are Deleted Successfully');
    
                                            db.query(deleteFromNotificationSettingsTableQuery, (err) => {
    
                                                if(err) {
                                                    console.log(err);
    
                                                    let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - Cannot Delete From Notification Settings`});
                                                    let activitylogQuery = 'INSERT INTO activity_log SET ?'
                                                    let activitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                                                    db.query(activitylogQuery, activitylogQueryData, (err) => console.log(err));
                                                    res.status(400).send('Failed to delete user account.');
    
                                                } else {
    
                                                    console.log('User Notification Settings Are Deleted Successfully');
    
                                                    db.query(deleteFromPercentagesTableQuery, (err) => {
                                                        if(err) {
                                                            console.log(err);
    
                                                            let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - Cannot Delete From Percentages Data Tale`});
                                                            let activitylogQuery = 'INSERT INTO activity_log SET ?'
                                                            let activitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                                                            db.query(activitylogQuery, activitylogQueryData, (err) => console.log(err));
                                                            res.status(400).send('Failed to delete user account.');
    
                                                        } else {
    
                                                            console.log('User Percentages Data Has Been Deleted Successfully');
    
                                                            db.query(deleteFromUsersTable, (err) => {
                                                                if(err) {
                                                                    console.log(err);
    
                                                                    let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - Cannot Delete From Users`});
                                                                    let activitylogQuery = 'INSERT INTO activity_log SET ?'
                                                                    let activitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                                                                    db.query(activitylogQuery, activitylogQueryData, (err) => console.log(err));
                                                                    res.status(400).send('Failed to delete user account.');
    
                                                                } else {
    
                                                                    console.log('User Account From Users Has Been Deleted Successfully');
    
                                                                    let details = JSON.stringify({'action':`USER ACCOUNT DELETED SUCCESSFULLY`,'status':'PASS', 'message':`Successfully deleted user account for the user name ${userName}.`});
                                                                    let onSuccessUserAccDelActivitylogQuery = 'INSERT INTO activity_log SET ?'
                                                                    let onSuccessUserAccDelActivitylogQueryData = {user_id: user_id, action:"USER ACCOUNT DELETED SUCCESSFULLY",  status:'PASS' , details: details,}
                                                                    db.query(onSuccessUserAccDelActivitylogQuery, onSuccessUserAccDelActivitylogQueryData, (err) => {
                                                                        console.log(err);
                                                                    });
    
                                                                    res.status(200).send({
                                                                        "status" : true,
                                                                        "message" : "User Account is deleted successfully."
                                                                    })
    
                                                                }
    
                                                            });
    
                                                        }
                                                    });
    
                                                }
    
                                            });
                                        }
                                    })
                                }
                            });
    
                        } else {
                            let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - The user name and password is incorrect.`});
                            let verifyUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                            let verifyUserActivitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                            db.query(verifyUserActivitylogQuery, verifyUserActivitylogQueryData, (err) => console.log(err));
                            res.status(400).send('Failed to delete user account.');
                        }
    
                    } else {
                        let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - The user name and password is incorrect.`});
                        let verifyUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                        let verifyUserActivitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                        db.query(verifyUserActivitylogQuery, verifyUserActivitylogQueryData, (err) => console.log(err));
                        res.status(400).send('Failed to delete user account.');
                    }
                }
    
        });

    } else {

        let user_id = bodyData['user_id'];
        
        let fetchUserDetailsquery = `SELECT * FROM users WHERE user_id = "${user_id}"`;
        let deleteFromActivitiesTableQuery = `DELETE FROM activities WHERE user_id = "${user_id}"`;
        let deleteFromNotificationsTableQuery = `DELETE FROM notifications WHERE user_id = "${user_id}"`;
        let deleteFromNotificationSettingsTableQuery = `DELETE FROM notifications_settings WHERE user_id = "${user_id}"`;
        let deleteFromPercentagesTableQuery = `DELETE FROM percentages_table WHERE user_id = "${user_id}"`;
        let deleteFromUsersTable = `DELETE FROM users WHERE user_id = "${user_id}"`;

        db.query(fetchUserDetailsquery, async (err, result) => {
    
            if(err) {
                console.log(err);
            } else {
                if(result.length !== 0) {

                    const obj = JSON.stringify(result);
                    const json = JSON.parse(obj);
        
                    console.log('The Json Object: ', json);
        
                    let userName = json[0]['user_name'];

                        db.query(deleteFromActivitiesTableQuery, (err) => {
                            if(err) {
                                console.log(err);
                                let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - Cannot Delete From Activities`});
                                let activitylogQuery = 'INSERT INTO activity_log SET ?'
                                let activitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                                db.query(activitylogQuery, activitylogQueryData, (err) => console.log(err));
                                res.status(400).send('Failed to delete user account.');

                            } else {
                                console.log('User Activities Are Deleted Successfully');

                                db.query(deleteFromNotificationsTableQuery, (err) => {
                                    if(err) {
                                        console.log(err);
                                        let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - Cannot Delete From Notifications`});
                                        let activitylogQuery = 'INSERT INTO activity_log SET ?'
                                        let activitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                                        db.query(activitylogQuery, activitylogQueryData, (err) => console.log(err));
                                        res.status(400).send('Failed to delete user account.');

                                    } else {
                                        console.log('User Notifications Are Deleted Successfully');

                                        db.query(deleteFromNotificationSettingsTableQuery, (err) => {

                                            if(err) {
                                                console.log(err);

                                                let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - Cannot Delete From Notification Settings`});
                                                let activitylogQuery = 'INSERT INTO activity_log SET ?'
                                                let activitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                                                db.query(activitylogQuery, activitylogQueryData, (err) => console.log(err));
                                                res.status(400).send('Failed to delete user account.');

                                            } else {

                                                console.log('User Notification Settings Are Deleted Successfully');

                                                db.query(deleteFromPercentagesTableQuery, (err) => {
                                                    if(err) {
                                                        console.log(err);

                                                        let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - Cannot Delete From Percentages Data Tale`});
                                                        let activitylogQuery = 'INSERT INTO activity_log SET ?'
                                                        let activitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                                                        db.query(activitylogQuery, activitylogQueryData, (err) => console.log(err));
                                                        res.status(400).send('Failed to delete user account.');

                                                    } else {

                                                        console.log('User Percentages Data Has Been Deleted Successfully');

                                                        db.query(deleteFromUsersTable, (err) => {
                                                            if(err) {
                                                                console.log(err);

                                                                let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - Cannot Delete From Users`});
                                                                let activitylogQuery = 'INSERT INTO activity_log SET ?'
                                                                let activitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                                                                db.query(activitylogQuery, activitylogQueryData, (err) => console.log(err));
                                                                res.status(400).send('Failed to delete user account.');

                                                            } else {

                                                                console.log('User Account From Users Has Been Deleted Successfully');

                                                                let details = JSON.stringify({'action':`USER ACCOUNT DELETED SUCCESSFULLY`,'status':'PASS', 'message':`Successfully deleted user account for the user name ${userName}.`});
                                                                let onSuccessUserAccDelActivitylogQuery = 'INSERT INTO activity_log SET ?'
                                                                let onSuccessUserAccDelActivitylogQueryData = {user_id: user_id, action:"USER ACCOUNT DELETED SUCCESSFULLY",  status:'PASS' , details: details,}
                                                                db.query(onSuccessUserAccDelActivitylogQuery, onSuccessUserAccDelActivitylogQueryData, (err) => {
                                                                    console.log(err);
                                                                });

                                                                res.status(200).send({
                                                                    "status" : true,
                                                                    "message" : "User Account is deleted successfully."
                                                                })

                                                            }

                                                        });

                                                    }
                                                });

                                            }

                                        });
                                    }
                                })
                            }
                        });


                } else {
                    let details = JSON.stringify({'action':`FAILED TO DELETE USER ACCOUNT`,'status':'FAIL', 'message':`Failed to Delete user account for the user name ${userName}.`, 'error':`Occured ERROR - The user name and password is incorrect.`});
                    let verifyUserActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let verifyUserActivitylogQueryData = {user_id: user_id, action:"FAILED TO DELETE USER ACCOUNT",  status:'FAIL' , details: details,}
                    db.query(verifyUserActivitylogQuery, verifyUserActivitylogQueryData, (err) => console.log(err));
                    res.status(400).send('Failed to delete user account.');
                }
            }

    });


    }


        

}

const logoutUser = async (req, res) => {

    let claimsData = req.claims;
    let userName = claimsData['user_name'];

    let details = JSON.stringify({'action':`LOGOUT USER`,'status':'PASS', 'message':`Successfully logout the User with username ${userName}.`});
    let updateUserDetailesActivitylogQuery = 'INSERT INTO activity_log SET ?'
    let updateUserDetailesActivitylogQueryData = {user_id: userName, action:"LOGOUT USER",  status:'PASS' , details: details,}
    db.query(updateUserDetailesActivitylogQuery, updateUserDetailesActivitylogQueryData, (err) => console.log(err));

    res.status(200).send({
        'status' : true,
        'message' : 'User is logout successfully'
    });
}

const updateUserDesiredPercentages = async (req, res) => {

    let body = req.body;
    console.log(body);
    let userDesiredPercentages = body['userDesiredPercentages'];
    let userName = req.claims['user_name'];

    let query = `UPDATE users SET ? WHERE user_name = "${userName}"`;
    let patch = {user_desiredpercentages : userDesiredPercentages};
        
    db.query(query, patch, (error) => {
        if(error) {
            console.log('Failed to update desired percentages', error);
            let details = JSON.stringify({'action':`UPDATE USER DESIRED PERCENTAGES`,'status':'FAIL', 'message':`Failed to update User desired percentages with username ${userName}.`, 'error':`Occured ERROR - ${error}`});
            let updateUserDesiredPercentagesActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let updateUserDesiredPercentagesActivitylogQueryData = {user_id: userName, action:"UPDATE USER DESIRED PERCENTAGES",  status:'FAIL' , details: details,}
            db.query(updateUserDesiredPercentagesActivitylogQuery, updateUserDesiredPercentagesActivitylogQueryData, (err) => console.log(err));
            res.status(404).send('Something went wrong. Desired percentages are not updated.');
        } else {
            console.log('Updated Successfully.');
            let details = JSON.stringify({'action':`UPDATE USER DESIRED PERCENTAGES`,'status':'PASS', 'message':`Successfully updated User desired percentages with username ${userName}.`});
            let updateUserDesiredPercentagesActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let updateUserDesiredPercentagesActivitylogQueryData = {user_id: userName, action:"UPDATE USER DESIRED PERCENTAGES",  status:'PASS' , details: details,}
            db.query(updateUserDesiredPercentagesActivitylogQuery, updateUserDesiredPercentagesActivitylogQueryData, (err) => console.log(err));
            res.status(200).send('Updated Successfully.');
        }
    });

}

const generateAuthToken = (userName) => {

    try {

        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = {
            time: Date(),
            user_name: userName,
        };

        const token = jwt.sign(data, jwtSecretKey);

        return token
        
    } catch (error) {
        console.log("The error is: ", error);
    }

}

const changeUserPassword = async (req, res) => {

    let body = req.body;
    let isFromForgotPass = body['isFromForgotPass'];
    let userEmail = body['userEmail'];
    let userOldPass = '';
    let userNewPass = '';

    if (isFromForgotPass) {
        userNewPass = body['userNewPass'];

        let query = `UPDATE users SET ? WHERE user_email = "${userEmail}"`
        let hashedPassword = await getHashValue(userNewPass);
        let post = {
            'user_password': hashedPassword
        };

        db.query(query, post, (err) => {

            if (err) {
                console.log('Failed to update the new password', err);
                let details = JSON.stringify({'action':`UPDATE USER ACCOUNT PASSWORD`,'status':'FAIL', 'message':`Failed to update User account password with email ${userEmail}.`, 'error':`Occured ERROR - ${err}`});
                let updateUserAccPasswordActivitylogQuery = 'INSERT INTO activity_log SET ?'
                let updateUserAccPasswordActivitylogQueryData = {user_id: userEmail, action:"UPDATE USER ACCOUNT PASSWORD",  status:'FAIL' , details: details,}
                db.query(updateUserAccPasswordActivitylogQuery, updateUserAccPasswordActivitylogQueryData, (err) => console.log(err));
                res.status(500).send('Failed to update new password');
            } else {

                let details = JSON.stringify({'action':`UPDATE USER ACCOUNT PASSWORD`,'status':'PASS', 'message':`Successfully updated User account password with email ${userEmail}.`});
                let updateUserAccPasswordActivitylogQuery = 'INSERT INTO activity_log SET ?'
                let updateUserAccPasswordActivitylogQueryData = {user_id: userEmail, action:"UPDATE USER ACCOUNT PASSWORD",  status:'PASS' , details: details,}
                db.query(updateUserAccPasswordActivitylogQuery, updateUserAccPasswordActivitylogQueryData, (err) => console.log(err));
                
                res.status(200).send('Successfully updated the new password');
                // Email Implementation
                const passwordChangeMessage = makeSuccessfullChangePassMessage(userEmail);
                const transporter = createTransporter();

                transporter.sendMail(passwordChangeMessage, (err) => {
                    if (err) {
                        let details = JSON.stringify({'action':`SEND USER ACCOUNT PASSWORD UPDATED EMAIL`,'status':'FAIL', 'message':`Failed to send User account password updated email to ${userEmail}.`, 'error': `Occured Error - ${err}`});
                        let updateUserAccPasswordEmailActivitylogQuery = 'INSERT INTO activity_log SET ?'
                        let updateUserAccPasswordEmailActivitylogQueryData = {user_id: userName, action:"SEND USER ACCOUNT PASSWORD UPDATED EMAIL",  status:'FAIL' , details: details,}
                        db.query(updateUserAccPasswordEmailActivitylogQuery, updateUserAccPasswordEmailActivitylogQueryData, (err) => console.log(err));
                        console.log('Failed to send email',err);
                    } else {
                        let details = JSON.stringify({'action':`SEND USER ACCOUNT PASSWORD UPDATED EMAIL`,'status':'PASS', 'message':`Successfully sended User account password updated email to ${userEmail}.`});
                        let updateUserAccPasswordEmailActivitylogQuery = 'INSERT INTO activity_log SET ?'
                        let updateUserAccPasswordEmailActivitylogQueryData = {user_id: userName, action:"SEND USER ACCOUNT PASSWORD UPDATED EMAIL",  status:'PASS' , details: details,}
                        db.query(updateUserAccPasswordEmailActivitylogQuery, updateUserAccPasswordEmailActivitylogQueryData, (err) => console.log(err));
                        console.log('Email sent');
                    }
                });
            }

        });

    } else {

        userOldPass = body['userOldPass'];
        userNewPass = await getHashValue(body['userNewPass']);
        let token = body['pass'];

        let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        let userName = decoded['user_name'];

        let searchQuery = `SELECT user_name, user_password FROM users WHERE user_name = "${userName}"`;

        db.query(searchQuery, async (err, result) => {
            if(err) {
                console.log('User not found');
                let details = JSON.stringify({'action':`UPDATE USER ACCOUNT PASSWORD`,'status':'FAIL', 'message':`Failed to update User account password with username ${userName}.`, 'error':`Occured ERROR - ${err}`});
                let updateUserAccPasswordActivitylogQuery = 'INSERT INTO activity_log SET ?'
                let updateUserAccPasswordActivitylogQueryData = {user_id: userEmail, action:"UPDATE USER ACCOUNT PASSWORD",  status:'FAIL' , details: details,}
                db.query(updateUserAccPasswordActivitylogQuery, updateUserAccPasswordActivitylogQueryData, (err) => console.log(err));
                res.status(500).send('Something went wrong at the moment.');
            } else {

                if (result.length !== 0) {

                    const obj = JSON.stringify(result);
                    const json = JSON.parse(obj);
    
                    let user_hashedPass = json[0]['user_password'];
                        
                    let isPassCorrect = await compareHashValues(userOldPass, user_hashedPass);
    
                    console.log(isPassCorrect);
    
                    if (isPassCorrect) {
                        let changePassQuery = `UPDATE users SET ? WHERE user_name = "${userName}"`;
                        let post = {user_password: userNewPass};

                        db.query(changePassQuery, post, (err) => {
                            if (err) {
                                console.log('Failed to update the new password 1', err);
                                let details = JSON.stringify({'action':`UPDATE USER ACCOUNT PASSWORD`,'status':'FAIL', 'message':`Failed to update User account password with username ${userName}.`, 'error':`Occured ERROR - ${err}`});
                                let updateUserAccPasswordActivitylogQuery = 'INSERT INTO activity_log SET ?'
                                let updateUserAccPasswordActivitylogQueryData = {user_id: userEmail, action:"UPDATE USER ACCOUNT PASSWORD",  status:'FAIL' , details: details,}
                                db.query(updateUserAccPasswordActivitylogQuery, updateUserAccPasswordActivitylogQueryData, (err) => console.log(err));
                                res.status(500).send('Failed to update the new password');
                            } else {

                                let details = JSON.stringify({'action':`UPDATE USER ACCOUNT PASSWORD`,'status':'PASS', 'message':`Successfully updated User account password with username ${userName}.`});
                                let updateUserAccPasswordActivitylogQuery = 'INSERT INTO activity_log SET ?'
                                let updateUserAccPasswordActivitylogQueryData = {user_id: userEmail, action:"UPDATE USER ACCOUNT PASSWORD",  status:'PASS' , details: details,}
                                db.query(updateUserAccPasswordActivitylogQuery, updateUserAccPasswordActivitylogQueryData, (err) => console.log(err));

                                res.status(200).send('Successfully updated the new password');
    
                                 // Email Implementation
                                const passwordChangeMessage = makeSuccessfullChangePassMessage(userEmail);
                                const transporter = createTransporter();
                                
                                transporter.sendMail(passwordChangeMessage, (err) => {
                                    if (err) {
                                        console.log('Failed to send email',err);
                                        let details = JSON.stringify({'action':`SEND USER ACCOUNT PASSWORD UPDATED EMAIL`,'status':'FAIL', 'message':`Failed to send User account password updated email to ${userEmail}.`, 'error':`Occured Error - ${err}`});
                                        let updateUserAccPasswordEmailActivitylogQuery = 'INSERT INTO activity_log SET ?'
                                        let updateUserAccPasswordEmailActivitylogQueryData = {user_id: userName, action:"SEND USER ACCOUNT PASSWORD UPDATED EMAIL",  status:'FAIL' , details: details,}
                                        db.query(updateUserAccPasswordEmailActivitylogQuery, updateUserAccPasswordEmailActivitylogQueryData, (err) => console.log(err));
                                    } else {
                                        console.log('Email sent');
                                        let details = JSON.stringify({'action':`SEND USER ACCOUNT PASSWORD UPDATED EMAIL`,'status':'PASS', 'message':`Successfully sended User account password updated email to ${userEmail}.`});
                                        let updateUserAccPasswordEmailActivitylogQuery = 'INSERT INTO activity_log SET ?'
                                        let updateUserAccPasswordEmailActivitylogQueryData = {user_id: userName, action:"SEND USER ACCOUNT PASSWORD UPDATED EMAIL",  status:'PASS' , details: details,}
                                        db.query(updateUserAccPasswordEmailActivitylogQuery, updateUserAccPasswordEmailActivitylogQueryData, (err) => console.log(err));
                                    }
                                });
                            }
                        });

                    } else {
                        console.log('Incorrect Old Password');
                        let details = JSON.stringify({'action':`UPDATE USER ACCOUNT PASSWORD`,'status':'FAIL', 'message':`Failed to update User account password with username ${userName}.`, 'error':`Occured ERROR - Incorrect Old Password`});
                        let updateUserAccPasswordActivitylogQuery = 'INSERT INTO activity_log SET ?'
                        let updateUserAccPasswordActivitylogQueryData = {user_id: userEmail, action:"UPDATE USER ACCOUNT PASSWORD",  status:'FAIL' , details: details,}
                        db.query(updateUserAccPasswordActivitylogQuery, updateUserAccPasswordActivitylogQueryData, (err) => console.log(err));
                        res.status(500).send('Incorrect Old Password');
                    }

                } else {
                    console.log('User not found');
                    let details = JSON.stringify({'action':`UPDATE USER ACCOUNT PASSWORD`,'status':'FAIL', 'message':`Failed to update User account password with username ${userName}.`, 'error':`Occured ERROR - User not found`});
                    let updateUserAccPasswordActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let updateUserAccPasswordActivitylogQueryData = {user_id: userEmail, action:"UPDATE USER ACCOUNT PASSWORD",  status:'FAIL' , details: details,}
                    db.query(updateUserAccPasswordActivitylogQuery, updateUserAccPasswordActivitylogQueryData, (err) => console.log(err));
                    res.status(500).send('Something went wrong at the moment.');
                }

            }
        });
        
    }
    

}

function generateOTP(limit) {
    let digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < limit; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

let randomNum1;
const verifyUserEmail =  (req, res) => {

    let body = req.body;
    let userName = '';
    let userEmail = '';
    let isFromForgotPass = body['isFromForgotPass'];
    let userEmailVerificationMessage = {};

    if (isFromForgotPass){
        userEmail = body['userEmail'];
    } else {
        userName = body['userName'];
        userEmail = body['userEmail'];
    }

    randomNum1=generateOTP(4);
    
    console.log('Random: ', randomNum1);

    if (isFromForgotPass) {
        userEmailVerificationMessage = makeUserForgotPassEmailVerificationMessage(userEmail, randomNum1);
    } else {
        userEmailVerificationMessage = makeUserEmailVerificationMessage(userEmail, userName, randomNum1);
    }
    
    const transporter = createTransporter();

    transporter.sendMail(userEmailVerificationMessage, (err) => {
        if (err) {
            console.log('Failed Sending Email: ',err);
            res.status(500).send('Failed to send Email');
        } else {
            console.log('Successfully Sent Email');
            res.status(200).send('Sent Email');
        }
    });

}

const verifyNumber = (req, res) => {

        let body = req.body;
        let optNumber = body['otp'];
        let isFromResend = body['isFromResend'];

        if (isFromResend) {
            console.log('Domain is matched. Information is from Authentic source');
            if (optNumber == randomNum2){
                console.log('Email is Verified');
                res.status(200).send('Email is been successfully verified');
            } else {
                res.status(500).send('Email is not verified. Please go back and try again.');
            }

        } else{
            console.log('Domain is matched. Information is from Authentic source');
            if (optNumber == randomNum1){
                console.log('Email is Verified');
                res.status(200).send('Email is been successfully verified');
            } else {
                res.status(500).send('Email is not verified. May be you are entering wrong OTP number, re-send it again to verify.');
            }
        }
}


const getUserImage = async (req, res) => {

    let userId = req.query['userId'];

    let query = `SELECT user_image FROM users WHERE user_id = "${userId}"`;

    db.query(query, (error, result) => {

        if (error) {
            console.log('Error while fetching user image: ', error);
            res.status(500).send('Something went wrong while fetching user image');
        } else {
            const obj = JSON.stringify(result);
            const json = JSON.parse(obj);

            console.log('Successfully fetch user image');
            res.status(200).send(json[0]);
        }

    });

}

const checkIfFacebookUserIsAvailable = async (req, res) => {

    let body = req.body;
    console.log(body['userName']);

    let query = `SELECT user_name, user_email FROM users WHERE user_email = "${body['userEmail']}" AND user_name = "${body['userName']}"`;
     
    db.query(query, (err, result) => {
        if (err) {
            console.log('Error while fetching Facebook user: ',err);
            res.status(500).send('Something Went Wrong');
        } else {
            const obj = JSON.stringify(result);
            const json = JSON.parse(obj);

            if (json.length !== 0) {
                console.log('Facebook is Present');
                res.status(200).send('false');

            } else {
                console.log('Facebook is nor Present');
                res.status(200).send('true');
            }
        }
    });  

}

module.exports = {
    createNewUser,
    loginUser,
    logoutUser,
    deleteAccount,
    checkIfUserNameIsAvailable,
    checkIfFacebookUserIsAvailable,
    getUserImage,
    updateUserDesiredPercentages,
    verifyUserEmail,
    verifyNumber,
    changeUserPassword,
}