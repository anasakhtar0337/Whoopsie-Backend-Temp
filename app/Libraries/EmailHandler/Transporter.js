const nodemailer = require("nodemailer")
const nodemailerSendgrid = require('nodemailer-sendgrid');
const constants = require("../../config/constants")

class Transporter {

    constructor() {
        this.transporter = (constants.MAIL_SYSTEM == 'nodemailer') ? nodemailer.createTransport({
            host: constants.MAIL_HOST,
            port: constants.MAIL_PORT,
            secure: true,
            requireTLS: true,
            auth: {
                user: constants.MAIL_EMAIL,
                pass: constants.MAIL_PASSWORD
            }
        }) : nodemailer.createTransport(nodemailerSendgrid({
            apiKey: constants.MAIL_API_KEY
        }));
    }

    async sendMail(mailOptions) {
        return new Promise((res, rej) => {
            this.transporter.sendMail(mailOptions, (err, info) => {
                if (err) rej(err);
                else res();
            })
        })
    }



}

module.exports = Transporter