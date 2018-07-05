(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["unicycle"], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(true);
    } else {
    	window.unicycle = factory();
    }
}(this, function(unicycle){
	"use strict";

	var tweener;

	unicycle = new unicycle();
	unicycle.start();

	window.unicycle = unicycle;

	/*
	 * Easing Functions - inspired from http://gizma.com/easing/
	 * only considering the t value for the range [0, 1] => [0, 1]
	 */
	var easingFunctions = {
	  linear: function (t) { return t },
	  easeInQuad: function (t) { return t*t },
	  easeOutQuad: function (t) { return t*(2-t) },
	  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
	  easeInCubic: function (t) { return t*t*t },
	  easeOutCubic: function (t) { return (--t)*t*t+1 },
	  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
	  easeInQuart: function (t) { return t*t*t*t },
	  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
	  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
	  easeInQuint: function (t) { return t*t*t*t*t },
	  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
	  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
	  easeInBack : function(t){ return t * t * ((2.5 + 1) * t - 2.5) },
	  easeOutBack : function(t){ return --t * t * ((2.5 + 1) * t + 2.5) + 1 },
	  easeInOutBack : function(t){ return ((t *= 2) < 1 ? t * t * ((2.5 + 1) * t - 2.5) : (t -= 2) * t * ((2.5 + 1) * t + 2.5) + 2) / 2; }
	}

	var TweensList = function(){
		this._content = {};
	};

	TweensList.prototype = {
		iterate : function(callback, context){
			for (var k in this._content){
				callback.call(context, this._content[k], k);
			}

			return this;
		},
		add : function(name, tween){
			this._content[name] = tween;
			return this;
		},
		contains : function(name){
			return this._content[name] && this._content[name] instanceof Tween;
		},
		remove : function(name){
			delete this._content[name];
		},
		kill : function(name){
			if (this._content[name]) {
				this._content[name].kill("tweenslist-single");
			}
		},
		killAll : function(){
			this.iterate(function(tween){
				tween.kill("tweenslist-all");
			}, this);
		}
	};



	var Tween = function(tweener, target, duration, to, from, presetCallbacks){
		this.tweener = tweener;
		this.tweener.tweensCreated++;

		this.tick = this.tick.bind(this);

		this._from = {};
		this._to = {};
		this._current = {};
		this.callbacks = {};
		this.presetCallbacks = {};
		this.state = "created";

		this.setup(target, duration, to, from, presetCallbacks);
	};

	Tween.prototype = {
		setup : function(target, duration, to, from, presetCallbacks){
			this.started = false;
			this.paused = true;
			this.repeated = 0;
			this.yoyoPhase = false;

			this.duration = duration * 1000;
			this.target = target;

			this.target.__tweensList = new TweensList();
			this.target.__tweensList.add(this.id, this);

			this.to = to;
			this.from = from;
			this.current = this.from;

			this.ease = this.to.ease;
			this.repeat = this.to.repeat;
			this.yoyo = this.to.yoyo;

			this.clearObject(this.presetCallbacks);
			if (presetCallbacks){
				for (var k in presetCallbacks){
					this.presetCallbacks[k] = presetCallbacks[k];
				}
			}

			this.clearObject(this.callbacks);
			this.callbacks.onUpdate = to.onUpdate
			this.callbacks.onStart = to.onStart
			this.callbacks.onComplete = to.onComplete
			this.callbacks.onRepeat = to.onRepeat

			if (this.to.paused != true){
				this.restart();
			}

			return this;
		},
		get id(){
			if (!this._id) this._id = "tween-" + (Math.random().toString(32).substring(3, 16));
			return this._id;
		},
		/**********************************************/
		/*helpers*/
		/**********************************************/
		generateFromObject : function(target, to){
			var result = {};

			for (var k in to){
				if (this.isValidProperty(k, to[k])){
					result[k] = target[k];
				}
			}

			return result;
		},
		copyValues : function(target, source){
			for (var k in source){
				target[k] = source[k]
			}

			return target;
		},
		clearObject : function(obj){
			for (var k in obj){
				delete obj[k];
			}

			return this;
		},
		protectedProperties : [
			"repeat",
			"yoyo",
			"onStart",
			"onRepeat",
			"onComplete",
			"onUpdate",
			"delay",
			"ease"
		],
		isValidProperty : function(name, value){
			if (this.protectedProperties.indexOf(name) < 0 && !isNaN(Number(value))){
				return true;
			} else {
				return false;
			}
		},
		calcValue : function(from, to, progress){
			return (Number(from) + ((Number(to) - Number(from)) * progress));
		},
		/**********************************************/
		/*!helpers*/
		/**********************************************/
		/*easings*/
		/**********************************************/
		easingFunctions : easingFunctions,
		/**********************************************/
		/*target*/
		_target : null,
		get target(){
			return this._target;
		},
		set target(value){
			this._target = value;
		},
		/*from*/
		_from : {},
		set from(values){
			if (!values && this.to && this.target){
				this.from = this.generateFromObject(this.target, this.to);
				return;
			}

			this.clearObject(this._from);
			this._from = this.copyValues(this._from, values);
		},
		get from(){
			return this._from;
		},
		/*to*/
		_to : {},
		set to(values){
			this.clearObject(this._to);
			this.copyValues(this._to, values);
		},
		get to(){
			return this._to;
		},
		/*current*/
		_current : {},
		get current(){
			return this._current;
		},
		set current(values){
			this.clearObject(this._current);
			this.copyValues(this._current, values);
		},
		_ease : null,
		get ease(){
			return this._ease;
		},
		set ease(value){
			if (!value){
				return;
			}

			if (this.easingFunctions[value]){
				this._ease = this.easingFunctions[value];
			} else if (typeof value == "function"){
				this._ease = value;
			}
		},
		/**********************************************/
		/*controls*/
		/**********************************************/
		restart : function(){
			if (this.removeTask){
				this.removeTask();
			}

			this.current = this.from;
			this.pauseProgress = 0;
			this.started = false;
			this.resume(true);
		},
		pause : function(){
			if (this.paused){ return; }
			this.state = "paused";
			this.paused = true;
			this.removeTask();
			this.pauseProgress = this.progress;
		},
		resume : function(restart){
			if (!this.paused){ return; }

			this.state = "started";
			this.startDate = (+new Date() - this.duration * (this.pauseProgress || 0));
			this.removeTask = unicycle.addTask(this.tick, this.id);
			this.paused = false;
		},
		/*callbacks*/
		callbacks : {
			onStart : null,
			onComplete : null,
			onRepeat : null,
			onUpdate : null,
		},
		callback : function(name){
			if (this.callbacks[name]) this.callbacks[name].call(this, this);
			if (this.presetCallbacks[name]) this.presetCallbacks[name].call(this, this);
		},
		/*control props*/
		_started : false,
		get started(){ return this._started },
		set started(value){
			this._started = value;
			this._paused = !value;
		},
		_paused : true,
		get paused(){ return this._paused },
		set paused(value){
			this._paused = value;
		},
		/*progress*/
		get easedProgress(){
			return this.ease ? this.ease(this.progress) : this.progress;
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
		/*repeating and yoyo*/
		_yoyo : false,
		get yoyo(){ return this._yoyo },
		set yoyo(value){
			if (typeof value == "boolean"){
				this._yoyo = value;
			}
		},
		yoyoPhase : false,
		_repeat : 0,
		get repeat(){ return this._repeat },
		set repeat(value){
			if (typeof value == "number"){
				this._repeat = value;
			}
		},
		repeated : 0,
		recalcCurrent : function(){
			for (var k in this.current){
				if (this.yoyoPhase){
					this.current[k] = this.calcValue(this.to[k], this.from[k], this.easedProgress);
				} else {
					this.current[k] = this.calcValue(this.from[k], this.to[k], this.easedProgress);
				}
			}
		},
		tick : function(delta){
			if (!this.started){
				this.started = true;
				this.state = "started";
				this.callback("onStart");
			}


			this.recalcCurrent();
			this.copyValues(this.target, this.current);

			this.callback("onUpdate");

			if (this.progress >= 1){
				var expire = true;

				this.repeated++;

				if (this.repeat < 0 || this.repeated < this.repeat){
					expire = false;
				}

				if (expire){
					// console.log(this);
					this.state = "completed";
					this.callback("onComplete");
					this.kill("self");
				} else {
					if (this.yoyo) this.yoyoPhase = !this.yoyoPhase;
					this.progress = 0;
					this.callback("onRepeat");
				}	
			}
		},
		kill : function(killer){
			this.state = "killed";
			this.killer = killer || "user";
			this.target.__tweensList.remove(this.id);
			if (this.removeTask) this.removeTask();
			delete this.removeTask;
			this.tweener.pool.add(this);
		}
	};

	var Tweener = function(newInstance){
		if (newInstance !== true && tweener instanceof Tweener){
			return tweener;
		}

		this._presets = {};

		this.tweensCreated = 0;

	};

	Tweener.prototype = {
		Tween : Tween,
		easingFunctions : easingFunctions,
		console : {
			warn : function(message, data){
				data ? console.warn("Tweener:", message) : console.warn("Tweener:", message, data);
			}
		},
		get presets(){
			return this._presets;
		},
		set presets(data){
			for (var k in data){
				this._presets[k] = data[k];
			}
		},
		runPreset : function(name, target, presetCallbacks){
			var preset = this._presets[name];
			if (preset){
				if (preset.from && preset.to && preset.duration){
					return this.fromTo(target, preset.duration, preset.from, preset.to, presetCallbacks);
				} else if (preset.to && preset.duration){
					return this.to(target, preset.duration, preset.to, presetCallbacks);
				}
			} else {
				this.console.warn("no such preset", name);
			}
		},
		pool : {
			content : [],
			add : function(tween){
				return null;
				if (tween.pooled){
					return;
				}

				tween.pooled = true;
				this.content.push(tween);
			},
			get : function(){
				return null;
				var tween = this.content.pop();

				if (tween){
					tween.pooled = false;
				}

				return tween;
			}
		},
		to : function(target, duration, to, presetCallbacks){
			var tween = this.pool.get();
			if (tween){
				return tween.setup(target, duration,  to, null, presetCallbacks);
			} else {
				return new Tween(this, target, duration,  to, null, presetCallbacks);
			}
		},
		fromTo : function(target, duration, from, to, presetCallbacks){
			var tween = this.pool.get();
			if (tween){
				return tween.setup(target, duration, to, from, presetCallbacks);
			} else {
				return new Tween(this, target, duration, to, from, presetCallbacks);
			}
		}
	};

	var tweener = new Tweener();
    return tweener;
}));