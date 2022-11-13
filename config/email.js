const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "...",
  port: 465,
  secure: true,
  auth: {
    user: '...',
    pass: '...'
  }
});

exports.sendEmail = (email, subject, message) => {
  const mailOptions = {
    from: 'Electrical Monitoring',
    to: email,
    subject: subject,
    html: message
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};