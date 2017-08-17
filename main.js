"use strict";
requirejs.config({
	paths : {
		"unicycle" : "node_modules/unicycle/unicycle"
	}
});

requirejs(["tweener"], function(tweener){
	var parent = document.querySelector(".parent");

	for (var a = 0, box; a < 200; a++){
		box = document.createElement("div");
		box.classList.add("box");
		box.innerText = Math.random().toString(32).substring(3, 5);
		parent.appendChild(box);
	}

	var boxes = document.querySelectorAll(".box");

	for (var a = 0; a < boxes.length; a++){

		tweener.to(boxes[a], Math.random() * 4 + 4, {
			x : Math.random() * 500 - 250,
			y :  Math.random() * 500 - 250,
			opacity : 0.5,
			scale :  Math.random() * 2,
			repeat : -1,
			yoyo : true,
			ease : tweener.easingFunctions[Math.floor(Math.random() * 12)],
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
	}


});