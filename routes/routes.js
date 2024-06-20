const express = require("express");

const router = express.Router();

const {createDataBase} = require("../controllers/dbConnectController");
const {createNewUser, 
       checkIfUserNameIsAvailable,
       checkIfUserEmailIsAvailable,
       checkIfGoogleUserIsAvailable,
       checkIfFacebookUserIsAvailable,
       loginUser,
       deleteAccount,
       logoutUser,
       updateUserDetails,
       getUserImage,
       getUserData,
       getUserToken,
       updateUserProfile,
       updateUserDesiredPercentages,
       verifyUserEmail,
       verifyNumber,
       changeUserPassword,
       resendOTP } = require('../controllers/userController');

router.get('/TheBalancer', createDataBase);

//The api route create/createUser
router.post('/createUser', createNewUser);

//The api route create/createNewPassword
router.post('/changePassword', changeUserPassword);

//The api route auth/loginUser requires - authentication
router.post('/loginUser', loginUser);

//The api route auth/logoutUser requires - authentication
router.post('/logout', logoutUser);

//The api route auth/getTokenOnly
router.post('/getTokenOnly', getUserToken);

//The api route update/updateUserDetails requires - authentication
router.post('/updateUserDetails', updateUserDetails);

//The api route update/updateProfileImage to update user profile image - requires authentication
router.post('/updateProfileImage', updateUserProfile);

//The api route update/deleteAccount to Delete user from DB - requires authentication
router.delete('/deleteAccount', deleteAccount);

//The api route update/updateUserDesiredPercentages requires - authentication
router.patch('/updateUserDesiredPercentages', updateUserDesiredPercentages);

//The api route check/checkIfUserNameExists
router.post('/checkIfUserNameExists', checkIfUserNameIsAvailable);

//The api route check/checkIfUserEmailExists
router.post('/checkIfUserEmailExists', checkIfUserEmailIsAvailable);

//The api route check/checkGoogleUser to check if Google user is present or not
router.post('/checkGoogleUser', checkIfGoogleUserIsAvailable);

//The api route check/checkFacebookUser to check if Facebook user is present or not
router.post('/checkFacebookUser', checkIfFacebookUserIsAvailable);

//The api route get/getUserData (specific user details) requires - authentication
router.get('/getUserData', getUserData);

//The api route to get freshly updated User image requires - authentication
router.get('/getUserImage', getUserImage);

//The api route to verify user email
router.post('/userEmail', verifyUserEmail);

//The api route to verify the OTP number 
router.post('/number', verifyNumber);

//The api route to resend OTP number
router.post('/resendOTP', resendOTP);

module.exports = {
    routes: router
}