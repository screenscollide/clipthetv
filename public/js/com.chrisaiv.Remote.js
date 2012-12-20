/*
* Description: Remote
* Modified: 12/17/12
* Created by: @chrisaiv
* Notes: 
* http://ghusse.github.com/jQRangeSlider/stable/demo/
*/
//jQuery Function that helps determin if an object exists
jQuery.fn.exists = function(){return this.length>0;}

var Remote = {
	containerId: "#rangeExample",
	messageId: "p.message",
	videoId: null,
	socket: null,
	currentMin: null,
	currentMax: null,
	initialize: function( ){
		//Get the duration of the video before you display a scrubber
		Remote.socket = io.connect( "/" );
		Remote.socket.on( "onVideoDuration", function( obj ){
			//console.log( "Remote.onVideoDuration", obj );
			//A. If the Video ID changes, change with it
			if( obj.videoId != Remote.videoId  ){
				 Remote.videoId = obj.videoId
				$(window).trigger("updateVideoId", Remote.videoId )
			}
			//B. Set the Start Time
			Remote.setCurrentTime( Math.floor( obj.currentTime )  );
			//C. Set the End Time
			Remote.setDuration( Math.floor( obj.duration ) );
			//D. If the user is logging on for the first time, present the range
			if(  $( Remote.containerId ).exists() && !Remote.currentMax ){
				//1. Set the start and end times
				Remote.currentMin = 0;
				Remote.currentMax = getDuration();
				
				var obj = { min: Remote.currentMin, max: Remote.currentMax }
				Remote.init( obj );
				//2. Update e-mail a friend
				$(window).trigger("updateCurrentTime", { min: obj.min, max: obj.max } )
			}
		});
		Remote.socket.on( "onVideoPlaying", function( obj ){
			console.log( "From TV::onVideoPlaying" );
		});

		Remote.socket.on( "onVideoPaused", function( obj ){
			console.log( "From TV::onVideoPaused" );
		});

		Remote.socket.on( "emailStatus", function( success ) {
			console.log("Remote.emailStatus", success );
			$(window).trigger("emailStatus", success )
		});
		
	},
	init: function( obj ){
		$( Remote.containerId ).rangeSlider({
			arrows:false,
			range: false,
			defaultValues: { min: 0, max: obj.max },
			bounds: { max: obj.max }
		});	
		
		$( Remote.containerId ).bind( "valuesChanged", function(e, data ){
			//console.log("valuesChanged", "min: " + data.values.min + " max: " + data.values.max );
		});

		// This event will not ne fired
		$( Remote.containerId ).bind( "userValuesChanged", function(e, data ){
			//console.log("userValuesChanged", data.values.min, data.values.max );
			var min = Math.floor( data.values.min );	
			var max = Math.floor( data.values.max );
			//Min was stationary
			if( min == Remote.currentMin ){
				Remote.currentMax = max;
				Remote.setVideoUpdate( max );
				//console.log( "Max was Moved", max );
				Remote.updateMessage( "Adjusting the end of the clip" )
			}
			//Max was stationary
			else if( max == Remote.currentMax ){
				Remote.currentMin = min;
				Remote.setVideoUpdate( min )
				//console.log( "Min was Moved", min );
				Remote.updateMessage( "Adjusting the beginning of the clip" )
			}
			//Bridge was moved
			else{
				Remote.currentMax = max;
				Remote.currentMin = min;
				Remote.updateMessage( "Adjusting both the head and the tail" )
			}
			//Update E-mail a friend
			$(window).trigger("updateCurrentTime", { min: min, max: max } )
		});		
	},
	updateMessage: function ( text ){
		$( Remote.messageId ).html( text );
	},
	loadVideo: function ( id ){
		Remote.socket.emit( "videoload", id );
	},
	destroy: function (){
		$( Remote.containerId ).rangeSlider("destroy");
	},
	resize: function(){
		$( Remote.containerId ).rangeSlider('resize');
	},
	setVideoUpdate: function ( currentTime ){
		console.log( "Remote.setVideoUpdate:", currentTime );
		Remote.socket.emit( "videoupdate", currentTime );
	},
	setCurrentTime: function ( time ){
		var currentTime = time;
		getCurrentTime = function() {
			return currentTime;
		}	
	},
	setDuration: function ( time ){
		var duration = time;
		getDuration = function() {
			return duration;
		}	
	}
}

Remote.initialize();
//Make the scrub tool responsive
$(window).bind( "resize", Remote.resize );

