/************************************************
* Title: SendGrid E-mail
* Desc: 
* Modified: 
* Notes:
* 
*
************************************************/
var SendGrid = require('sendgrid').SendGrid;

var optionalParams = {
  smtpapi: new SmtpapiHeaders(),
  to: 'mail@chrisaiv.com',
  from: 'no-reply@chrisaiv.com',
  subject: 'What was Wenger thinking sending Walcott on that early?',
  text: 'Did you see that ludicrous display last night?',
  html: '',
  bcc: [],
  replyto: '',
  date: new Date(),
  files: [
    {
      filename: '',          // required only if file.content is used.
      contentType: '',       // optional
      path: '',              //
      url: '',               // == One of these three options is required
      content: ('' | Buffer) //
    }
  ],
  file_data: {},
  headers: {}
};

var sendgrid = new SendGrid( user, key );
sendgrid.send( emailOptions, onSendGridHandler );
function onSendGridHandler( success, message ){
	if (!success) {
		console.log(message);
	}	
}