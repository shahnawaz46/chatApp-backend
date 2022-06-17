const nodemailer = require("nodemailer");

const sendMail = (option) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    })

    const options = {
        from: process.env.EMAIL,
        to: option.email,
        subject: option.subject,
        html: option.text
    }

    transporter.sendMail(options, (error) => {
        if (error) {
            console.log(error)
        }
        // console.log(success)
    })
}

module.exports = sendMail;