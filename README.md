# Tweener

A lightweight JavaScript animation library for creating smooth, customizable tweens with various easing functions. Tweener makes it easy to animate DOM elements and objects with precise control over timing, easing, and callbacks.

## Features

- Chainable API for creating fluid animations
- Multiple easing functions for different animation styles
- Support for repeating and yoyo animations
- Callback system (onStart, onUpdate, onComplete, onRepeat)
- UMD compatible (works in browser and with module systems)
- Depends on [unicycle](https://github.com/sanyabeast/unicycle) for efficient animation loop

## Basic Usage

```javascript
// Animate an element
tweener.to(element, 2, {
    x: 200,           // Move 200px right
    y: 100,           // Move 100px down
    scale: 1.5,       // Scale to 150%
    opacity: 0.5,     // Set opacity to 50%
    ease: "easeInOutBack", // Use easeInOutBack easing
    repeat: 3,        // Repeat 3 times
    yoyo: true,       // Reverse animation on repeat
    onComplete: function() {
        console.log("Animation complete!");
    }
});
```

## Easing Functions

The following easing functions are available:

- linear
- easeInQuad
- easeOutQuad
- easeInOutQuad
- easeInCubic
- easeOutCubic
- easeInOutCubic
- easeInQuart
- easeOutQuart
- easeInOutQuart
- easeInQuint
- easeOutQuint
- easeInOutQuint
- easeInBack
- easeOutBack
- easeInOutBack

## Demo

Open `index.html` in your browser to see an interactive demo with multiple animated elements.

## License

MIT
