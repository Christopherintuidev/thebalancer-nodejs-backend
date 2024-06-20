const db = require("../src/db");

//Function to insert Report to the user's percentages table
const insertReport = async (req, res) => {

    let userId = req.body['userId'];
    let userReports = req.body['reports'];

    let query = `UPDATE percentages_table SET ? WHERE user_id = "${userId}"`;
    let post = {
        reports : userReports
    };

    db.query(query, post, (error) => {

        if (error) {
            console.log('Error while inserting user\'s reports: ', error);
            let details = JSON.stringify({'action':`INSERT REPORT`,'status':'FAIL', 'message':`Failed to insert report for user Id ${userId}.`, 'error':`Occured ERROR - ${error}`});
            let insertReportsInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let insertReportsInActivitylogQueryData = {user_id: null, action:"INSERT REPORT",  status:'FAIL' , details: details,}
            db.query(insertReportsInActivitylogQuery, insertReportsInActivitylogQueryData, (err) => console.log(err));
            
            res.status(500).send('Error while inserting user\'s reports');
        } else {
            console.log('Successfully! inserted user\'s reports');
            let details = JSON.stringify({'action':`INSERT REPORT`,'status':'PASS', 'message':`Successfully inserted report for user Id ${userId}.`});
            let insertReportsInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let insertReportsInActivitylogQueryData = {user_id: null, action:"INSERT REPORT",  status:'PASS' , details: details,}
            db.query(insertReportsInActivitylogQuery, insertReportsInActivitylogQueryData, (err) => console.log(err));

            res.status(200).send('Successfully inserted user\'s reports');
        }

    });

}

//Function to fetch user's reports from percentages table
const fetchReports = async (req, res) => {

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
    
                let getUserReportsQuery = `SELECT reports FROM percentages_table WHERE user_id = "${user_id}"`;
    
                db.query(getUserReportsQuery, (error, result) => {
                    if (error) {
                        console.log('Failed To Get User\'s reports');
                        res.status(404).send('Something went wrong at the moment');
                    } else {

                        if (result.length !== 0) {
                            const obj = JSON.stringify(result);
                            const json = JSON.parse(obj);
                            const data = json[0]['reports'];
                            
                            console.log('Successfully Fetched User\'s Reports');
                            res.status(200).send({reports : data});

                        } else {
                            console.log('Failed To Get User\'s Reports');
                            res.status(200).send({reports: []});
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

//Function to update user's reports from percentages table
const updateReports = async (req, res) => {

    let body = req.claims;
    let userName = body['user_name'];
    let reports = req.body['reports'];

    let getUserQuery = `SELECT user_id FROM users WHERE user_name = "${userName}"`;

    let post = {
        reports: reports
    }


    db.query(getUserQuery, (error, result) => {

        if(error) {
            console.log('Failed! User not found');
            res.status(404).send('Something went wrong at the moment.');
        } else {

            if (result.length !== 0) {
                const obj  = JSON.stringify(result);
                const user = JSON.parse(obj);
                const user_id = user[0]['user_id'];

                let getUserReportsQuery = `UPDATE percentages_table SET ? WHERE user_id = "${user_id}"`;
    
                db.query(getUserReportsQuery, post,  (error) => {
                    if (error) {
                        console.log('Failed To Update User\'s reports');
                        res.status(404).send('Something went wrong at the moment');
                    } else {

                        console.log('Successfully Updated User\'s Reports');
                        res.status(200).send("Successfully Updated User\'s Reports");
                
                    }
                });

            }
 
        }


    });

}

//Function to reset user selected year report data
const resetReportData = async (req, res) => {

    let bodyData = req.body;
    let user_id = bodyData['user_id'];
    let year = bodyData['year'];
    let startingYear = bodyData['starting_year'];
    let endingYear = bodyData['ending_year'];
    let newActualPercentages = bodyData['actual_percentages'];

    console.log(`Deleting From ${startingYear} To ${endingYear}`);

    let deleteActivitiesQuery = `DELETE FROM activities WHERE user_id = "${user_id}" AND activity_selected_date BETWEEN "${startingYear}" AND "${endingYear}"`;
    let updateActualPercentages = `UPDATE percentages_table SET ?`;

    let updateActualPercentageData = {
        counts:newActualPercentages,
        actual_percentages: newActualPercentages
    };

    db.query(deleteActivitiesQuery, async (err) => {

        if(err) {

            console.log('Error while resetting user\'s reports: ', err);
            let details = JSON.stringify({'action':`RESETTING USER REPORT`,'status':'FAIL', 'message':`Failed to reset  report for user Id ${user_id}.`, 'error':`Occured ERROR - ${err}`});
            let resetReportsInActivitylogQuery = 'INSERT INTO activity_log SET ?'
            let resetReportsInActivitylogQueryData = {user_id: user_id, action:"RESETTING USER REPORT",  status:'FAIL' , details: details,}
            db.query(resetReportsInActivitylogQuery, resetReportsInActivitylogQueryData, (err) => console.log(err));

        } else {
            console.log('Successfully Deleted the User Activities');
            db.query(updateActualPercentages, updateActualPercentageData, (err) => {

                if(err) {

                    console.log('Error while resetting user\'s reports: ', err);
                    let details = JSON.stringify({'action':`RESETTING USER REPORT`,'status':'FAIL', 'message':`Failed to reset  report for user Id ${user_id}.`, 'error':`Occured ERROR - ${err}`});
                    let resetReportsInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let resetReportsInActivitylogQueryData = {user_id: user_id, action:"RESETTING USER REPORT",  status:'FAIL' , details: details,}
                    db.query(resetReportsInActivitylogQuery, resetReportsInActivitylogQueryData, (err) => console.log(err));

                } else {
                    console.log('Successfully resetted the user reports')
                    let details = JSON.stringify({'action':`RESETTING USER REPORT`,'status':'PASS', 'message':`Successfully resetted report for user Id ${user_id}.`});
                    let resetReportsInActivitylogQuery = 'INSERT INTO activity_log SET ?'
                    let resetReportsInActivitylogQueryData = {user_id: user_id, action:"RESETTING USER REPORT",  status:'PASS' , details: details,}
                    db.query(resetReportsInActivitylogQuery, resetReportsInActivitylogQueryData, (err) => console.log(err));    

                    res.status(200).send({
                        "status" : true,
                        "message" : `Sucessfully reseted your data for the year ${year}`
                    });  
                }


            });

        }

    });

}


module.exports = {
    insertReport,
    fetchReports,
    updateReports,
    resetReportData
}