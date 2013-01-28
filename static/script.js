
wz.app.addScript( 4, 'common', function( win, params ){
    
    var video = $('video',win);
    var weevideoTop = $('.weevideo-top',win);
    var weevideoBottom = $('.weevideo-bottom-shadow',win);
    var weevideoCurrentTime = $('.currentTime',win);
    var weevideoTotalTime = $('.totalTime',win);
    var weevideoProgress = $('.weevideo-info-progress',win);
    var weevideoBackprogress = $('.weevideo-info-backprogress',win);
    var weevideoBufferprogress = $('.weevideo-info-buffer',win);
    var weevideoSeeker = $('.weevideo-info-seeker',win);
    var weevideoTitle = $('.weevideo-title-text',win);
    var weevideoSeekerWidth = weevideoSeeker.width()/2;
    
    if( params && params.length ){
        
        wz.structure( params[0], function( error, structure ){
            
            video.append( $('<source></source>').attr('type','video/webm').attr('src', structure.formats.webm.url) );
            video.append( $('<source></source>').attr('type','video/mp4').attr('src', structure.formats.mp4.url) );
            weevideoTitle.text(structure.name).add( weevideoTitle.prev() ).animate({'opacity':'1'},250);
            
        });
        
    }
    
    $( win )
    
        .on('click', '.weevideo-controls-play', function(){
            
            if( win.hasClass('play') ){
                video[0].pause();
            }else{
                video[0].play();
            }
            
        })
        
        .on('click', '.weevideo-volume-icon', function(){
            
            if( win.hasClass('muted') ){
                video[0].muted = false;
            }else{
                video[0].muted = true;
            }
            
        })
        
        .on('click', '.wz-win-maximize', function(){
            
            if( win.hasClass('maximized') ){
                
                if( video[0].cancelFullScreen ){ video[0].cancelFullScreen(); }
                if( video[0].webkitCancelFullScreen ){ video[0].webkitCancelFullScreen(); }
                if( video[0].mozCancelFullScreen ){ video[0].mozCancelFullScreen(); }       
                
            }else{
                
                if( video[0].requestFullScreen ){ video[0].requestFullScreen(); }
                if( video[0].webkitRequestFullScreen ){ video[0].webkitRequestFullScreen(); }
                if( video[0].mozRequestFullScreen ){ video[0].mozRequestFullScreen(); }
                
            }
            
        })
        
        .on('mouseleave', function(){
    
            weevideoTop.stop(true).animate({top:-172},1000);
            weevideoBottom.stop(true).animate({bottom:-138},1000);

        })

        .on('mouseenter', function(){

            weevideoTop.stop(true).animate({top:0},500);
            weevideoBottom.stop(true).animate({bottom:0},500);
            
        })
        
        .on('click', '.weevideo-controls-rewind', function(){
            
            video[0].currentTime -= 10;
            
        })
        
        .on('click', '.weevideo-controls-forward', function(){
            
            video[0].currentTime += 10;
            
        })
		
		.on('enterfullscreen', function(){

            win.addClass('fullscreen');
            
        })
		
		.on('exitfullscreen', function(){
			
			win.removeClass('fullscreen');
            
        })
		
		.on('click', 'video, .weevideo-top-shadow, .weevideo-bottom-shadow', function(){
			
    		if( win.hasClass('play') ){
				video[0].pause();
			}else{
				video[0].play();
			}
			
        })
		
		.on('dblclick', function(){
			
			video[0].play();
    
            if( win.hasClass('fullscreen') ){
				                
                wz.tool.exitFullscreen();     
                
            }else{
                
                if( video[0].requestFullScreen ){ video[0].requestFullScreen(); }
                if( video[0].webkitRequestFullScreen ){ video[0].webkitRequestFullScreen(); }
                if( video[0].mozRequestFullScreen ){ video[0].mozRequestFullScreen(); }
                
            }

        })
        
        .key('space', function(){
        
            if( win.hasClass('play') ){
                video[0].pause();
            }else{
                video[0].play();
            }
			
		})
        
        .key('enter', function(){
        
            if( win.hasClass('fullscreen') ){

                wz.tool.exitFullscreen();
				
            }else{
                
                if( video[0].requestFullScreen ){ video[0].requestFullScreen(); }
                if( video[0].webkitRequestFullScreen ){ video[0].webkitRequestFullScreen(); }
                if( video[0].mozRequestFullScreen ){ video[0].mozRequestFullScreen(); }
                
            }
            
		})
		
		.key(
			'right',
			function(){ video[0].currentTime += 10; },
			function(){ video[0].currentTime += 10; }
		)
		
		.key(
			'left',
			function(){ video[0].currentTime -= 10; },
			function(){ video[0].currentTime -= 10; }
		)
		
		.key(
			'up',
			function(){ 
				if((video[0].volume + 0.1) < 1){
					video[0].volume += 0.1;
				}else{
					video[0].volume = 1;
				}
			},
			function(){ 
				if((video[0].volume + 0.1) < 1){
					video[0].volume += 0.1;
				}else{
					video[0].volume = 1;
				}
			}
		)
		
		.key(
			'down',
			function(){ 
				if((video[0].volume - 0.1) > 0){
					video[0].volume -= 0.1;
				}else{
					video[0].volume = 0;
				}
			},
			function(){ 
				if((video[0].volume - 0.1) > 0){
					video[0].volume -= 0.1;
				}else{
					video[0].volume = 0;
				}
			}
		)
		
		.key(
			'backspace',
			function(){ video[0].currentTime = 0; }
		);            
    
    video
    
        .on('play',function(){
            win.addClass('play');
        })
        
        .on('pause',function(){
            win.removeClass('play');
        })
        
        .on('volumechange', function(){
            
            if( this.muted ){
                win.addClass('muted');
            }else{
                win.removeClass('muted');
            }
            
        })
        
        .on('timeupdate', function(e){
                        
            var time = this.duration;
            var totalHour = parseInt(time/3600);
            var rem     = (time%3600);
            var totalMin = parseInt(rem/60);
                        
            var time = this.currentTime;
            var hour = parseInt(time/3600);
            var rem     = (time%3600);
            var min     = parseInt(rem/60);
            var sec     = parseInt(rem%60);
            
            if(totalHour > 9 && hour < 10){ hour = '0' + hour}    
            if(totalHour > 0 || (totalMin > 10 && min < 10)){ min  = '0' + min }
            if(sec < 10){ sec  = '0'+sec }
                        
            if(totalHour){
                weevideoCurrentTime.text(hour+':'+min+':'+sec);
            }else if(totalMin){
                weevideoCurrentTime.text(min+':'+sec);
            }else{
                weevideoCurrentTime.text('0:'+sec);
            }
            
            var pos = weevideoBackprogress.width()*(this.currentTime/this.duration);

            weevideoProgress.width(pos);

            weevideoSeeker.css('left',pos-weevideoSeekerWidth);
            
        })
        
        .on('durationchange', function(e){
                                                
            var time = this.duration;
            var hour = parseInt(time/3600);
            var rem     = (time%3600);
            var min     = parseInt(rem/60);
            var sec     = parseInt(rem%60);
        
            if(hour > 0 && min < 10){ min  = '0' + min }
            if(sec < 10){ sec  = '0' + sec }
            
            weevideoBackprogress.animate({'opacity':'1'},250);

            if(9 < hour){
                weevideoCurrentTime.animate({'opacity':'1'},250).text('00:00:00');
                weevideoTotalTime.animate({'opacity':'1'},250).text(hour+':'+min+':'+sec);
            }else if(0 < hour && hour < 10){
                weevideoCurrentTime.animate({'opacity':'1'},250).text('0:00:00');
                weevideoTotalTime.animate({'opacity':'1'},250).text(hour+':'+min+':'+sec);
            }else if(9 < min){
                weevideoCurrentTime.animate({'opacity':'1'},250).text('00:00');
                weevideoTotalTime.animate({'opacity':'1'},250).text(min+':'+sec);
            }else{
                weevideoCurrentTime.animate({'opacity':'1'},250).text('0:00');
                weevideoTotalTime.animate({'opacity':'1'},250).text(min+':'+sec);
            }
        
        })
        
        .on('progress',function(){
                        
            try{
                var buffer  = this.buffered.end(0);
            }catch(e){}
            
            var width = (weevideoBackprogress.width()*(buffer/this.duration));
            
            if(width > 0){
                weevideoBufferprogress.animate({width:width},100);
            }
                    
        })
        
        .on('ended', function(){
                        
            var time = this.duration;
            var hour = parseInt(time/3600);
            weevideoProgress.width(0);
            weevideoSeeker.css('left',9);
            
            if(parseInt(hour)){
                weevideoCurrentTime.text('00:00:00');
            }else{
                weevideoCurrentTime.text('00:00');
            }
            
            this.currentTime = 0;
            this.pause();
                        
        });
		 
});
