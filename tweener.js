(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["unicycle"], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(true);
    } else {
    	window.unicycle = factory();
    }
}(this, function(unicycle){
	var tweener;

	unicycle = new unicycle();
	unicycle.start();

	/*
	 * Easing Functions - inspired from http://gizma.com/easing/
	 * only considering the t value for the range [0, 1] => [0, 1]
	 */
	EasingFunctions = {
	  // no easing, no acceleration
	  linear: function (t) { return t },
	  // accelerating from zero velocity
	  easeInQuad: function (t) { return t*t },
	  // decelerating to zero velocity
	  easeOutQuad: function (t) { return t*(2-t) },
	  // acceleration until halfway, then deceleration
	  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
	  // accelerating from zero velocity 
	  easeInCubic: function (t) { return t*t*t },
	  // decelerating to zero velocity 
	  easeOutCubic: function (t) { return (--t)*t*t+1 },
	  // acceleration until halfway, then deceleration 
	  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
	  // accelerating from zero velocity 
	  easeInQuart: function (t) { return t*t*t*t },
	  // decelerating to zero velocity 
	  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
	  // acceleration until halfway, then deceleration
	  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
	  // accelerating from zero velocity
	  easeInQuint: function (t) { return t*t*t*t*t },
	  // decelerating to zero velocity
	  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
	  // acceleration until halfway, then deceleration 
	  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
	}

	var Tween = function(tweener, target, duration, to, from){
		this.tweener = tweener;
		this.tick = this.tick.bind(this);
		this.setup(target, duration, to, from);
	};

	Tween.prototype = {
		EasingFunctions : EasingFunctions,
		setup : function(target, duration, to, from){
			this.started = false;
			this.paused = true;
			this.repeatCount = 0;
			this.yoyoPhase = false;

			this.target = target;
			this.duration = duration * 1000;
			this.to = to;
			this.from = from || this.getFromObject(target, this.to);
			this.current = this.cloneObject(this.from);

			this.onUpdate = to.onUpdate || null;
			this.onStart = to.onStart || null;
			this.onComplete = to.onComplete || null;
			this.onRepeat = to.onRepeat || null;

			if (this.to.paused != true){
				this.restart();
			}

			return this;
		},
		restart : function(){
			if (this.removeTask){
				this.removeTask();
			}

			this.current = this.cloneObject(this.from);
			this.started = false;
			this.paused = false;
			this.pauseProgress = 0;
			this.resume(true);
		},
		pause : function(){
			if (this.paused){
				return;
			}

			this.paused = true;
			this.started = false;
			this.removeTask();
			this.pauseProgress = this.progress;
		},
		resume : function(restart){
			if (this.started){
				return;
			}

			this.startDate = (+new Date() - this.duration * (this.pauseProgress || 0)) + (restart ? ((this.to.delay || 0) * 1000) : 0);
			this.removeTask = unicycle.addTask(this.tick);
			this.paused = false;
		},
		get progress(){
			var progress = (+new Date() - this.startDate) / this.duration;
			if (progress < 0) progress = 0;
			if (progress > 1) progress = 1;
			return progress;
		},
		set progress(value){
			this.startDate = (+new Date() - this.duration * value);
		},
		getFromObject : function(target, to){
			var result = {};

			for (var k in to){
				if (!isNaN(Number(target[k]))){
					result[k] = target[k];
				} else if (typeof to[k] != "function" && typeof target[k] != "boolean") {
					result[k] = 0;
				}
			}

			return result;

		},
		cloneObject : function(obj){
			var result = {};

			for (var k in obj){
				result[k] = obj[k];
			}

			return result;

		},
		calcValue : function(from, to, progress){
			var progress = progress;
			if (this.to.ease && EasingFunctions[this.to.ease]) progress = EasingFunctions[this.to.ease](progress);
			var value = (from + ((to - from) * progress));
			return value; 
		},
		updateCurrent : function(){
			var progress = this.progress;
			var yoyo = this.yoyoPhase;

			for (var k in this.current){
				this.current[k] = yoyo ? this.calcValue(this.to[k], this.from[k], progress) : this.calcValue(this.from[k], this.to[k], progress);
			}
		},
		applyValues : function(target, values){
			for (var k in values){
				target[k] = values[k];
			}
		},
		tick : function(delta){
			if (!this.started){
				this.started = true;
				if (this.onStart) this.onStart(this);
			}


			this.updateCurrent();
			this.applyValues(this.target, this.current);

			if (this.onUpdate) this.onUpdate(this);

			if (this.progress >= 1){
				var expire = true;

				this.repeatCount++;

				if (typeof this.to.repeat == "number"){
					if (this.to.repeat < 0 || this.repeatCount < this.to.repeat){
						expire = false;
					}
				}

				if (expire){
					this.removeTask();
					delete this.removeTask();
					if (this.onComplete) this.onComplete(this);
					if (this.to.save !== true){
						this.kill();
					}
				} else {
					if (this.to.yoyo) this.yoyoPhase = !this.yoyoPhase;
					this.progress = 0;
					if (this.onRepeat) this.onRepeat(this);
				}	
			}
		},
		kill : function(){
			if (this.removeTask) this.removeTask();
			this.tweener.pool.add(this);
		}
	};

	var Tweener = function(newInstance){
		if (newInstance !== true && tweener instanceof Tweener){
			return tweener;
		}
	};

	Tweener.prototype = {
		Tween : Tween,
		EasingFunctions : EasingFunctions,
		pool : {
			content : [],
			add : function(tween){
				this.content.push(tween);
			},
			get : function(){
				return this.content.pop();
			}
		},
		to : function(target, duration, to){
			var tween = this.pool.get();
			if (tween){
				return tween.setup(target, duration, to);
			} else {
				return new Tween(this, target, duration, to);
			}
		},
		fromTo : function(target, duration, from, to){
			var tween = this.pool.get();
			if (tween){
				return tween.setup(target, duration, from, to);
			} else {
				return new Tween(this, target, duration, to, from);
			}
		}
	};

	var tweener = new Tweener();
    return tweener;
}));