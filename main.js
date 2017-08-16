"use strict";
requirejs.config({
	paths : {
		"unicycle" : "node_modules/unicycle/unicycle"
	}
});

requirejs(["tweener"], function(tweener){

	window.tweener = tweener;

	var tween = tweener.to(window.box, 5, {
		x : 300,
		y : 300,
		scale : 0.1,
		repeat : 20,
		yoyo : true,
		delay : 1,
		ease : "easeInQuad",
		onUpdate : function(tween){
		},
	    onComplete : function(){
	    	console.log("compete")
		},
		onStart : function(){
			console.log("start");
		},
		onRepeat : function(){
			console.log("repeat");
		}
	})

});