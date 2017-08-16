"use strict";
requirejs.config({
	paths : {
		"unicycle" : "node_modules/unicycle/unicycle"
	}
});

requirejs(["tweener"], function(tweener){

	window.tweener = tweener;

});