var app = (function(w, d) {

	'use strict';
	
		// cache dom elements
	var DOM = {};
		DOM.body = d.querySelector('body');
		DOM.webcam = d.querySelector('#webcam');
		DOM.canvas = d.querySelector('#canvas');
		DOM.normalImage = d.querySelector('#normal-image');
		DOM.diffImage = d.querySelector('#diff-image');

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

		// Dat gui controlled arguments
		args = {
			radius : 1,
			minDist : 100,
			blur : 3,
			lineWidth : 1,
			gitAddress : 'https://github.com/maniart/lab/tree/master/particles-1',
			opacity: .2,
			isColor : false,
			colors: [
				[0, 181, 100], [51, 163, 189], [190, 204, 59]
			],
			setColor: function() {
				return this.isColor ? setOpacity(randomize(this.colors), args.opacity) : setOpacity([0, 0, 0], args.opacity);
			},
			toggleColor: function() {
				this.isColor = !this.isColor;	
			},
			gitHub: function() {
				w.location = this.gitAddress;
			}
		},
		
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
	canvasCtx.fillStyle = 'rgba(255,255,255,1)';
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
		canvasCtx.fillStyle = "rgba(255,255,255,"+ 1/args.blur +")";
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
		};
		update();	
	};

	// Loop function
	function loop() {
		draw();
		requestAnimFrame(loop);
	};

	// Setup Dat Gui
	function setupDatGui() {
	    var gui = new dat.GUI();
	    gui.remember(args);
	    gui.add(args, 'radius', 0, 10).step(1);
	    gui.add(args, 'minDist', 100, 200).step(1);
		gui.add(args, 'lineWidth', 1, 5).step(1);
		gui.add(args, 'blur', 1, 100).step(1);
		gui.add(args, 'opacity', 0, 1).step(.1);
		gui.add(args, 'toggleColor');
		gui.add(args, 'gitHub');
	};

	// Initialize everything
	function init() {
		setup(args);
		loop();
	};

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

	// Module API
	return {
		init : init
	};

})(window, document);

// Initialize app on window load
window.onload = app.init;
