/*
* Description: Email
* Modified: 12/19/12
* Created by: @chrisaiv
* Notes: 
* 
*/
function stopEvent( e ){
	e = e || window.event;
	if( e ){
		if( e.preventDefault ) e.preventDefault();
		else e.returnValue = false;
	}
}

$( this ).bind("updateVideoId", updateId );
function updateId( e, id ){
	//Update video id
	if( $("#videoId").length ) $("#videoId").val( id )
}

$( this ).bind("updateCurrentTime", updateTime );
function updateTime( e, values ){
	//console.log( "Email::updateCurrentTime:", values )
	if( $("#startTime") ) $("#startTime").val( values.min );
	if( $("#endTime") )   $("#endTime").val( values.max );
}

$( this ).bind("emailStatus", updateEmailHandler )
function updateEmailHandler( e, success ){	
	console.log( "Email.updateEmailHandler:", success );
	if( $("#message").length && success ) $("#message").html("You're e-mail was successfully sent!");
	//else $("#message").html("Hmmm. Something went wrong. " + message );			
}

$("#message a").bind("click", toggleForm );
function toggleForm( e ){
	var form = $("#email-a-friend");
	//console.log( "Email.toggleForm:", !form.is(":visible") );
	if( form.is( ":visible" ) ) form.hide();
	else form.show();
};

$("#email-a-friend :submit").bind("click", function(e){
	stopEvent( e );
	toggleForm();

	var form = $("#email-a-friend").formSerialize(true);
	var html = $.ajax({
		type: "POST",
		url: "/email-send",
		data: form,
		async: true
	});
})