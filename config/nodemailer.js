const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS
    },
    
});

transport.verify(function(error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready!!");
    }
});

module.exports= transport;