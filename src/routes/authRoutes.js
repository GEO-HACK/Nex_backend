const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

/*
Dev env admin:
login - 
{
    "email": "main@admin00.com",
    "password": "p@$swArd"
}

register -
{
    "institution": "Jomo Kenyatta University of Agriculture and technology",
    "fname": "Mark ",
    "lname": "Victor",
    "username": "",
    "email": "main@admin00.com",
    "password": "p@$swArd"
}

Dev env author
{
    "email": "regular@author00.com",
    "password": "p@$swArd"
}
*/

router.post("/register", authController.register);
router.post("/register-admin",  verifyToken, authController.registerAdmin);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
