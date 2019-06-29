    /*************************************************************************  
* @Execution : default node : cmd> server.js
* 
* 
* @Purpose : To send mail
* 
* @description : Send mail with url  and token
* 
* @overview : fundoo application
* @author : Prasanna More <prasannamore.494@gmail.com>
* @version : 1.0
* @since : 27-april-2019
*
******************************************************************************/
    
    // require node module
    const nodemailer = require('nodemailer');
    const logger = require("./logger").logger;
    // create mail transpoter
    exports.sendEmailFunction = (url, email) => {
        try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            },
        });
        // mail options
        const mailOptions = {
            from: 'FUNDOO MAILER',
            to: email,
            subject: 'FUNDOO-APP',
            text: url
        };

        // send mail
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                throw new Error(err);
                
                // console.log("Invalid username or password");
                // console.log("ERROR: while sending the mail", err)
            }
        });
    }
    catch (err) {
        logger.error(err)
        if (err instanceof ReferenceError
            || err instanceof SyntaxError
            || err instanceof TypeError
            || err instanceof RangeError) {
            return result;
        }
        else {
            result.message = err.message;
            return result
        }
    }
}

