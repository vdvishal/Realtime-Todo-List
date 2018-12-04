const nodemailer = require('nodemailer')



    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'cocb9154@gmail.com',
            pass: 'vishal12345'
        }
    });

    let sendEmail = (data) => { 
        let mailOptions = {
            from: 'Admin', // sender address
            to: data.email, 
            subject: 'Account created succesfully', // Subject line
            text: 'Hello, welcome', // plain text body
        };

   
        

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });

}


        let emailVerification = (data) => {
            let mailOptions = {
                from: 'Admin', // sender address
                to: data.email, 
                subject: 'Password reset', // Subject line
                text: `Verification Token:${data.token}`, // plain text body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            });
        }

module.exports = {
    mail: sendEmail,
    verifyMail : emailVerification
  }
  