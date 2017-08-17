"use strict";
requirejs.config({
	paths : {
		"unicycle" : "node_modules/unicycle/unicycle"
	}
});

requirejs(["tweener"], function(tweener){
	window.tweener = tweener;

	var parent = document.querySelector(".parent");

	for (var a = 0, box; a < 150; a++){
		box = document.createElement("div");
		box.classList.add("box");
		box.style.backgroundColor = ["hsl(", Math.floor(Math.random() * 360), ", 50%,25%)"].join("");
		box.innerText = Math.random().toString(32).substring(3, 5);
		parent.appendChild(box);
	}

	var boxes = document.querySelectorAll(".box");

	for (var a = 0; a < boxes.length; a++){
		createTween(boxes[a]);
	}

	function createTween(target){
		tweener.to(target, Math.random() * 10 + 3, {
			x : Math.random() * window.innerWidth - (window.innerWidth / 2),
			y : Math.random() * window.innerHeight - (window.innerHeight / 2),
			opacity : Math.random(),
			scale :  Math.random() * 3,
			ease : tweener.easingFunctions[Math.floor(Math.random() * 15)],
			onUpdate : function(tween){
				tween.target.innerText = Math.ceil(this.progress * 100);
			},
		    onComplete : function(){
		    	createTween(target);
			},
			onStart : function(){
				// console.log("start");
			},
			onRepeat : function(){
				// console.log("repeat");
			}
		})
	}

	// tweener.to(document.querySelector(".box"), 2, {
	// 	x : 200, 
	// 	y : 200,
	// 	ease : "easeInOutBack",
	// 	repeat : -1,
	// })


});