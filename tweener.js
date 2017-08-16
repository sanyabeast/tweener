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

	var Tween = function(target, duration, to, from){
		this.started = false;
		this.paused = true;

		this.target = target;
		this.duration = duration * 1000;
		this.to = to;
		this.from = from || this.getFromObject(target, this.to);
		this.current = this.cloneObject(this.from);

		if (to.onUpdate) this.onUpdate = to.onUpdate;
		if (to.onStart) this.onStart = to.onStart;
		if (to.onComplete) this.onComplete = to.onComplete;

		this.tick = this.tick.bind(this);
		this.startDate = +new Date();

		if (to.paused != true){
			this.restart();
		}

	};

	Tween.prototype = {
		restart : function(){
			if (this.removeTask){
				this.removeTask();
			}

			this.current = this.cloneObject(this.from);
			this.started = false;
			this.paused = false;
			this.pauseProgress = 0;
			this.startDate = +new Date();
			this.resume();
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
		resume : function(){
			if (this.started){
				return;
			}

			this.started = true;

			this.startDate = (+new Date() - this.duration * (this.pauseProgress || 0));
			this.removeTask = unicycle.addTask(this.tick);
			this.paused = false;
		},
		get progress(){
			return (+new Date() - this.startDate) / this.duration;
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
			var value = (from + ((to - from) * progress));
			if (value < from) value = from;
			if (value > to) value = to;
			return value; 
		},
		updateCurrent : function(){
			var progress = this.progress;
			for (var k in this.current){
				this.current[k] = this.calcValue(this.from[k], this.to[k], progress);
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
			if (this.progress > 1){
				this.removeTask();
				delete this.removeTask();
				if (this.onComplete) this.onComplete(this);
			}
		}
	};

	var Tweener = function(newInstance){
		if (newInstance !== true && tweener instanceof Tweener){
			return tweener;
		}
	};

	Tweener.prototype = {
		to : function(target, duration, to){
			return new Tween(target, duration, to);
		},
		fromTo : function(target, duration, from, to){
			return new Tween(target, duration, to, from);
		}
	};

	var tweener = new Tweener();
    return tweener;
}));