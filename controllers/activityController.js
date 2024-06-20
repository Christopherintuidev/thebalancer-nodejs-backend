const db = require("../src/db");


const addActivity = async (req, res) => {

    let userName = req.claims['user_name'];
    let reqBody = req.body;
    let fetchUserQuery = `SELECT user_id FROM users WHERE user_name = "${userName}"`;


    db.query(fetchUserQuery, (err, result) => {

        if (err) {
            console.log('Error while fetching user: ', err);
            let details = JSON.stringify({'action':`ADD NEW ACTIVITY`,'status':'FAIL', 'message':`Failed to add new activity by email ${userName}.`, 'error':`Occured ERROR - ${err}`});
            let addActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let addActivityInActivitylogQueryData = {user_id: userName, action:"ADD NEW ACTIVITY",  status:'FAIL' , details: details,}
            db.query(addActivityInActivitylogQuery, addActivityInActivitylogQueryData, (err) => console.log(err));
            res.status(404).send('Something went wrong. Please try again');
        } else {

            const obj = JSON.stringify(result);
            const json = JSON.parse(obj);

            if (result.length !== 0) {

                const user_id = json[0]['user_id'];
    
                let query = "INSERT INTO activities SET ?";
                let post = {
                    activity_id: reqBody['activityId'],
                    user_id: user_id,
                    activity_name: reqBody['taskName'],
                    activity_start_time: reqBody['startTime'],
                    activity_end_time: reqBody['endTime'],
                    activity_category_name: reqBody['categoryName'],
                    activity_selected_date: reqBody['selectedDate'],
                    activity_creation_date: reqBody['activityCreationDate'],
                }
    
                db.query(query, post, (error) => {
                    if (error) {
                        console.log('Error while adding new activity: ', error);
                        let details = JSON.stringify({'action':`ADD NEW ACTIVITY`,'status':'FAIL', 'message':`Failed to add new activity by email ${userName}.`, 'error':`Occured ERROR - ${error}`});
                        let addActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                        let addActivityInActivitylogQueryData = {user_id: userName, action:"ADD NEW ACTIVITY",  status:'FAIL' , details: details,}
                        db.query(addActivityInActivitylogQuery, addActivityInActivitylogQueryData, (err) => console.log(err));
                        res.status(400).send('Something went wrong while adding new activity.');
                    } else {

                        let details = JSON.stringify({'action':`ADD NEW ACTIVITY`,'status':'PASS', 'message':`Successfully added new activity by email ${userName}.`});
                        let addActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                        let addActivityInActivitylogQueryData = {user_id: userName, action:"ADD NEW ACTIVITY",  status:'PASS' , details: details,}
                        db.query(addActivityInActivitylogQuery, addActivityInActivitylogQueryData, (err) => console.log(err));

                        res.status(200).send('successfully inserted');
                    }
                });

            } else {
                console.log('Error while fetching user: ');
                let details = JSON.stringify({'action':`ADD NEW ACTIVITY`,'status':'FAIL', 'message':`Failed to add new activity by email ${userName}.`, 'error':`Occured ERROR - There is not user`});
                let addActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                let addActivityInActivitylogQueryData = {user_id: userName, action:"ADD NEW ACTIVITY",  status:'FAIL' , details: details,}
                db.query(addActivityInActivitylogQuery, addActivityInActivitylogQueryData, (err) => console.log(err));
                res.status(404).send('Something went wrong. Please try again');
            }

                
        }
    });
        
}

const deleteActivity = async (req, res) => {

    let reqBody = req.body;
    let userName = req.claims['user_name'];
    let id = reqBody['activityID'];

    let deleteActivityQuery = `DELETE FROM activities WHERE activity_id = "${id}"`;

    db.query(deleteActivityQuery, (err) => {
        if (err) {
            console.log('Failed to delete the activity: ', err);
            let details = JSON.stringify({'action':`DELETE ACTIVITY`,'status':'FAIL', 'message':`Failed to delete activity of Id ${id} by username ${userName}.`, 'error':`Occured ERROR - ${err}`});
            let deleteActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let deleteActivityInActivitylogQueryData = {user_id: userName, action:"DELETE ACTIVITY",  status:'FAIL' , details: details,}
            db.query(deleteActivityInActivitylogQuery, deleteActivityInActivitylogQueryData, (err) => console.log(err));

            res.status(500).send('The activity does not exists.');
        } else {
            console.log('Success');
            let details = JSON.stringify({'action':`DELETE ACTIVITY`,'status':'PASS', 'message':`Successfully deleted activity of Id ${id} by username ${userName}.`});
            let deleteActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let deleteActivityInActivitylogQueryData = {user_id: userName, action:"DELETE ACTIVITY",  status:'PASS' , details: details,}
            db.query(deleteActivityInActivitylogQuery, deleteActivityInActivitylogQueryData, (err) => console.log(err));

            res.status(200).send('Successfully deleted the activity');
        }
    });


}
//Continue From Here Tomorrow
const updateActivity = async (req, res) => {

    let body = req.body;
    let activityName = body['taskName'];
    let categoryName = body['categoryName'];
    let activityID = body['activityID'];
    let userName = req.claims['user_name'];

    let updateQuery = `UPDATE activities SET activity_name = "${activityName}", activity_category_name = "${categoryName}" WHERE activity_id = "${activityID}"`;

    db.query(updateQuery, (error) => {

        if(error) {
            console.log('Failed to update the activity: ', error);
            let details = JSON.stringify({'action':`UPDATE ACTIVITY`,'status':'FAIL', 'message':`Failed to update activity of Id ${activityID} by username ${userName}.`, 'error':`Occured ERROR - ${error}`});
            let updateActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let updateActivityInActivitylogQueryData = {user_id: userName, action:"UPDATE ACTIVITY",  status:'FAIL' , details: details,}
            db.query(updateActivityInActivitylogQuery, updateActivityInActivitylogQueryData, (err) => console.log(err));
            res.status(500).send('Something went wrong at the moment.');
        } else {
            let details = JSON.stringify({'action':`UPDATE ACTIVITY`,'status':'PASS', 'message':`Successfully updated activity of Id ${activityID} by username ${userName}.`});
            let updateActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let updateActivityInActivitylogQueryData = {user_id: userName, action:"UPDATE ACTIVITY",  status:'PASS' , details: details,}
            db.query(updateActivityInActivitylogQuery, updateActivityInActivitylogQueryData, (err) => console.log(err));

            res.status(200).send('Successfully updated the activity');
        }

    });
        
}

const fetchUserActivities = async (req, res) => {

    let userName = req.claims['user_name'];
    let fetchUserQuery = `SELECT user_id FROM users WHERE user_name = "${userName}"`;

    db.query(fetchUserQuery, (err, result) => {

        if (err) {
            console.log('Failed1');
            res.status(404).send('Something went wrong at the moment.');
        } else {

            if (result.length !== 0) {

                let obj = JSON.stringify(result);
                let json = JSON.parse(obj);

                let uid = json[0]['user_id'];

                let query = `SELECT starting_week_date, ending_week_date FROM percentages_table WHERE user_id = "${uid}"`;

                db.query(query, (error, result) => {

                    if (result.length !== 0) {

                        if (error) {
                            console.log('Error While Fetching Week Dates');
                            res.status(404).send('Something went wrong at the moment.');

                        } else {
    
                            let obj = JSON.stringify(result);
                            let dates = JSON.parse(obj);
    
                            let startDate = dates[0]['starting_week_date'];
                            let endDate = dates[0]['ending_week_date'];

                            let lastOneMonthDate = new Date(startDate);
                            lastOneMonthDate.setDate(lastOneMonthDate.getDate() - 30);


                            let query = `SELECT * FROM activities WHERE user_id = "${uid}" AND activity_creation_date BETWEEN "${lastOneMonthDate}" AND "${endDate}"`;
    
                            db.query(query, (error, result) => {

                                    if (error) {
                                        console.log('Failed: ', error);
                                        res.status(404).send('Something went wrong at the moment.');
                                    } else {
        
                                        const obj = JSON.stringify(result);
                                        const json = JSON.parse(obj);
                                            
                                        console.log(json);
                                        res.status(200).send({json: json});
                                    }

                            });
    
                        }

                    } else {
                        console.log('Error While Fetching Week Dates');
                        res.status(404).send('Something went wrong at the moment.');
                    }

                });

            } else {
                console.log('Failed2');
                res.status(404).send('Something went wrong at the moment.');
            }
                
        }

    });
}

const searchUserActivities = async (req, res) => {

    let userName = req.claims['user_name'];
    let fetchUserQuery = `SELECT user_id FROM users WHERE user_name = "${userName}"`;
    let fromDate = req.query['fromDate'];
    let toDate = req.query['toDate'];

    db.query(fetchUserQuery, (err, result) => {

        if (err) {
            console.log('Failed1');
            let details = JSON.stringify({'action':`SEARCH ACTIVITY`,'status':'FAIL', 'message':`Failed to search activity(ies) from: ${fromDate} to: ${toDate} by username ${userName}.`, 'error':`Occured ERROR - ${err}`});
            let searchActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let searchActivityInActivitylogQueryData = {user_id: userName, action:"SEARCH ACTIVITY",  status:'FAIL' , details: details,}
            db.query(searchActivityInActivitylogQuery, searchActivityInActivitylogQueryData, (err) => console.log(err));
            res.status(404).send('Something went wrong at the moment.');
        } else {

            if (result.length !== 0) {

                let obj = JSON.stringify(result);
                let json = JSON.parse(obj);

                let uid = json[0]['user_id'];

                let searchQuery = `SELECT * FROM activities WHERE user_id = "${uid}" AND activity_selected_date BETWEEN "${fromDate}" AND "${toDate}"`;
    
                db.query(searchQuery, (error, result) => {

                        if (error) {
                            console.log('Failed: ', error);
                            let details = JSON.stringify({'action':`SEARCH ACTIVITY`,'status':'FAIL', 'message':`Failed to search activity(ies) from: ${fromDate} to: ${toDate} by username ${userName}.`, 'error':`Occured ERROR - ${error}`});
                            let searchActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                            let searchActivityInActivitylogQueryData = {user_id: userName, action:"SEARCH ACTIVITY",  status:'FAIL' , details: details,}
                            db.query(searchActivityInActivitylogQuery, searchActivityInActivitylogQueryData, (err) => console.log(err));
                            res.status(404).send('Something went wrong at the moment.');
                        } else {

                            const obj = JSON.stringify(result);
                            const json = JSON.parse(obj);
                                
                            console.log(json);
                            let details = JSON.stringify({'action':`SEARCH ACTIVITY`,'status':'PASS', 'message':`Successfully searched activity(ies) from: ${fromDate} to: ${toDate} by username ${userName}.`});
                            let searchActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                            let searchActivityInActivitylogQueryData = {user_id: userName, action:"SEARCH ACTIVITY",  status:'PASS' , details: details,}
                            db.query(searchActivityInActivitylogQuery, searchActivityInActivitylogQueryData, (err) => console.log(err));
                            res.status(200).send({json: json});
                        }

                });

            } else {
                console.log('Failed2');
                let details = JSON.stringify({'action':`SEARCH ACTIVITY`,'status':'FAIL', 'message':`Failed to search activity(ies) from: ${fromDate} to: ${toDate} by username ${userName}.`, 'error':`Occured ERROR - There is no user`});
                let searchActivityInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                let searchActivityInActivitylogQueryData = {user_id: userName, action:"SEARCH ACTIVITY",  status:'FAIL' , details: details,}
                db.query(searchActivityInActivitylogQuery, searchActivityInActivitylogQueryData, (err) => console.log(err));
                res.status(404).send('Something went wrong at the moment.');
            }
                
        }

    });

}

const fetchUserActualPercentages = async (req, res) => {

    let body = req.claims;
    let userName = body['user_name'];

    let getUserQuery = `SELECT user_id FROM users WHERE user_name = "${userName}"`;

    db.query(getUserQuery, (error, result) => {
        if (error) {
            console.log('Failed! User not found');
            res.status(404).send('Something went wrong at the moment.');
        } else {

            if (result.length !== 0) {
                const obj  = JSON.stringify(result);
                const user = JSON.parse(obj);
                const user_id = user[0]['user_id'];
    
                let getUserActPerQuery = `SELECT * FROM percentages_table WHERE user_id = "${user_id}"`;
    
                db.query(getUserActPerQuery, (error, result) => {
                    if (error) {
                        console.log('Failed To Get User\'s Actual Percentages');
                        res.status(404).send('Something went wrong at the moment');
                    } else {

                        if (result.length !== 0) {
                            const obj = JSON.stringify(result);
                            const json = JSON.parse(obj);
                            const data = json;
                            
                            console.log('Successfully Fetched the Actual Percentages');
                            res.status(200).send({data: data});

                        } else {
                            console.log('Failed To Get User\'s Actual Percentages');
                            res.status(404).send('Something went wrong at the moment');
                        }
    
                    }
                });

            } else {
                console.log('Failed! User not found');
                res.status(404).send('Something went wrong at the moment.');
            }

        }
    });

}

const updateActualPercentages = async (req, res) => {

    let body = req.claims;
    let userName = body['user_name'];
    let countsMap = req.body['counts'];
    let actualPercentages = req.body['actualPercentages'];

    let getUserQuery = `SELECT user_id FROM users WHERE user_name = "${userName}"`;

    db.query(getUserQuery, (error, result) => {
        if (error) {
            console.log('Failed! User not found');
            res.status(404).send('Something went wrong at the moment.');
        } else {
            const obj  = JSON.stringify(result);
            const user = JSON.parse(obj);

            if (result.length !== 0) {
                const user_id = user[0]['user_id'];
    
                let updateUserActPerQuery = `UPDATE percentages_table SET ? WHERE user_id = "${user_id}"`;
                let post = {
                    counts: countsMap,
                    actual_percentages: actualPercentages
                }
    
                db.query(updateUserActPerQuery, post, (error) => {
                    if (error) {
                        console.log('Failed To update User\'s Actual Percentages');
                        res.status(500).send('Failed! to update actual percentages');
                    } else {
                        console.log('Successfully Fetched the Actual Percentages');
                        res.status(200).send('Successfully updated the counts and actual percentages');
                    }
                });

            } else {
                console.log('Failed! User not found');
                res.status(404).send('Something went wrong at the moment.');
            }

        }
    });

}

const updateStartEndWeekDates = async (req, res) => {

    let userName = req.claims['user_name'];
    let startingDate = req.body['startingDate'];
    let endingDate = req.body['endingDate'];
    let getUserQuery = `SELECT user_id FROM users WHERE user_name = "${userName}"`;

    db.query(getUserQuery, (error, result) => {

        if (error) {
            console.log('Failed! User not found');
            let details = JSON.stringify({'action':`UPDATE START & END WEEK DATES`,'status':'FAIL', 'message':`Failed to update start and end week dates, new Start Date: ${startingDate} and new End Date: ${endingDate} for username ${userName}.`, 'error':`Occured ERROR - ${error}`});
            let updateStartEndWeekDateInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let updateStartEndWeekDateInActivitylogQueryData = {user_id: userName, action:"UPDATE START & END WEEK DATES",  status:'FAIL' , details: details,}
            db.query(updateStartEndWeekDateInActivitylogQuery, updateStartEndWeekDateInActivitylogQueryData, (err) => console.log(err));
            res.status(404).send('Failed! User Not Found');
        } else {
            const obj  = JSON.stringify(result);
            const user = JSON.parse(obj);
            const user_id = user[0]['user_id'];

            let updateWeekDatesQuery = `UPDATE percentages_table SET ? WHERE user_id = "${user_id}"`;
            let post = {
                starting_week_date: startingDate,
                ending_week_date: endingDate
            }

            db.query(updateWeekDatesQuery, post, (error) => {
                if (error) {
                    console.log('Failed To update User\'s Week Dates');
                    let details = JSON.stringify({'action':`UPDATE START & END WEEK DATES`,'status':'FAIL', 'message':`Failed to update start and end week dates, new Start Date: ${startingDate} and new End Date: ${endingDate} for username ${userName}.`, 'error':`Occured ERROR - ${error}`});
                    let updateStartEndWeekDateInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let updateStartEndWeekDateInActivitylogQueryData = {user_id: userName, action:"UPDATE START & END WEEK DATES",  status:'FAIL' , details: details,}
                    db.query(updateStartEndWeekDateInActivitylogQuery, updateStartEndWeekDateInActivitylogQueryData, (err) => console.log(err));
                    res.status(404).send('Failed! to update Week Dates');
                } else {

                    console.log('Successfully Updated the Week Dates');
                    let details = JSON.stringify({'action':`UPDATE START & END WEEK DATES`,'status':'PASS', 'message':`Successfully updated start and end week dates, new Start Date: ${startingDate} and new End Date: ${endingDate} for username ${userName}.`});
                    let updateStartEndWeekDateInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let updateStartEndWeekDateInActivitylogQueryData = {user_id: userName, action:"UPDATE START & END WEEK DATES",  status:'PASS' , details: details,}
                    db.query(updateStartEndWeekDateInActivitylogQuery, updateStartEndWeekDateInActivitylogQueryData, (err) => console.log(err));
                    res.status(200).send('Successfully updated Week Dates');
                }
            });
        }

    });

}

const updateStartEndYearDates = async (req, res) => {

    let userName = req.claims['user_name'];
    let startingNewYearDate = req.body['startingNewYearDate'];
    let endingNewYearDate = req.body['endingNewYearDate'];
    let getUserQuery = `SELECT user_id FROM users WHERE user_name = "${userName}"`;

    db.query(getUserQuery, (error, result) => {

        if (error) {
            console.log('Failed! User not found');
            let details = JSON.stringify({'action':`UPDATE START & END YEAR DATES`,'status':'FAIL', 'message':`Failed to update start and end year dates, new Start Date: ${startingNewYearDate} and new End Date: ${endingNewYearDate} for username ${userName}.`, 'error':`Occured ERROR - ${error}`});
            let updateStartEndYearDateInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let updateStartEndYearDateInActivitylogQueryData = {user_id: userName, action:"UPDATE START & END YEAR DATES",  status:'FAIL' , details: details,}
            db.query(updateStartEndYearDateInActivitylogQuery, updateStartEndYearDateInActivitylogQueryData, (err) => console.log(err));
            res.status(404).send('Failed! User Not Found');
        } else {
            const obj  = JSON.stringify(result);
            const user = JSON.parse(obj);
            const user_id = user[0]['user_id'];

            let updateWeekDatesQuery = `UPDATE percentages_table SET ? WHERE user_id = "${user_id}"`;
            let post = {
                starting_year_date: startingNewYearDate,
                ending_year_date: endingNewYearDate
            }

            db.query(updateWeekDatesQuery, post, (error) => {
                if (error) {
                    console.log('Failed To update User\'s New Year Dates');
                    let details = JSON.stringify({'action':`UPDATE START & END YEAR DATES`,'status':'FAIL', 'message':`Failed to update start and end year dates, new Start Date: ${startingNewYearDate} and new End Date: ${endingNewYearDate} for username ${userName}.`, 'error':`Occured ERROR - ${error}`});
                    let updateStartEndYearDateInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let updateStartEndYearDateInActivitylogQueryData = {user_id: userName, action:"UPDATE START & END YEAR DATES",  status:'FAIL' , details: details,}
                    db.query(updateStartEndYearDateInActivitylogQuery, updateStartEndYearDateInActivitylogQueryData, (err) => console.log(err));
                    res.status(404).send('Failed! to update New Year Dates');
                } else {

                    console.log('Successfully Updated the New Year Dates');
                    let details = JSON.stringify({'action':`UPDATE START & END YEAR DATES`,'status':'PASS', 'message':`Successfully updated start and end year dates, new Start Date: ${startingNewYearDate} and new End Date: ${endingNewYearDate} for username ${userName}.`});
                    let updateStartEndYearDateInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let updateStartEndYearDateInActivitylogQueryData = {user_id: userName, action:"UPDATE START & END YEAR DATES",  status:'PASS' , details: details,}
                    db.query(updateStartEndYearDateInActivitylogQuery, updateStartEndYearDateInActivitylogQueryData, (err) => console.log(err));
                    res.status(200).send('Successfully updated the New Year Dates');
                }
            });
        }

    });

}

const getYearActivities = async (req, res) => {

    let userName = req.claims['user_name'];
    let startingYear = req.query['startingDate'];
    let endingYear = req.query['endingDate'];

    let fetchUserQuery = `SELECT user_id FROM users WHERE user_name = "${userName}"`;

    db.query(fetchUserQuery, (error, result) => {

        if (error) {
            console.log('Error While Fetching User Details: ',error);
            let details = JSON.stringify({'action':`FETCH WHOLE YEAR ACTIVITIES`,'status':'FAIL', 'message':`Failed to fetch whole year activities from ${startingYear} tp ${endingYear} for username ${userName}.`, 'error':`Occured ERROR - ${error}`});
            let getYearActivitiesInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let getYearActivitiesInActivitylogQueryData = {user_id: userName, action:"FETCH WHOLE YEAR ACTIVITIES",  status:'FAIL' , details: details,}
            db.query(getYearActivitiesInActivitylogQuery, getYearActivitiesInActivitylogQueryData, (err) => console.log(err));
            res.status(404).send('Something went wrong.');
        } else {
            const obj = JSON.stringify(result);
            const json = JSON.parse(obj);

            if (result.length !== 0) {
                const user_id = json[0]['user_id'];
    
                let query = `SELECT * FROM activities WHERE user_id = "${user_id}" AND activity_selected_date BETWEEN "${startingYear}" AND "${endingYear}"`;
    
                db.query(query, (error, result) => {
    
                    if (error) {
                        console.log('Error while fetching Year Activites');
                        let details = JSON.stringify({'action':`FETCH WHOLE YEAR ACTIVITIES`,'status':'FAIL', 'message':`Failed to fetch whole year activities from ${startingYear} tp ${endingYear} for username ${userName}.`, 'error':`Occured ERROR - ${error}`});
                        let getYearActivitiesInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                        let getYearActivitiesInActivitylogQueryData = {user_id: userName, action:"FETCH WHOLE YEAR ACTIVITIES",  status:'FAIL' , details: details,}
                        db.query(getYearActivitiesInActivitylogQuery, getYearActivitiesInActivitylogQueryData, (err) => console.log(err));
                        res.status(500).send('Error while fetching year Activities');
                    } else {
                        const obj = JSON.stringify(result);
                        const json = JSON.parse(obj);

                        if (result.length !== 0) {
                            console.log(json);
        
                            console.log('Successfully fetched Year Activites');
                            
                            res.status(200).send({activities: json});
                        } else {
                            console.log('Error while fetching Year Activites');
                            let details = JSON.stringify({'action':`FETCH WHOLE YEAR ACTIVITIES`,'status':'FAIL', 'message':`Failed to fetch whole year activities from ${startingYear} tp ${endingYear} for username ${userName}.`, 'error':`Occured Error - There are not activties`});
                            let getYearActivitiesInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                            let getYearActivitiesInActivitylogQueryData = {user_id: userName, action:"FETCH WHOLE YEAR ACTIVITIES",  status:'FAIL' , details: details,}
                            db.query(getYearActivitiesInActivitylogQuery, getYearActivitiesInActivitylogQueryData, (err) => console.log(err));
                            res.status(500).send('Error while fetching year Activities');
                        }
                    }
    
                });

            } else {
                console.log('Error While Fetching User Details: ');
                let details = JSON.stringify({'action':`FETCH WHOLE YEAR ACTIVITIES`,'status':'FAIL', 'message':`Failed to fetch whole year activities from ${startingYear} tp ${endingYear} for username ${userName}.`, 'error': `Occured Error - There are no user`});
                let getYearActivitiesInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                let getYearActivitiesInActivitylogQueryData = {user_id: userName, action:"FETCH WHOLE YEAR ACTIVITIES",  status:'FAIL' , details: details,}
                db.query(getYearActivitiesInActivitylogQuery, getYearActivitiesInActivitylogQueryData, (err) => console.log(err));
                res.status(404).send('Something went wrong.');
            }


        }

    });
}


module.exports = {
    addActivity,
    deleteActivity,
    fetchUserActivities,
    updateActivity,
    fetchUserActualPercentages,
    searchUserActivities,
    updateActualPercentages,
    updateStartEndWeekDates,
    updateStartEndYearDates,
    getYearActivities
}