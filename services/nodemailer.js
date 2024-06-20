const nodemailer = require("nodemailer");
const path = require("path");
const SMTP_SENDER_EMAIL = '';
const SMTP_USERNAME = '';
const SMTP_SECRET = '';
const SMTP_HOST = '';
const SMTP_PORT = 111;

const createTransporter = () => {

    return nodemailer.createTransport({
        port: SMTP_PORT,
        host: SMTP_HOST,
        auth: {
            user: SMTP_USERNAME,
            pass: SMTP_SECRET
        },
    });

}

const makeRegistrationSuccessfullMessage = (recipientEmail, recipientName) => {

     return msg = {
        from: SMTP_SENDER_EMAIL,
        to: recipientEmail,
        subject: "Account Created Successfully",
        html : ``,
        attachments: [{
            filename: 'Group.png',
            path: path.join(__dirname, "../src/uploads/emailTemplatesAssets/Group.png"),
            cid: ''
        }]
    }

}

const makeUserEmailVerificationMessage = (recipientEmail, recipientName, rand) => {

    return msg = {
        from: SMTP_SENDER_EMAIL,
        to: recipientEmail,
        subject: "Verify Email Address",
        html : ``,
        attachments: [{
            filename: 'Group1.png',
            path: path.join(__dirname, "../src/uploads/emailTemplatesAssets/Group1.png"),
            cid: ''
        }]
    }

}

const makeUserForgotPassEmailVerificationMessage = (recipientEmail, rand) => {

    let splittedEmail = recipientEmail.split('@')[0];

    return msg = {
        from: SMTP_SENDER_EMAIL,
        to: recipientEmail,
        subject: "Forgot Password",
        html : ``,
        attachments: [{
            filename: 'Group2.png',
            path: path.join(__dirname, "../src/uploads/emailTemplatesAssets/Group2.png"),
            cid: ''
        }]
    }

}

const makeSuccessfullChangePassMessage = (recipientEmail) => {

    let splittedEmail = recipientEmail.split('@')[0];

    return msg = {
        from: SMTP_SENDER_EMAIL,
        to: recipientEmail,
        subject: "Password Changed Successfully!",
        html : ``,
        attachments: [{
            filename: 'Group3.png',
            path: path.join(__dirname, "../src/uploads/emailTemplatesAssets/Group3.png"),
            cid: ''
        }]
    }
}


module.exports = {
    createTransporter,
    makeRegistrationSuccessfullMessage,
    makeUserEmailVerificationMessage,
    makeUserForgotPassEmailVerificationMessage,
    makeSuccessfullChangePassMessage
}   