# p5.js-func
Function Generators for p5.js (http://p5js.org)

R. Luke DuBois (dubois@nyu.edu)   
[Integrated Digital Media](http://idm.engineering.nyu.edu) / [Brooklyn Experimental Media Center](http://bxmc.poly.edu)    
NYU

Shiffman, it's pronounced *funk*.

**p5.func** is a p5 extension that provides new objects and utilities for function generation in the time, spatial, and frequency domains. This module might be useful for everything from plotting animation paths to signal processing.

**p5.func** contains five new objects:

* **p5.Gen()** : function generators (waveforms, curves, window functions, noise, etc.)
* **p5.Ease()** : easing / interpolation functions
* **p5.ArrayEval()** : equation evaluator to generate pre-computed arrays
* **p5.Filt()** : biquadratic filter object
* **p5.FastFourierTransform()** : signal neutral FFT implementation

The library also contains a number of utility functions for p5:

*  **imap()** : constrainted integer mapping function
*  **createArray()** / **normalizeArray()** / **resizeArray()** / **multiplyArray()** / **addArray()** / **sumArray()** : array utility functions
*  **f2ib()** / **ib2f()** : int<->float coercion with bit parity
*  **sinc()** : sinc (*sinus cardinalis*) function
*  **besselI0()** : bessel function
*  **fplot()** : formattable console plot of any array
 
Quite a bit of this code is adapted from other sources, notably:
*  RTcmix Scorefile Commands: http://rtcmix.org/reference/scorefile/
*  Robert Penner's Easing Functions: http://robertpenner.com/easing/
*  Golan Levin's Pattern Master: https://github.com/golanlevin/Pattern_Master
*  Robert Bristow-Johnson's Audio EQ Cookbook: http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt
*  Corban Brook's dsp.js: https://github.com/corbanbrook/dsp.js/

## p5.Gen Example (direct evaluation)
```javascript
var g = new p5.Gen(); // function generator object
// evaluate the value 20% (0.2) into a wavetable defined by harmonic strengths 1., 0.5, and 0.3:
g.harmonics(0.2, [1.0, 0.5, 0.3]); // 1.0686135667536483
// evaluate the value halfway (0.5) into a breakpoint function rising from 0 to 1 then falling to 0:
g.bpf(0.5, [0, 0, 1, 1, 2, 0]); // 1.
// evaluate the value 3/4ths (0.75) into a hamming window function
g.window(0.75, "hamming"); 0.5400000000000001
```
## p5.Gen Example (array filling)
```javascript
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
```javascript
var e = new p5.Ease(); // easing function object
e.listAlgos(); // return an array listing all the algorithms
// calculate the value halfway (0.5) through the 'circularIn' easing function:
e.circularIn(0.5); // 0.1339745962155614
// calculate the value a quarter (0.25) through the 'doubleCircularOgee' function with a coefficient of 0.5:
e.doubleCircularOgee(0.25, 0.5); // 0.4330127018922193
```
## p5.Ease Example (array filling)
```javascript
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
```javascript
var a = new p5.ArrayEval(); // array evaluation object
var foo = a.eval('u', 10); // 10-point 'normal map' (0 to 1)
console.log(foo); // print
var bar = a.eval2d(['su', 'sv'], 20, 20); // 20x20 two-dimensional signed normal map (-1 to 1)
console.log(bar); // print
var biz = a.eval3d('sqrt(su*su+sv*sv+sw*sw)', 8, 8, 8); // 8x8x8 array with a volumetric distance function
console.log(biz); // print
```
## p5.Filt Example
```javascript
var f = new p5.Filt(60); // filter object with math calibrated to 60Hz sampling rate (screen rate)
f.set("lowpass", 3, 0.7); // set to a lowpass filter with a cutoff frequency of 3Hz and a Q of 0.7

var ip = new Array(100); // input array
var op = new Array(100); // output array

for(let i = 0;i<100;i++)
{
 ip[i] = random(-1, 1); // random input
 op[i] = f.tick(ip[i]); // smoothed (lowpassed) output
}

console.log(ip); // print
fplot(ip, "color: red; font-size:9px;"); // plot
console.log(op); // print
fplot(op, "color: blue; font-size:9px;"); // plot
```
## p5.FastFourierTransform Example
```javascript
var fft = new p5.FastFourierTransform(512, 60); // 512-point FFT calibrated to 60Hz sampling rate (screen rate)
var g = new p5.Gen(); // function generator object

var ip = g.fillArray("waveform", 512, "saw"); // input array
fft.forward(ip); // compute FFT
var op = fft.spectrum; // output array with 256 points of magnitude
console.log(op); // print
fplot(op, "color: green; font-size:9px;"); // plot
```
## Reference

### p5.Gen
*methods*
* harmonics(x, args): periodic function of harmonic strengths determined by the Array *args*. *x* is 0 to 1. Returns f(x).
* triples(x, args): function of summed sines. The *args* are an Array of triples of frequency multiplier, amplitude, phase. *x* is 0 to 1. Returns f(x).
* chebyshev(x, args): function of chebyshev polynomials of the first kind. These polynomials will waveshape a sinusoid into a pre-defined spectrum, determined by the Array *args*. *x* is 0 to 1. Returns f(x).
* bpf(x, args): breakpoint function of line segments defined by Array *args* in *time*, *amplitude* pairs. *x* is 0 to 1. returns f(x).
* random(x, type): generates random numbers according to *type*. *x* is the random number seed. A missing seed value (or a seed of -1) will use the millis() function to generate a seed. Returns f(x). Supported random functions are:
  * "linear" / "even"
  * "low"
  * "high"
  * "triangle"
  * "gaussian"
  * "cauchy"
* window(x, type, args): generates window functions by *type*. Some functions have optional *args*. *x* is 0 to 1. Returns f(x). Supported window functions are:
  * "hamming"
  * "hanning" / "vonhann"
  * "bartlett" / "fejer" / "triangle"
  * "bartlett-hann"
  * "blackman"
  * "generalizedblackman" (*args* defines center; defaults to 0.5)
  * "blackman-harris"
  * "blackman-nuttal"
  * "nuttal"
  * "gaussian" (*args* defines sigma; defaults to 0.4)
  * "kaiser"
  * "rectangle" / "boxcar" / "dirichlet"
  * "cosine"
  * "sinc" / "lanczos"
  * "flattop"
  * "tukey" (*args* defines center; defaults to 0.5)
  * "slidinggaussian" (*args* defines [center, sigma]; defaults to [0.5, 0.4])
  * "adjustablecosine" (*args* defines center; defaults to 0.5)
  * "elliptic"  (*args* defines center; defaults to 0.5)
  * "hyperelliptic" (*args* defines [center, order]; defaults to [0.5, 3])
  * "squircular" (*args* defines [center, order]; defaults to [0.5, 3])
  * "poisson" (*args* defines center; defaults to 0.5)
  * "hann-poisson" (*args* defines center; defaults to 0.5)
  * "slidinghann-poisson" (*args* defines [center, sigma]; defaults to [0.5, 0.5])
* waveform(x, type): generates simple waveform functions according to *type*. *x* is 0 to 1. Returns f(x). Supported waveforms are:
  * "sine"
  * "cosine"
  * "sawtooth"
  * "sawdown"
  * "phasor"
  * "square"
  * "rectangle"
  * "pulse"
  * "triangle"
  * "buzz"
* listAlgos(): lists available top-level algorithms.
* fillArray(algo, len, args, seed): evaluates one of the above algorithms on an Array of numbers where *x* is set to a normal map of the function range (0 to 1). *algo* sets the algorithm ("harmonics", "window", etc.); *len* is the length of the Array to return; *args* are the arguments for the generator algorithm; the *seed* argument sets a base seed for the "random" generator.
* fillFloat32Array(algo, len, args, seed): evaluates one of the above algorithms on an Float32Array of numbers where *x* is set to a normal map of the function range (0 to 1). *algo* sets the algorithm ("harmonics", "window", etc.); *len* is the length of the Float32Array to return; *args* are the arguments for the generator algorithm; the *seed* argument sets a base seed for the "random" generator.
* fillFloat64Array(algo, len, args, seed): evaluates one of the above algorithms on an Float64Array of numbers where *x* is set to a normal map of the function range (0 to 1). *algo* sets the algorithm ("harmonics", "window", etc.); *len* is the length of the Float64Array to return; *args* are the arguments for the generator algorithm; the *seed* argument sets a base seed for the "random" generator.

### p5.Ease
*methods*
* adjustableCenterDoubleExponentialSigmoid(x, a, b): 
* backIn(x): 
* backInOut(x): 
* backOut(x): 
* bounceIn(x): 
* bounceInOut(x): 
* bounceOut(x): 
* boxcar(x): 
* brycesCubic(x, n): 
* catmullRomInterpolate(x, a, b): 
* circularArcThroughAPoint(x, a, b): 
* circularFillet(x, a, b, c): 
* circularIn(x): 
* circularInOut(x): 
* circularOut(x): 
* cosineApproximation(x): 
* cubicBezier(x, a, b, c, d): 
* cubicBezierThrough2Points(x, a, b, c, d): 
* cubicIn(x): 
* cubicInOut(x): 
* cubicOut(x): 
* dampedSinusoid(x, a): 
* dampedSinusoidReverse(x, a): 
* doubleCircularOgee(x, a): 
* doubleCircularSigmoid(x, a): 
* doubleCubicOgee(x, a, b): 
* doubleCubicOgeeSimplified(x, a, b): 
* doubleEllipticOgee(x, a, b): 
* doubleEllipticSigmoid(x, a, b): 
* doubleExponentialOgee(x, a): 
* doubleExponentialSigmoid(x, a): 
* doubleLinear(x, a, b): 
* doubleOddPolynomialOgee(x, a, b, n): 
* doublePolynomialSigmoid(x, n): 
* doubleQuadraticBezier(x, a, b, c, d): 
* doubleQuadraticSigmoid(x): 
* doubleSquircularOgee(x, a, n): 
* doubleSquircularSigmoid(x, a, n): 
* elasticIn(x): 
* elasticInOut(x): 
* elasticOut(x): 
* exponentialEmphasis(x, a): 
* exponentialIn(x): 
* exponentialInOut(x): 
* exponentialOut(x): 
* exponentialSmoothedStaircase(x, a, n): 
* fastSquareRoot(x): 
* generalSigmoidLogitCombo(x, a, b): 
* generalizedLinearMap(x, a, b, c, d): 
* gompertz(x, a): 
* hermite(x, a, b, c, d): 
* hermite2(x, a, b, c, d): 
* iterativeSquareRoot(x): 
* linear(x): 
* maclaurinCosine(x): 
* normalizedErf(x): 
* normalizedInverseErf(x): 
* normalizedLogisticSigmoid(x, a): 
* normalizedLogit(x, a): 
* parabolaThroughAPoint(x, a, b): 
* quadraticBezier(x, a, b): 
* quadraticBezierStaircase(x, a, n): 
* quadraticIn(x): 
* quadraticInOut(x): 
* quadraticOut(x): 
* quartic(x, a, b): 
* quarticIn(x): 
* quarticInOut(x): 
* quarticOut(x): 
* quinticIn(x): 
* quinticInOut(x): 
* quinticOut(x): 
* raisedInvertedCosine(x): 
* sineIn(x): 
* sineInOut(x): 
* sineOut(x): 
* smoothStep(x): 
* smootherStep(x): 
* staircase(x, n): 
* tripleLinear(x, a, b, c, d): 
* variableStaircase(x, a, n): 
* listAlgos(): 
* fillArray(algo, len, args): 
* fillFloat32Array(algo, len, args): 
* fillFloat64Array(algo, len, args): 

### p5.ArrayEval
*methods*
* eval(evalstr, l1), eval1d(evalstr, l1): 
* eval2d(evalstr, l1, l2): 
* eval3d(evalstr, l1, l2, l3): 

### p5.Filt
*constuctor*
* fs: sampling rate (default=60)
*methods*
* clear(): 
* coeffs(a0, b0, b1, b2, a1, a2): 
* precalc(): 
* process(x): 
* set(type, f0, Q, dB): 
* setBW(bw): 
* setFreq(f0): 
* setFs(fs): 
* setGain(dB): 
* setQ(Q): 
* setType(type): 
* tick(x): 

### p5.FastFourierTransform
*constructor*
* bufsize: FFT buffer size (default=512)
* fs: sampling rate (default=60)
*methods*
* forward(buffer): 
* inverse(real, imag): 
* calculateSpectrum(): 
* getBandFrequency(index): 
*properties*
* spectrum: *Array* of current spectrum (amplitude) data
* phase: *Array* of current phase data 
* real: *Array* containing real part of last FFT
* imaginary: *Array* containing imaginary part of last FFT

### Misc. Utilities
*methods*
* imap(v, a, b, c, d): constrainted integer mapping function
* createArray(len)
* normalizeArray(array)
* resizeArray(array, newlen)
* multiplyArray(a1, a2)
* addArray(a1, a2)
* sumArray(a1, a2): array utility functions
* f2ib(x)
* ib2f(x): int<->float coercion with bit parity
* sinc(x): sinc (*sinus cardinalis*) function
* besselI0(x): bessel function
* fplot(array, css): formattable console plot of any array

