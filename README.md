# p5.js-func
Function Generators for p5.js (http://p5js.org)

R. Luke DuBois (dubois@nyu.edu)   
[Integrated Digital Media](http://http://idm.engineering.nyu.edu)  
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
*  normalizeArray()/resizeArray/multiplyArray/addArray/sumArray : array functions
*  f2ib() / ib2f : int<->float casting with bit parity
*  sinc() : sinc (sinus cardinalis) function
*  besselI0() : bessel function
*  fplot() : formattable console plot of any array
 
Most of this code is adapted from other sources, notably:
*  RTcmix Scorefile Commands: http://rtcmix.org/reference/scorefile/
*  Robert Penner's Easing Functions: http://robertpenner.com/easing/
*  Golan Levin's Pattern Master: https://github.com/golanlevin/Pattern_Master
*  Robert Bristow-Johnson's Audio EQ Cookbook: http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt
*  Corban Brook's dsp.js: https://github.com/corbanbrook/dsp.js/

## Simple p5.Gen Example (direct evaluation)
```
var g = new p5.Gen(); // function generator object
g.harmonics(0.2, [1.0, 0.5, 0.3]); // evaluate the value 20% (0.2) into a wavetable with the first three harmonic strengths set to 1., 0.5, and 0.3
// 1.0686135667536483

```
## Simple Example (Recognition)
```
var foo = new p5.SpeechRec(); // speech recognition object (will prompt for mic access)
foo.onResult = showResult; // bind callback function to trigger when speech is recognized
foo.start(); // start listening

function showResult()
{
  console.log(foo.resultString); // log the result
}
```
