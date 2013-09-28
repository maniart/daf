var app = (function(w, d) {

	'use strict';
	
		// cache dom elements
	var DOM = {};
		DOM.body = d.querySelector('body');
		DOM.webcam = d.querySelector('#webcam');
		DOM.canvas = d.querySelector('#canvas');
		DOM.normalImage = d.querySelector('#normal-image');
		DOM.diffImage = d.querySelector('#diff-image');
		DOM.toggleNormalImage = d.querySelector('.toggle-normal-image');

		// contexts, diff-image related vars
	var canvasCtx = DOM.canvas.getContext('2d'),
		normalImageCtx = DOM.normalImage.getContext('2d'),  
		diffImageCtx = DOM.diffImage.getContext('2d'), 
		
		timeOut,
		lastImageData,
		c = 5,
	
		// CONST
		W = w.innerWidth,
		H = w.innerHeight,
		
		// Particle System vars
		particles = [],	
		dist,

		// Image and Typography related vars
		typeSources = {
    		agar: 'img/agar.png',
    		ke: 'img/ke.png',
    		bihodeh: 'img/bihodeh.png',
    		zibast: 'img/zibast.png',
    		shab: 'img/shab.png'
    	},
    	images = {},

		// Dat gui controlled arguments
		args = {
			radius : .1,
			minDist : 100,
			blur : 3,
			lineWidth : .2,
			gitAddress : 'https://github.com/maniart/lab/tree/master/particles-1',
			opacity: .2,
			isColor : false,
			colors: [
				[0, 181, 100], [51, 163, 189], [190, 204, 59]
			],
			setColor: function() {
				return this.isColor ? setOpacity(randomize(this.colors), args.opacity) : setOpacity([255, 255, 255], args.opacity);
			},
			toggleColor: function() {
				this.isColor = !this.isColor;	
			},
			gitHub: function() {
				w.location = this.gitAddress;
			}
		},
		
		// Misc variables
		isNormalImageHidden = false,

		// Particle constructor
		Particle = function(args) {
			this.x = Math.random() * W;
			this.y = Math.random() * H;
			this.vx = -1 + Math.random() * 2;
			this.vy = -1 + Math.random() * 2;
			this.radius = args.radius;
		};

	
	// Setting up the stage
	DOM.canvas.width = W;
	DOM.canvas.height = H;
	canvasCtx.fillStyle = 'rgba(0,0,0,1)';
	canvasCtx.fillRect(0, 0, W, H);
	
	// Shared method : draw
	Particle.prototype.draw = function() {
		canvasCtx.fillStyle = args.setColor();
		canvasCtx.beginPath();
		canvasCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		canvasCtx.fill();
	};

	// Utility function: return random from an array
	function randomize(arr) {
		var len = arr.length,
			idx = Math.floor(Math.random() * len);
		//console.log(arr);
		return arr[idx];
	};

	// Utility function: set opacity of a color	
	function setOpacity(rgb, opacity) {
		var r = rgb[0],
			g = rgb[1],
			b = rgb[2],
			color;
		color = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
		//console.log(rgb);
		return color; 
	};

	// Utility function: get distance between two points
	function distance(p1, p2) {
		var dx = p1.x - p2.x,
			dy = p1.y - p2.y;
		dist = Math.sqrt(dx * dx + dy * dy);
		if (dist <= args.minDist) {
			canvasCtx.beginPath();
			canvasCtx.strokeStyle = args.setColor();
			canvasCtx.lineWidth = args.lineWidth;
			canvasCtx.moveTo(p1.x, p1.y);
			canvasCtx.lineTo(p2.x, p2.y);
			canvasCtx.stroke();
			
			canvasCtx.closePath();
			var ax = dx / (args.minDist * 20),
				ay = dy / (args.minDist * 20);
			p1.vx -= (args.minDist / Math.pow(100,2)) * ax;
			p1.vy -= (args.minDist / Math.pow(100,2)) * ay;	
			p2.vx += (args.minDist / Math.pow(100,2)) * ax;
			p2.vy += (args.minDist / Math.pow(100,2)) * ay;
		}	
	};

	// Utility function: clear the screen
	function clear() {
		canvasCtx.fillStyle = "rgba(0, 0, 0,"+ 1/args.blur +")";
		canvasCtx.fillRect(0, 0, W, H);
	};

	// Create the particle system and setup DAT gui
	function setup(args) {
		for (var i = 200; i >= 0; i--) {
			var p = new Particle(args);
			particles.push(p);
		};
		setupDatGui();
	};

	// Stay within the bounds of browser window
	function avoidEdges(particle) {
		if (particle.x > W) {
				particle.vx *= -1; 
		} else if (particle.x < 0) {
			particle.vx *= -1;
		}
		if (particle.y > H) {
			particle.vy *= -1; 
		} else if (particle.y < 0) {
			particle.vy *= -1;
		}
	};

	// Update the state of particle system
	function update() {
		var particle1,
			particle2;
		
		for (var i = 0; i < particles.length; i ++) {
			particle1 = particles[i]; 
			particle1.radius = args.radius;
			particle1.x += particle1.vx;
			particle1.y += particle1.vy;

			avoidEdges(particle1);

			for(var j = i + 1; j < particles.length; j++) {
				particle2 = particles[j];
				distance(particle1, particle2);
			}
		}
	};

	// Draw the particle system
	function draw() {
		clear();
		for (var i = particles.length - 1; i >= 0; i --) {
			particles[i].draw();
			//canvasCtx.drawImage(images.agar, particles[0].x, particles[0].y, 25, 21);
			//canvasCtx.drawImage(images.ke, particles[1].x, particles[1].y, 39, 29);
			//canvasCtx.drawImage(images.bihodeh, particles[2].x, particles[2].y, 64, 41);
			canvasCtx.drawImage(images.zibast, 1/8*3*DOM.canvas.width, 1/8*3*DOM.canvas.height, 102, 41);
			//canvasCtx.drawImage(images.shab, particles[4].x, particles[4].y, 61, 35);
		};
		update();	
	};

	// Loop function
	function loop() {
		draw();
		//drawAreasToBeChecked();
		drawVideo();
		blend();
		checkAreas();
		requestAnimFrame(loop);
	};

	// Setup Dat Gui
	function setupDatGui() {
	    var gui = new dat.GUI();
	    gui.remember(args);
	    gui.add(args, 'radius', 0, 5).step(.1);
	    gui.add(args, 'minDist', 100, 200).step(1);
		gui.add(args, 'lineWidth', .1, 2).step(.1);
		gui.add(args, 'blur', 1, 100).step(1);
		gui.add(args, 'opacity', 0, 1).step(.1);
		gui.add(args, 'toggleColor');
		gui.add(args, 'gitHub');
	};

	// Initialize everything
	function init() {
		setup(args);
		mirrorVideo();
		loadImages(typeSources, function(images) {
    		canvasCtx.drawImage(images.agar, -100, -100, 50, 42);
    		canvasCtx.drawImage(images.ke, -100, -100, 39, 29);
    		canvasCtx.drawImage(images.bihodeh, -100, -100, 64, 41);
    		canvasCtx.drawImage(images.zibast, -100, -100, 102, 41);
    		canvasCtx.drawImage(images.shab, -100, -100, 61, 35);
    	});
		attachEvents();
		initCapture();
		loop();
	};

	/* BEGIN image processing stuff */

	// mirror video input
	function mirrorVideo() {
		normalImageCtx.translate(DOM.normalImage.width, 0);
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
				DOM.webcam.src = stream;
			}, webcamError);
		} else if (navigator.webkitGetUserMedia) {
			navigator.webkitGetUserMedia({audio:false, video:true}, function(stream) {
				DOM.webcam.src = window.webkitURL.createObjectURL(stream);
			}, webcamError);
		} else {
			//video.src = 'somevideo.webm'; // fallback.
		}
	};
	
	// draw the contents of video capture into a canvas#normal-image
	function drawVideo() {
		normalImageCtx.drawImage(DOM.webcam, 0, 0, DOM.webcam.width, DOM.webcam.height);
	};

	function blend() {
		var width = DOM.normalImage.width,
			height = DOM.normalImage.height,
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

	function drawAreasToBeChecked() {	
		for (var r=0; r<8; ++r) {
			canvasCtx.fillRect(1/8*3*canvas.width, 1/8*3*webcam.height, canvas.width/8, 1/8*webcam.height);	
			canvasCtx.fill();
		}
	};

	// are we hitting the designated areas?
	function checkAreas() {
		// loop over the note areas
		for (var r=0; r<8; ++r) {
			//var blendedData = diffImageCtx.getImageData(1/8*r*webcam.width, 1/8*r*webcam.height, webcam.width/8, 1/8*webcam.height);
			var blendedData = diffImageCtx.getImageData(1/8*3*webcam.width, 1/8*3*webcam.height, webcam.width/8, 1/8*webcam.height);
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
				//playSound(notes[r]);
//				notes[r].visual.show();
//				notes[r].visual.fadeOut();
				//if(!notes[r].visual.is(':animated')) {
				//	notes[r].visual.css({opacity:1});
				//	notes[r].visual.animate({opacity:0}, 700);
				//}
				console.log('hit');
			}
		}
	}
	

	// RequestAnimFrame: a browser API for getting smooth animations
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

	// Utility function: load images
	function loadImages(sources, callback) {
        var loadedImages = 0,
        	numImages = 0;
        // get num of sources
        for(var src in typeSources) {
			numImages++;
        }
        for(var src in typeSources) {
        	images[src] = new Image();
        	images[src].onload = function() {
        		if(++loadedImages >= numImages) {
        			callback(images);
        		}
        	};
        	images[src].src = sources[src];
			//console.log(images);
		}
    };
     

	// Attach misc events
	function attachEvents() {
		DOM.toggleNormalImage.addEventListener('click', function() {
			DOM.normalImage.style.opacity = isNormalImageHidden ? 1 : 0;
			isNormalImageHidden = !isNormalImageHidden;
		});
	};

	// Mouse events
	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x : evt.clientX - rect.left,
			y : evt.clientY - rect.top
		};
	};
	function updatePos() {
		canvas.addEventListener('mousemove', function(evt) {
			var mousePos = getMousePos(canvas, evt);
			
			console.log();
			emitters[0].position = mousePos;
			fields[0].position.x = mousePos.x - diff.x;
			fields[0].position.y = mousePos.y;
			fields[1].position.x = mousePos.x + diff.x;
			fields[1].position.y = mousePos.y;
			//fields[0].position.y = mousePos.y - 100;

			
		});
	};

	// Module API
	return {
		init : init
	};

})(window, document);

// Initialize app on window load
window.onload = app.init;
