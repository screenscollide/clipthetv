/*
* Name: E-mail a friend
* Modified: 12/19/12
* Created by: @chrisaiv
*/
var thisObj     = this
, http          = require("http")
, https         = require("https")
, nodemailer    = require('nodemailer')
, smtpTransport = null
, auth          = { user: "info@quickclip.it", pass: "p@ssword1" }

exports.index = function(req, res, socketCallback){
	thisObj.send( thisObj.buildForm( req.body ), socketCallback );
	res.end()
};

exports.buildForm = function ( data ){
	var options = {
		from:    "Sender Name ✔ <" + data.from + ">",
		to:      data.to,
		subject: data.from + "sent you a QuickClip ✔",
		text:    data.message,
		url:     "www.youtube.com/watch?v=" + data.videoId + "&feature=player_detailpage#t=" + data.time,
		html:    "<b>" + data.message + "</b><br /><a href='#' >Video</a>"
	}
	return options;
}

//Send through gMail
exports.send = function ( options, socketCallback ){
	smtpTransport = nodemailer.createTransport( "SMTP", {
		host: "smtp.gmail.com", 
		secureConnection: true, 
		port: 465, 
		auth: auth
	});

	smtpTransport.sendMail( options, function( err, resp ){
		if(err){
			console.log(err);
		}else{
			try{
				console.log( '/email-success' )
				socketCallback( true );
			}catch( err ){
				console.log( '/email-error' );
				socketCallback( false );
			}
		}
		// shut down the connection pool, no more messages 
		smtpTransport.close(); 
	});
}