const express = require("express");

const router = express.Router();
const {createNewUser, 
       checkIfUserNameIsAvailable,
       checkIfFacebookUserIsAvailable,
       loginUser,
       deleteAccount,
       logoutUser,
       getUserImage,
       updateUserDesiredPercentages,
       verifyUserEmail,
       verifyNumber,
       changeUserPassword } = require('../controllers/userController');

//The api route create/createUser
router.post('/createUser', createNewUser);

//The api route create/createNewPassword
router.post('/changePassword', changeUserPassword);

//The api route auth/loginUser requires - authentication
router.post('/loginUser', loginUser);

//The api route auth/logoutUser requires - authentication
router.post('/logout', logoutUser);

//The api route update/deleteAccount to Delete user from DB - requires authentication
router.delete('/deleteAccount', deleteAccount);

//The api route update/updateUserDesiredPercentages requires - authentication
router.patch('/updateUserDesiredPercentages', updateUserDesiredPercentages);

//The api route check/checkIfUserNameExists
router.post('/checkIfUserNameExists', checkIfUserNameIsAvailable);

//The api route check/checkFacebookUser to check if Facebook user is present or not
router.post('/checkFacebookUser', checkIfFacebookUserIsAvailable);

//The api route to get freshly updated User image requires - authentication
router.get('/getUserImage', getUserImage);

//The api route to verify user email
router.post('/userEmail', verifyUserEmail);

//The api route to verify the OTP number 
router.post('/number', verifyNumber);


module.exports = {
    routes: router
}