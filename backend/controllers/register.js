const Registration = require("../models/register");
const nodemailer = require('nodemailer');

const register = async (req, res) => {
    try {
        
        const { name, usn, phone, email, semester, branch, event } = req.body;

        const preExistingRegisteration = await Registration.findOne({ usn, event });
        console.log(preExistingRegisteration);
        
        if(preExistingRegisteration){
            return res.status(400).json({
                msg: 'You have already registered for this event',
                success: false
            });
        }

        const newRegisteration = await Registration.create(req.body);

        async function main() {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port : 465,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASSWORD
                }
            });

            const pdfAttachment1 = {
                filename: 'Code of Conduct',
                path: '../assets/Code Of Conduct.pdf'
            };
    
            const pdfAttachment2 = {
                filename: 'Terms & Conditions',
                path: '../assets/Terms and Conditions.pdf'
            };

            await transporter.sendMail({
                from: process.env.MAIL_USER,
                to: email,
                subject: 'Catalysis2.0 Registration',
                html:   `<div>
                        <p>Your registration is successfull!</p> 
                        <p>The whatsapp link will be shared soon. Kindly check your mail for further updates.</p>
                        </div>`,
                attachments: [pdfAttachment1, pdfAttachment2],
            });
        }
        
        if(newRegisteration) {
            await main();
        }
        
        res.status(201).json({ newRegisteration });
    }
    catch (error) {
        res.status(400).json({
            msg: 'Something went Wrong!!',
            error: error,
            success: false
        });
       
    }
}

const getRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({});
        res.status(200).json({ registrations });
    } 
    catch (error) {
        res.status(500).json({
            msg: 'Something went Wrong!!',
            error: error,
            success: false
        });
    }
}

const getEventDetails = async (req, res) => {
    try {
        console.log(req.query);
        const { category } = req.query;

        let allEvent;
        if (category) {
            allEvent = await Registration.find({ event: category });
        } else {
            allEvent = await Registration.find({});
        }

        res.status(200).json({ allEvent });
    }
    catch (error) {
        res.status(500).json({
            msg: 'Something went Wrong!!',
            error: error,
            success: false
        });
    }
}

module.exports = {
    register,
    getRegistrations,
    getEventDetails
}
