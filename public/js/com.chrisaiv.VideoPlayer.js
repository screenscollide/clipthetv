/*
* Description: TV
* Modified: 12/19/12
* Created by: @chrisaiv
* Notes: 
* https://developers.google.com/youtube/js_api_reference
*/

var VideoPlayer = {
	defaultVideoId: "4fSdfAR5Qb4",
	defaultQuality: "hd720",
	divId:          "videoDiv",
	swfId:          "ytPlayer",
	defaultInterval:  5000,
	defaultVolume:  0,
	duration:       null,
	ytplayer:       null,
	socket:         null,

	initialize: function( ){
		VideoPlayer.initVideo();
		VideoPlayer.initScreenPairing();
	},
	initVideo: function(){
		var size = VideoPlayer.getBrowserDimensions( )
		// Lets Flash from another domain call JavaScript
		var params = { allowScriptAccess: "always" };
		// The element id of the Flash embed
		var atts = { id: VideoPlayer.swfId };

		swfobject.embedSWF(
			"http://www.youtube.com/apiplayer?" +
			"version=3&enablejsapi=1&playerapiid=player1&fs=1",
			VideoPlayer.divId, size.width, size.height, "9", null, null, params, atts
		);
	},
	/*
	* Listen to the events coming from Remote and YouTube
	*/
	initScreenPairing: function(){
		VideoPlayer.socket = io.connect( "/" );
		VideoPlayer.socket.on( "onVideoLoad",   VideoPlayer.loadVideo );
		VideoPlayer.socket.on( "onVideoUpdate", VideoPlayer.updateVideo );
		VideoPlayer.socket.on( "onVideoVolume", VideoPlayer.setVideoVolume );
		VideoPlayer.socket.on( "onVideoPlay",   VideoPlayer.playVideo );
		VideoPlayer.socket.on( "onVideoPause",  VideoPlayer.pauseVideo );
		VideoPlayer.socket.on( "onVideoMute",   VideoPlayer.muteVideo );
		VideoPlayer.socket.on( "onVideoUnmute", VideoPlayer.unMuteVideo );
	},
	/*
	* Send events to Remote
	*/
	socketIoSend: function ( event, params ){
		VideoPlayer.socket.emit( event, params, function( data ){
			
		}); 
	},
	// VideoPlayer function is automatically called by the player once it loads
	onYouTubePlayerReady: function ( id ) {
		VideoPlayer.ytplayer = document.getElementById( VideoPlayer.swfId );
		console.log( "VideoPlayer::onYouTubePlayerReady" )
		// VideoPlayer causes the updatePlayerInfo function to be called every (x)ms to get fresh data from the player
		VideoPlayer.startTimer( VideoPlayer.updatePlayerInfo, VideoPlayer.defaultInterval );
		VideoPlayer.updatePlayerInfo();
		VideoPlayer.ytplayer.addEventListener( "onStateChange", "VideoPlayer.onPlayerStateChange" );
		VideoPlayer.ytplayer.addEventListener( "onError", "VideoPlayer.error" );

		//Load an initial video into the player
		var videoId = ( id.length > 0 && id != "player1" ) ? id : VideoPlayer.defaultVideoId;
		VideoPlayer.ytplayer.loadVideoById( videoId );
		VideoPlayer.ytplayer.setVolume( VideoPlayer.defaultVolume );
		VideoPlayer.ytplayer.setPlaybackQuality( VideoPlayer.defaultQuality )
	},
	// Display information about the current state of the player. This is ALWAYS FIRING OFF (NOT EFFICIENT BUT WHATEVES)
	updatePlayerInfo: function () {
		// Also check that at least one function exists since when IE unloads the
		// page, it will destroy the SWF before clearing the interval.
		if( VideoPlayer.ytplayer && VideoPlayer.getDuration() ) {
			if( VideoPlayer.getDuration() ){
				//Announce that YouTube Video ID is ready
				VideoPlayer.socketIoSend( "videoduration", { 
					videoId: VideoPlayer.getParameterByName( VideoPlayer.getVideoURL(), "v" ),
					currentTime: VideoPlayer.getCurrentTime(), 
					duration: VideoPlayer.getDuration()
				});

				VideoPlayer.stopTimer();
			}
		}
	},
	onPlayerStateChange: function (newState) {
		//console.log( "TV::onPlayerStateChange:", newState );
		switch( newState ){
			//Unstarted
			case -1:
			break;
			//Ended
			case 0:
			break;
			//Playing
			case 1:
				VideoPlayer.socketIoSend( "videoplaying" );
			break;
			//Paused
			case 2:
				VideoPlayer.socketIoSend( "videopaused" );
			break;
			//Buffering
			case 3:
			break;
			//Video Cued
			case 5:
			break;
			default:
			break;
		}
	},
	/*
	* Video controls
	* https://developers.google.com/youtube/js_api_reference#Functions
	*/
	loadVideo: function ( id, start ){
		if( !VideoPlayer.ytplayer ) VideoPlayer.ytplayer.loadVideoById( id, 0 );
	},

	updateVideo: function ( currentTime ){
		if( VideoPlayer.ytplayer ) VideoPlayer.ytplayer.seekTo( currentTime );
	},

	setVideoVolume: function ( vol ) {
		// Allow the user to set the volume from 0-100
		if( VideoPlayer.ytplayer ) VideoPlayer.ytplayer.setVolume( vol );
	},

	playVideo: function () {
		if ( VideoPlayer.ytplayer ) VideoPlayer.ytplayer.playVideo();
	},

	pauseVideo: function () {
		if ( VideoPlayer.ytplayer ) VideoPlayer.ytplayer.pauseVideo();
	},

	muteVideo: function () {
		if( VideoPlayer.ytplayer ) VideoPlayer.ytplayer.mute();
	},

	unMuteVideo: function () {
		if( VideoPlayer.ytplayer ) VideoPlayer.ytplayer.unMute();
	},	
	resize: function( ){
		var size = VideoPlayer.getBrowserDimensions( )
		console.log( "A" );
		if( VideoPlayer.ytplayer ){
			console.log( "B", size.width, size.height );
			ytPlayer.width  = size.width;
			ytPlayer.height = size.height;
		}
	},
	/*
	Getters
	*/
	getVideoURL: function(){
		if( VideoPlayer.ytplayer ) return VideoPlayer.ytplayer.getVideoUrl();
	},
	getCurrentTime: function (){
		if( VideoPlayer.ytplayer ) return VideoPlayer.ytplayer.getCurrentTime();
	},

	getDuration: function (){
		if( VideoPlayer.ytplayer ) return VideoPlayer.ytplayer.getDuration();
	},

	getBrowserDimensions: function ( ){
	    console.log( "VideoPlayer::getBrowserDimensions:" );
	    //Make sure jQuery and window object are ready to roll
	    if( $(window) ){
			var width  = $(window).width();
			var height = $(window).height();
			var w, h = 0;
			//1080p: 1920x1080
			if( width >= 1920 && height >= 1080 ) w = 1920, h = 1080;
			//720p: 1280x720
			else if( width >= 1280 && height >= 720 )  w = 1280, h = 720; 
			//480p: 854x480
			else if( width >= 854 && height >=  480 )  w = 854,  h = 480;
			//360p: 640x360
			else if( width >= 640 && height >=  360 )  w = 640,  h = 360;
			//240p: 426x240
			else  w = 426,  h = 240;
			return { width: w, height: h }	    	
	    }
	},
	/*
	* Timer
	* The reason I don't end up killing the interval is because if the remote control
	* goes offline - online, you want to make sure it's a speedy connection. Plus, thinking
	* about multiple devices logging together, it's easier to have one broadcaster always
	* spitting timecode than trying to manage 2+ devices and what data they need.
	*/
	stopTimer: function (){
		//clearInterval( VideoPlayer.interval );
	},
	startTimer: function ( func, millisecs ){
		VideoPlayer.interval = setInterval( func, millisecs )
	},
	/*
	* Errors
	*/
	error: function( err ){
		console.log( "VideoPlayer::error:", err );
	},
	/*
	* Helper
	*/
	getParameterByName: function ( path, name)
	{
	  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	  var regexS = "[\\?&]" + name + "=([^&#]*)";
	  var regex = new RegExp(regexS);
	  var results = regex.exec(path);
	  if(results == null)
	    return "";
	  else
	    return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}

/*
* Catch VideoPlayer from YouTube
*/
function onYouTubePlayerReady( id ){
	VideoPlayer.onYouTubePlayerReady( id )
}

$(window).bind( "resize", VideoPlayer.resize );