# p5.js-func
Function Generators for p5.js (http://p5js.org)

R. Luke DuBois (dubois@nyu.edu)   
[Integrated Digital Media](http://idm.engineering.nyu.edu) / [Brooklyn Experimental Media Center](http://bxmc.poly.edu) 
NYU

Shiffman, it's pronounced *funk*.

This is a p5 extension that provides new objects and utilities for function generation in the time, spatial, and frequency domains.  It consists of five new object classes:

* p5.Gen() : function generators (waveforms, curves, window functions, noise, etc.)
* p5.Ease() : easing / interpolation functions
* p5.ArrayEval() : equation evaluator to generate pre-computed arrays
* p5.Filt() : biquadratic filter object
* p5.FastFourierTransform() : data-neutral FFT implementation

The library also contains a number of utility functions for p5:

*  imap() : constrainted integer mapping function
*  normalizeArray()/resizeArray()/multiplyArray()/addArray()/sumArray() : array functions
*  f2ib() / ib2f() : int<->float casting with bit parity
*  sinc() : sinc (sinus cardinalis) function
*  besselI0() : bessel function
*  fplot() : formattable console plot of any array
 
Quite a bit of this code is adapted from other sources, notably:
*  RTcmix Scorefile Commands: http://rtcmix.org/reference/scorefile/
*  Robert Penner's Easing Functions: http://robertpenner.com/easing/
*  Golan Levin's Pattern Master: https://github.com/golanlevin/Pattern_Master
*  Robert Bristow-Johnson's Audio EQ Cookbook: http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt
*  Corban Brook's dsp.js: https://github.com/corbanbrook/dsp.js/

## p5.Gen Example (direct evaluation)
```
var g = new p5.Gen(); // function generator object
// evaluate the value 20% (0.2) into a wavetable defined by harmonic strengths 1., 0.5, and 0.3:
g.harmonics(0.2, [1.0, 0.5, 0.3]); // 1.0686135667536483
// evaluate the value halfway (0.5) into a breakpoint function rising from 0 to 1 then falling to 0:
g.bpf(0.5, [0, 0, 1, 1, 2, 0]); // 1.
// evaluate the value 3/4ths (0.75) into a hamming window function
g.window(0.75, "hamming"); 0.5400000000000001
```
## p5.Gen Example (array filling)
```
var g = new p5.Gen(); // function generator object
// assign 'foo' to a 512-point Array containing the wavetable defined by harmonic strengths 1., 0.5, and 0.3:
var foo = g.fillArray("harmonics", 512, [1.0, 0.5, 0.3]);
// assign 'bar' to a 1000-point Float32Array containing a single sine wave:
var bar = g.fillFloat32Array("waveform", 1000, "sine");
// assign 100 points of low-weighted random numbers to the Float64Array 'biz':
var biz = g.fillFloat64Array("random", 100, "low");
console.log(foo); // print
fplot(foo, "color: red; font-size:9px;"); // plot
console.log(bar); // print
fplot(bar, "color: green; font-size:9px;"); // plot
console.log(biz); // print
fplot(biz, "color: blue; font-size:9px;"); // plot
```
## p5.Ease Example (direct evaluation)
```
var e = new p5.Ease(); // easing function object
e.listAlgos(); // return an array listing all the algorithms
// calculate the value halfway (0.5) through the 'circularIn' easing function:
e.circularIn(0.5); // 0.1339745962155614
// calculate the value a quarter (0.25) through the 'doubleCircularOgee' function with a coefficient of 0.5:
e.doubleCircularOgee(0.25, 0.5); // 0.4330127018922193
```
## p5.Ease Example (array filling)
```
var e = new p5.Ease(); // easing function object
// assign 'foo' to a 10-point Array filled with a "doubleQuadraticBezie" easing function:
var foo = e.fillArray("doubleQuadraticBezier", 10);
// assign 'bar' to a 100-point Float32Array filled with a "smoothStep" easing function:
var bar = e.fillFloat32Array("smoothStep", 100);
// assign a 1000-point "doubleCircularSigmoid" with a coefficient of 0.8 to the Float64Array 'biz':
var biz = e.fillFloat64Array("doubleCircularSigmoid", 1000, 0.8);;
console.log(foo); // print
fplot(foo, "color: red; font-size:9px;"); // plot
console.log(bar); // print
fplot(bar, "color: green; font-size:9px;"); // plot
console.log(biz); // print
fplot(biz, "color: blue; font-size:9px;"); // plot
```
## p5.ArrayEval Example
```
var a = new p5.ArrayEval(); // array evaluation object
a.eval('u', 10); // generate a 10-point 'normal map' (0 to 1)
a.eval2d(['su', 'sv'], 20, 20); // generate a 20x20 array containing a 2-value signed normal map (-1 to 1)
a.eval3d('sqrt(su*su+sv*sv+sw*sw)', 8, 8, 8); // generate a 8x8x8 array containing a volumetric distance function
```

