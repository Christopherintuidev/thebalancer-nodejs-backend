const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: ""
});

db.connect((err) => {
    if(err) {
        throw err;
    }
    console.log("Connection Established");
});

module.exports = db;