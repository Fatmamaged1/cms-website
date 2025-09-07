require('dotenv').config();
const { sendConfirmationEmail } = require('./services/sendMail');

sendConfirmationEmail('fatma.m.elessawy@gmail.com', 'This is a test message.')
  .then(() => console.log('Test email sent'))
  .catch(err => console.error('Error:', err));
