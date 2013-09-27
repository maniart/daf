// request animation fram shim by Payl Irish
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})();

// app module
var app = (function (w, d, undefined) {

	'use strict';
	
	// cache dom elements
	var dom = {};
	dom.body = d.querySelector('body');
	dom.webcam = d.querySelector('#webcam')
	dom.diffImage = d.querySelector('#diff-image');
	dom.normalImage = d.querySelector('#normal-image');
	dom.interactive = d.querySelector('#canvas');

	var normalImageCtx = dom.normalImage.getContext('2d'), // getting canvas context 
	diffImageCtx = dom.diffImage.getContext('2d'), // getting canvas context
	timeOut,
	lastImageData,
	c = 5; 
	
	// setup dimensions
	function setupDimensions() {
		dom.body.style.width = w.innerWidth + 'px';
		dom.body.style.height = w.innerHeight + 'px';
	};
	
	// mirror video input
	function mirrorVideo() {
		normalImageCtx.translate(dom.normalImage.width, 0);
		normalImageCtx.scale(-1, 1);
	};
	
	// webcam error report
	function webcamError(e) {
		alert('Webcam error!', e);
	};
	
	// init capture
	function initCapture() {
		if (navigator.getUserMedia) {
			navigator.getUserMedia({audio: false, video: true}, function(stream) {
				dom.webcam.src = stream;
			}, webcamError);
		} else if (navigator.webkitGetUserMedia) {
			navigator.webkitGetUserMedia({audio:false, video:true}, function(stream) {
				dom.webcam.src = window.webkitURL.createObjectURL(stream);
			}, webcamError);
		} else {
			//video.src = 'somevideo.webm'; // fallback.
		}
	};
	
	// draw the contents of video capture into a canvas#normal-image
	function drawVideo() {
		normalImageCtx.drawImage(dom.webcam, 0, 0, dom.webcam.width, dom.webcam.height);
	};

	function blend() {
		var width = dom.normalImage.width,
			height = dom.normalImage.height,
		// get webcam image data
			sourceData = normalImageCtx.getImageData(0, 0, width, height);
		// create an image if the previous image doesnâ€™t exist
		if (!lastImageData) lastImageData = normalImageCtx.getImageData(0, 0, width, height);
		// create a ImageData instance to receive the blended result
		var blendedData = normalImageCtx.createImageData(width, height);
		// blend the 2 images
		differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
		// draw the result in a canvas
		diffImageCtx.putImageData(blendedData, 0, 0);
		// store the current webcam image
		lastImageData = sourceData;
	};

	function fastAbs(value) {
		// funky bitwise, equal Math.abs
		return (value ^ (value >> 31)) - (value >> 31);
	};

	function threshold(value) {
		return (value > 0x15) ? 0xFF : 0;
	};

	function difference(target, data1, data2) {
		// blend mode difference
		if (data1.length != data2.length) return null;
		var i = 0;
		while (i < (data1.length * 0.25)) {
			target[4*i] = data1[4*i] == 0 ? 0 : fastAbs(data1[4*i] - data2[4*i]);
			target[4*i+1] = data1[4*i+1] == 0 ? 0 : fastAbs(data1[4*i+1] - data2[4*i+1]);
			target[4*i+2] = data1[4*i+2] == 0 ? 0 : fastAbs(data1[4*i+2] - data2[4*i+2]);
			target[4*i+3] = 0xFF;
			++i;
		}
	};

	function differenceAccuracy(target, data1, data2) {
		if (data1.length != data2.length) return null;
		var i = 0;
		while (i < (data1.length * 0.25)) {
			var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 2.5;
			var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 2.5;
			var diff = threshold(fastAbs(average1 - average2));
			target[4*i] = diff;
			target[4*i+1] = diff;
			target[4*i+2] = diff;
			target[4*i+3] = 0xFF;
			++i;
		}
	};

	// are we hitting the designated areas?
	function checkAreas() {
		// loop over the note areas
		for (var r=0; r<8; ++r) {
			var blendedData = contextBlended.getImageData(1/8*r*video.width, 0, video.width/8, 100);
			var i = 0;
			var average = 0;
			// loop over the pixels
			while (i < (blendedData.data.length * 0.25)) {
				// make an average between the color channel
				average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
				++i;
			}
			// calculate an average between of the color values of the note area
			average = Math.round(average / (blendedData.data.length * 0.25));
			if (average > 10) {
				// over a small limit, consider that a movement is detected
				// play a note and show a visual feedback to the user
				playSound(notes[r]);
//				notes[r].visual.show();
//				notes[r].visual.fadeOut();
				if(!notes[r].visual.is(':animated')) {
					notes[r].visual.css({opacity:1});
					notes[r].visual.animate({opacity:0}, 700);
				}

			}
		}
	};

	// update function - calling itself 60fps
	function update() {
		drawVideo();
		blend();
		//checkAreas();
		//console.log('upadting');
		requestAnimFrame(update);
	};

	// init method, jumpstarting the whole module 
	function init() {
		console.log('app init');
		setupDimensions();
		mirrorVideo();
		initCapture();
		update();
	}; 

	// public api
	return {
		init : init
	};

})(window, document, undefined);

window.onload = app.init;