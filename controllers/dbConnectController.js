
const db = require("../src/db");

const createDataBase = async (req, res) => {

    let sql = "CREATE DATABASE TheBalancer";

    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log('Result');
        res.send("Database Created");
    });

}

module.exports = {
    createDataBase,
}