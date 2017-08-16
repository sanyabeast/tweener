"use strict";
requirejs.config({
	paths : {
		"unicycle" : "node_modules/unicycle/unicycle"
	}
});

requirejs(["tweener"], function(tweener){

	window.tweener = tweener;

	var tween = tweener.to(window.box, 1, {
		x : 300,
		y : 300,
		scale : 0.1,
		repeat : -1,
		yoyo : true,
		onUpdate : function(tween){
		},
	    onComplete : function(){
		},
		onStart : function(){
		},
		onRepeat : function(){
		}
	})

});