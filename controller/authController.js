const crypto = require('crypto');
const Org = require('../models/organizationModel');
const nodemailer = require('nodemailer');
const transport = require('../config/nodemailer');
const mailUser = process.env.EMAIL_USER;
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const forgotPassword = async function(req, res, next) {
  const { email } = req.body;

  try {
      // Generate token
      const token = crypto.randomBytes(20).toString('hex');

      // Find user by email
      const user = await Org.findOne({ where: { email } });

      if (!user) {
          return res.status(404).json({ error: 'No account with that email address exists.' });
      }

      // Update user with reset token and expiration time
      await user.update({
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 3600000 // 1 hour
      });

      const mailOptions = {
          to: email,
          from: mailUser,
          subject: 'Reset Password ',
          text: `Click the following link to reset your password: http://localhost:5502/org/resetPassword/${token}`,
          html: `<p>Click the following link to reset your password:</p><p><a href="http://localhost:5502/org/resetPassword/${token}">http://localhost:5502/org/resetPassword/${token}</a></p>`
      };

      transport.sendMail(mailOptions, function(err) {
          if (err) {
              console.error('Error sending email:', err);
              return res.status(500).json({ error: 'Error sending email' });
          }
          console.log('Email sent');
          res.status(200).json({ message: `An e-mail has been sent to ${email} with further instructions.` });
      });

  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
}

const resetPassword = async function(req, res) {
    try {
        // Check if req.body.password is a string
        if (typeof req.body.password !== 'string') {
            return res.status(400).json({ error: 'Invalid password format.' });
        }

        const user = await Org.findOne({ 
            where: { 
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { [Op.gt]: Date.now() } 
            } 
        });

        if (!user) {
            return res.json({ message: 'Password reset token is invalid or has expired.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Update password in the database
        await Org.update(
            { 
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null 
            },
            { where: { resetPasswordToken: req.params.token } }
        );

        // Send email notification
        const mailOptions = {  
            to: user.email,  
            from: mailUser,  
            subject: 'Your password has been changed',  
            text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`  
        };  

        transport.sendMail(mailOptions, function(err) {  
            if (err) {
                return res.json({ status: 'error', message: 'Error sending email' });
            }
            res.json({ status: 'success', message: 'Success! Your password has been changed.' });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

module.exports= {forgotPassword, resetPassword};
