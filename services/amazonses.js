const AWS = require('aws-sdk');
const env = require('dotenv');

env.config();

const configSES = () => {

    const awsConfig = {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    }

    const SES = new AWS.SES(awsConfig);

    return SES;

}

const sendAccountCreatedSuccessfullyEmail = (recipientEmail, recipientName) => {

    const senderEmail = process.env.AWS_FROM_EMAIL;


    const params = {
        Source: senderEmail,
        Destination: {
            ToAddresses: [recipientEmail]
        },
        Message: {
            Subject: {
                Charset : "UTF-8",
                Data: "Account Created Successfully"
            }, 
            Body: {
                Html: {
                    Charset : "UTF-8",
                    Data: ``
                },

            }
        }
    }

    return params;

}

module.exports = {
    configSES,
    sendAccountCreatedSuccessfullyEmail
}