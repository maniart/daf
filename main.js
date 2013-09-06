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

var app = (function(w, d, undefined) {

	'use strict';
	// private
	var prv = {};
		// constants
		prv.CONST = {};
		prv.CONST.W = w.innerWidth;
		prv.CONST.H = w.innerHeight;
		// vars
		prv.particles = {};
		prv.canvas = d.querySelector('#canvas');
		prv.ctx = prv.canvas.getContext('2d');
		prv.particleCount = 150;
		prv.minDist = 70;
		prv.dist = null;
		prv.counter = 0;
		// functions
		prv.paintCanvas = function() {
			prv.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
			prv.ctx.fillRect(0, 0, 1434, 591);
		};
		prv.Particle = function() {
			this.x 		= 	Math.random() * prv.CONST.W;
			this.y 		= 	Math.random() * prv.CONST.H;
			this.vx		=	-1 + Math.random() * 2;
			this.vy		=	-1 + Math.random() * 2;
			this.radius	=	Math.random() * 4;
			this.draw	=	function() {
				ctx.fillStyle = 'rgba(255, 255, 255, 1)';
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
				ctx.fill();
			};
		};
		prv.createParticles = function() {
			for(prv.counter; prv.counter < particleCount; counter += 1) {
				prv.particles.push(new Particle());
			}
		};
		prv.draw = function() {

		};



	// private
	var init = function() {
		console.log(prv);
	};

	// public
	return {
		init : init
	};

})(window, document, undefined);

window.onload = app.init