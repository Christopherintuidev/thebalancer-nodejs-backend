const multer = require("multer");
const path = require("path");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/profileImages");
        // cb(null, "/opt/bitnami/apache/htdocs/IntuiDev-Balancer-Backend/src/uploads/profileImages");
    },
    filename: function (req, file, cb) {
        let userId = req.query['userId'];
        cb(null, userId + path.extname(file.originalname));
    },
});

// const upload = multer({storage: storage});

module.exports = multer({storage: storage});