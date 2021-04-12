# [p5.func](https://idmnyu.github.io/p5.js-func/)
Function Generators for [p5.js](http://p5js.org)

R. Luke DuBois ([dubois@nyu.edu](mailto:dubois@nyu.edu))   
[Integrated Digital Media](http://idm.engineering.nyu.edu) / [Brooklyn Experimental Media Center](http://bxmc.poly.edu)    
NYU Tandon School of Engineering

Shiffman, it's pronounced *funk*.

**p5.func** is a p5 extension that provides new objects and utilities for function generation in the time, frequency, and spatial domains. You might find this module useful for everything from plotting animation paths to generating procedural graphics to designing signal processing algorithms.

**p5.func** contains five new objects:

* **p5.Gen()** : function generators (waveforms, curves, window functions, noise, etc.)
* **p5.Ease()** : easing / interpolation functions
* **p5.ArrayEval()** : equation evaluator to generate pre-computed arrays
* **p5.Filt()** : biquadratic filter object
* **p5.FastFourierTransform()** : signal neutral FFT implementation

The library also contains a number of utility functions for p5:

*  **imap()** : constrainted integer mapping function
*  **wrap()** : wrapping function
*  **fold()** : folding function
*  **createArray()** / **normalizeArray()** / **resizeArray()** / **multiplyArray()** / **addArray()** / **subtractArray()** / **divideArray()** / **moduloArray()** / **sumArray()** : array utility functions
*  **f2ib()** / **ib2f()** : int<->float coercion with bit parity
*  **sinc()** : sinc (*sinus cardinalis*) function
*  **besselI0()** : Bessel function
*  **fplot()** : formattable console plot of any array

Quite a bit of this code is adapted from other sources, notably:
*  [RTcmix Scorefile Commands](http://rtcmix.org/reference/scorefile/)
*  [Robert Penner's Easing Functions](http://robertpenner.com/easing/)
*  [Golan Levin's Pattern Master](https://github.com/golanlevin/Pattern_Master)
*  [Robert Bristow-Johnson's Audio EQ Cookbook](http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt)
*  [Corban Brook's dsp.js](https://github.com/corbanbrook/dsp.js/)

## Download
* [Library only](https://raw.githubusercontent.com/IDMNYU/p5.js-func/master/lib/p5.func.js)
* [Minimized library](https://raw.githubusercontent.com/IDMNYU/p5.js-func/master/lib/p5.func.min.js)

## Examples

### p5.Gen Example (direct evaluation)
```javascript
var g = new p5.Gen(); // function generator object

// evaluate the value 20% (0.2) into a wavetable
// defined by harmonic strengths 1., 0.5, and 0.3:
g.harmonics(0.2, [1.0, 0.5, 0.3]); // 1.0686135667536483

// evaluate the value halfway (0.5) into a breakpoint function
// rising from 0 to 1 then falling to 0:
g.bpf(0.5, [0, 0, 1, 1, 2, 0]); // 1.

// evaluate the value 3/4ths (0.75) into a hamming window function:
g.window(0.75, "hamming"); // 0.5400000000000001
```
### p5.Gen Example (array filling)
```javascript
var g = new p5.Gen(); // function generator object

// assign 'foo' to a 512-point Array containing the wavetable
// defined by harmonic strengths 1., 0.5, and 0.3:
var foo = g.fillArray("harmonics", 512, [1.0, 0.5, 0.3]);

// assign 'bar' to a 1000-point Float32Array containing a
// single sine wave:
var bar = g.fillFloat32Array("waveform", 1000, "sine");

// assign 100 points of low-weighted random numbers to
// the Float64Array 'biz':
var biz = g.fillFloat64Array("random", 100, "low");

console.log(foo); // print
fplot(foo, "color: red; font-size:9px;"); // plot
console.log(bar); // print
fplot(bar, "color: green; font-size:9px;"); // plot
console.log(biz); // print
fplot(biz, "color: blue; font-size:9px;"); // plot
```
### p5.Ease Example (direct evaluation)
```javascript
var e = new p5.Ease(); // easing function object
e.listAlgos(); // return an array listing all the algorithms

// calculate the value halfway (0.5) through
// the 'circularIn' easing function:
e.circularIn(0.5); // 0.1339745962155614

// calculate the value a quarter (0.25) through
// the 'doubleCircularOgee' function with a coefficient of 0.5:
e.doubleCircularOgee(0.25, 0.5); // 0.4330127018922193
```
### p5.Ease Example (array filling)
```javascript
var e = new p5.Ease(); // easing function object

// assign 'foo' to a 10-point Array filled with
// a "doubleQuadraticBezie" easing function:
var foo = e.fillArray("doubleQuadraticBezier", 10);

// assign 'bar' to a 100-point Float32Array filled with
// a "smoothStep" easing function:
var bar = e.fillFloat32Array("smoothStep", 100);

// assign a 1000-point "doubleCircularSigmoid" with
// a coefficient of 0.8 to the Float64Array 'biz':
var biz = e.fillFloat64Array("doubleCircularSigmoid", 1000, 0.8);

console.log(foo); // print
fplot(foo, "color: red; font-size:9px;"); // plot
console.log(bar); // print
fplot(bar, "color: green; font-size:9px;"); // plot
console.log(biz); // print
fplot(biz, "color: blue; font-size:9px;"); // plot
```
### p5.ArrayEval Example
```javascript
var a = new p5.ArrayEval(); // array evaluation object

// 10-point 'normal map' (0 to 1):
var foo = a.eval('u', 10);

// 20x20 two-dimensional signed normal map (-1 to 1):
var bar = a.eval2d(['su', 'sv'], 20, 20);

// 8x8x8 array with a volumetric distance function:
var biz = a.eval3d('sqrt(su*su+sv*sv+sw*sw)', 8, 8, 8);

console.log(foo); // print
console.log(bar); // print
console.log(biz); // print
```
### p5.Filt Example
```javascript
// filter object with math calibrated to a 60Hz sampling rate:
var f = new p5.Filt(60);
// lowpass filter with a cutoff frequency of 3Hz and a Q of 0.7:
f.set("lowpass", 3, 0.7);

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
### p5.FastFourierTransform Example
```javascript
// 512-point FFT calibrated to a 60Hz sampling rate:
var fft = new p5.FastFourierTransform(512, 60);
var g = new p5.Gen(); // function generator object

var ip = g.fillArray("waveform", 512, "saw"); // input array
fft.forward(ip); // compute FFT

var op = fft.spectrum; // output array (256 points of magnitude)
console.log(op); // print
fplot(op, "color: green; font-size:9px;"); // plot
```
### More Examples

* [p5.Gen() Simple Panning](https://idmnyu.github.io/p5.js-func/examples/gen1_pan) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/gen1_pan/sketch.js)
* [p5.Gen() Harmonics](https://idmnyu.github.io/p5.js-func/examples/gen2_harmonics) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/gen2_harmonics/sketch.js)
* [p5.Gen() Console Plotting](https://idmnyu.github.io/p5.js-func/examples/gen3_fplot) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/gen3_fplot/sketch.js)
* [p5.Gen() Screen Plotting](https://idmnyu.github.io/p5.js-func/examples/gen4_plot) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/gen4_plot/sketch.js)
* [p5.Ease() Simple Panning](https://idmnyu.github.io/p5.js-func/examples/easing1_pan) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/easing1_pan/sketch.js)
* [p5.Ease() Wah-wah](https://idmnyu.github.io/p5.js-func/examples/easing2_wah) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/easing2_wah/sketch.js)
* [p5.Ease() Animation Easing](https://idmnyu.github.io/p5.js-func/examples/easing3_animation) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/easing3_animation/sketch.js)
* [p5.Ease() Array Example](https://idmnyu.github.io/p5.js-func/examples/easing4_fillArray) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/easing4_fillArray/sketch.js)
* [p5.Ease() Console Plotting](https://idmnyu.github.io/p5.js-func/examples/easing5_fplot) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/easing5_fplot/sketch.js)
* [p5.Ease() Screen Plotting](https://idmnyu.github.io/p5.js-func/examples/easing6_plot) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/easing6_plot/sketch.js)
* [p5.ArrayEval() 2D Grid](https://idmnyu.github.io/p5.js-func/examples/arrayeval1_grid) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/arrayeval1_grid/sketch.js)
* [p5.ArrayEval() Curve Generator](https://idmnyu.github.io/p5.js-func/examples/arrayeval2_curve) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/arrayeval2_curve/sketch.js)
* [p5.Filt() Smoothing Values](https://idmnyu.github.io/p5.js-func/examples/filter1_smooth) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/filter1_smooth/sketch.js)
* [p5.Filt() Interactive Filter](https://idmnyu.github.io/p5.js-func/examples/filter2_plot) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/filter2_plot/sketch.js)
* [p5.Fourier() Example](https://idmnyu.github.io/p5.js-func/examples/fourier1_plot) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/fourier1_plot/sketch.js)
* [p5.Fourier() Audio Example](https://idmnyu.github.io/p5.js-func/examples/fourier2_plot) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/fourier2_plot/sketch.js)
* [p5.Fourier() Audio Resynthesis](https://idmnyu.github.io/p5.js-func/examples/fourier3_resynthesize) [(source)](https://github.com/IDMNYU/p5.js-func/blob/master/examples/fourier3_resynthesize/sketch.js)

## Reference

### p5.Gen

*methods*
* **harmonics(x, [h1... hn])**: periodic function of harmonic strengths defined by an Array passed as the second argument. *x* is 0 to 1. Returns f(x).
* **triples(x, [f1, a1, p1... fn, an, pn)**: function of summed sines. The second argument is an Array of triples of frequency multiplier, amplitude, phase. *x* is 0 to 1. Returns f(x).
* **chebyshev(x, [t1... tn])**: function of chebyshev polynomials of the first kind. These polynomials will waveshape a sinusoid into a pre-defined spectrum, determined by values in the Array passed as the second argument. *x* is 0 to 1. Returns f(x).
* **bpf(x, [t1, a1... tn, an])**: breakpoint function of line segments defined in *time*, *amplitude* pairs in the Array passed as the second argument. *x* is 0 to 1. returns f(x).
* **random(seed, type)**: generates random numbers according to *type*. *seed* is the random number seed. A missing seed value (or a seed of -1) will use the millis() function to generate a seed. Returns values are in the range of 0 to 1. Supported random functions are:
  * "linear" / "even"
  * "low"
  * "high"
  * "triangle"
  * "gaussian"
  * "cauchy"
* **window(x, type, args)**: generates window functions by *type*. Some functions have optional *args*. *x* is 0 to 1. Returns f(x). Supported window functions are:
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
* **waveform(x, type)**: generates simple waveform functions according to *type*. *x* is 0 to 1. Returns f(x). Supported waveforms are:
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
* **listAlgos()**: lists available top-level algorithms.
* **fillArray(algo, len, args, seed)**: evaluates one of the above algorithms on an Array of numbers where *x* is set to a normal map of the function range (0 to 1). *algo* sets the algorithm ("harmonics", "window", etc.); *len* is the length of the Array to return; *args* are the arguments for the generator algorithm; the *seed* argument sets a base seed for the "random" generator.
* **fillFloat32Array(algo, len, args, seed)**: evaluates one of the above algorithms on a Float32Array of numbers where *x* is set to a normal map of the function range (0 to 1). *algo* sets the algorithm ("harmonics", "window", etc.); *len* is the length of the Float32Array to return; *args* are the arguments for the generator algorithm; the *seed* argument sets a base seed for the "random" generator.
* **fillFloat64Array(algo, len, args, seed)**: evaluates one of the above algorithms on a Float64Array of numbers where *x* is set to a normal map of the function range (0 to 1). *algo* sets the algorithm ("harmonics", "window", etc.); *len* is the length of the Float64Array to return; *args* are the arguments for the generator algorithm; the *seed* argument sets a base seed for the "random" generator.

### p5.Ease

*methods*

For all easing functions, *x* is 0 to 1. Method returns f(x). Some methods have optional arguments: *n* is order for exponential / stepping functions; *a*, *b*, *c*, and *d* are coefficients.

* **linear(x)** / **doubleLinear(x, a, b)** / **tripleLinear(x, a, b, c, d)** / **generalizedLinearMap(x, a, b, c, d)** / **quadraticIn(x)** / **quadraticOut(x)** / **quadraticInOut(x)** / **doubleQuadraticBezier(x, a, b, c, d)** / **doubleQuadraticSigmoid(x)** / **quadraticBezier(x, a, b)** / **quadraticBezierStaircase(x, a, n)** / **cubicIn(x)** / **cubicOut(x)** / **cubicInOut(x)** / **brycesCubic(x, n)** / **cubicBezier(x, a, b, c, d)** / **cubicBezierThrough2Points(x, a, b, c, d)** / **doubleCubicOgee(x, a, b)** / **doubleCubicOgeeSimplified(x, a, b)** / **quarticIn(x)** / **quarticOut(x)** / **quarticInOut(x)** / **generalizedQuartic(x, a, b)** / **quinticIn(x)** / **quinticOut(x)** / **quinticInOut(x)** / **sineIn(x)** / **sineOut(x)** / **sineInOut(x)** / **dampedSinusoid(x, a)** / **dampedSinusoidReverse(x, a)** / **circularIn(x)** / **circularOut(x)** / **circularInOut(x)** / **doubleCircularOgee(x, a)** / **doubleCircularSigmoid(x, a)** / **circularArcThroughAPoint(x, a, b)** / **circularFillet(x, a, b, c)** / **exponentialIn(x)** / **exponentialOut(x)** / **exponentialInOut(x)** / **exponentialEmphasis(x, a)** / **exponentialSmoothedStaircase(x, a, n)** / **elasticIn(x)** / **elasticOut(x)** / **elasticInOut(x)** / **backIn(x)** / **backOut(x)** / **backInOut(x)** / **bounceIn(x)** / **bounceOut(x)** / **bounceInOut(x)** / **doubleExponentialOgee(x, a)** / **doubleExponentialSigmoid(x, a)** / **adjustableCenterDoubleExponentialSigmoid(x, a, b)** / **doubleOddPolynomialOgee(x, a, b, n)** / **doublePolynomialSigmoid(x, n)** / **doubleEllipticOgee(x, a, b)** / **doubleEllipticSigmoid(x, a, b)** / **doubleSquircularOgee(x, a, n)** / **doubleSquircularSigmoid(x, a, n)** / **boxcar(x)** / **gompertz(x, a)** / **catmullRomInterpolate(x, a, b)** / **parabolaThroughAPoint(x, a, b)** / **hermite(x, a, b, c, d)** / **hermite2(x, a, b, c, d)** / **fastSquareRoot(x)** / **iterativeSquareRoot(x)** / **cosineApproximation(x)** / **maclaurinCosine(x)** / **raisedInvertedCosine(x)** / **generalSigmoidLogitCombo(x, a, b)** / **normalizedLogitSigmoid(x, a)** / **normalizedLogit(x, a)** / **staircase(x, n)** / **variableStaircase(x, a, n)** / **smoothStep(x)** / **smootherStep(x)** / **normalizedErf(x)** / **normalizedInverseErf(x)**
* **listAlgos()**: lists available easing functions.
* **fillArray(algo, len, args)**: evaluates an easing function on an Array of numbers where *x* is set to a normal map of the function range (0 to 1). *algo* sets the algorithm ("doubleLinear", "sineOut", etc.); *len* is the length of the Array to return; *args* are the arguments to the algorithm, if needed.
* **fillFloat32Array(algo, len, args)**: evaluates an easing function on a Float32Array of numbers where *x* is set to a normal map of the function range (0 to 1). *algo* sets the algorithm ("doubleLinear", "sineOut", etc.); *len* is the length of the Float32Array to return; *args* are the arguments to the algorithm, if needed.
* **fillFloat64Array(algo, len, args)**: evaluates an easing function on an Float64Array of numbers where *x* is set to a normal map of the function range (0 to 1). *algo* sets the algorithm ("doubleLinear", "sineOut", etc.); *len* is the length of the Float64Array to return; *args* are the arguments to the algorithm, if needed.

### p5.ArrayEval

*methods*
* **eval(evalstr, l1)**, **eval1d(evalstr, l1)**: evaluate a *evalstr* into a one-dimensional Array. If *evalstr* is an Array, each element in the Array will fill with more than one value. *l1* is the length of the Array to return. The keywords *u*, *su*, *cu*, and *du* will be expanded to a normal map, a signed normal map, a cell position (0 to *l1*-1), and the length of the array (*l1*).
* **eval2d(evalstr, l1, l2)**: evaluate a *evalstr* into a two-dimensional Array. If *evalstr* is an Array, each element in the Array will fill with more than one value. *l1* and *l2*) are the width and height of the Array to return. The keywords *u/v*, *su/sv*, *cu/cv*, and *du/dv* will be expanded to a normal map, a signed normal map, a cell position (0 to *l1/l2*-1), and the length of the array (*l1/l2*) on the two axes.
* **eval3d(evalstr, l1, l2, l3)**: evaluate a *evalstr* into a three-dimensional Array. If *evalstr* is an Array, each element in the Array will fill with more than one value. *l1*, *l2*, and *l3*) are the width, height, and depth of the Array to return. The keywords *u/v/w*, *su/sv/sw*, *cu/cv/cw*, and *du/dv/dw* will be expanded to a normal map, a signed normal map, a cell position (0 to *l1/l2/l3*-1), and the length of the array (*l1/l2/l3*) on the three axes.

### p5.Filt

*constructor*
* *fs*: sampling rate (default=60)

*methods*
* **tick(x)**: evaluate a single sample (*x*) through the filter. Method returns f(x).
* **process(x)**: evaluate a vector (an Array) through the filter. Returns an Array of the same length.
* **set(type, f0, Q, dB)**: sets the parameters of the filter:
  * *type* can be "lowpass", "highpass", "bandpass", "resonant", "notch", "allpass", "peaknotch", "lowshelf", and "highshelf".
  * *f0* is the center / cutoff frequency of the filter.
  * *Q* is the "quality" of the filter (inverse of bandwidth). A higher Q is a narrower / more resonant filter.
  * *dB* is the boost/cut (in decibels) of the filter, when *type* is "peaknotch", "lowshelf", and "highshelf".
* **setType(type)**: set the *type* of the filter ("lowpass", etc.).
* **setFreq(f0)**: set the center / cutoff frequency of the filter.
* **setQ(Q)**: set the *Q* of the filter.
* **setBW(bw)**: set the bandwidth of the filter (computes the *Q*).
* **setGain(dB)**: sets the gain (in decibels) of the filter.
* **clear()**: clears/resets the sample memory in the filter.
* **coeffs(a0, b0, b1, b2, a1, a2)**: sets the coefficients of the biquad "by hand".
* **precalc()**: precompute the filter coefficients (a0, b0, etc.) based on the filter parameters (type, f0, Q, dB)
* **setFs(fs)**: resets the sampling rate of the filter. The sampling rate defines how the *f0* of the filter will be interpreted when computing the coefficients.

### p5.FastFourierTransform

*constructor*
* *bufsize*: FFT buffer size (default=512).
* *fs*: sampling rate (default=60).
* *hopsize*: hop size (default=buffer size).

*methods*
* **forward(buffer)**: compute a forward transform (FFT) on the time-domain signal in the *buffer*. Fills the *real*, *imaginary*, *spectrum*, and *phase* Arrays in the object.
* **inverse(real, imag)**: compute an inverse transform (IFFT) on the frequency-domain data in the *real* and *imag* Arrays. If no arguments are supplied, it will use the *real* and *imag* data stored in the object from the last forward transform.
* **calculateSpectrum()**: computes the amplitude (spectrum) and phase data from the real and imaginary.
* **calculateFrequency()**: computes the instantaneous frequencies in the FFT analysis based on running phase.
* **getBandFrequency(index)**: returns the center frequency of an FFT band based on its index.

*properties*
* *doSpectrum*: *boolean* to auto-calculate spectrum (mag/phase) (default=true).
* *doFrequency*: *boolean* to auto-calculate instantaneous frequency from running phase (default=false).
* *magnitude*: *Array* of current spectrum (amplitude) data.
* *phase*: *Array* of current phase data.
* *real*: *Array* containing real part of last FFT.
* *imaginary*: *Array* containing imaginary part of last FFT.
* *frequency*: *Array* of instantaneous frequencies.
* *runningphase*: *Array* of phase deviation.

### Misc. Functions

* **imap(x, a, b, c, d)**: constrained integer mapping function; great for Array index lookups originating from a continuous input. *x* is the input. *a* and *b* are the minimum and maximum range of the expected input. *c* and *d* are the range of the output. Syntactically equivalent to the **map()** function in p5.
* **wrap(x, min, max)** : wrap value *x* between *min* and *max*. Similar to the modulo operator with offset, but works as expected with negative values.
* **fold(x, min, max)** : fold (reflect) value *x* between *min* and *max*. Values out of range will be folded / reflected back in range, alternating between a wrapped and an inverted wrapped value.
* **createArray(len)**: return an n-dimensional Array of length *len*, where *len* can be a list of arguments.
* **normalizeArray(array)**: returns a *normalized* copy of an array (where the absolute maximum value is 1.0).
* **resizeArray(array, newlen)**: returns a copy of *array* resized to length *newlen*. Upsampling is done by linear interpolation.
* **multiplyArray(array1, array2)**: multiplies two arrays into a new array.
* **addArray(array1, array2)**: adds two arrays into a new array.
* **subtractArray(array1, array2)**: subtracts two arrays into a new array.
* **divideArray(array1, array2)**: divides two arrays into a new array.
* **moduloArray(array1, array2)**: returns the remainder of the division of two arrays into a new array.
* **sumArray(array)**: returns the sum of *array*.
* **f2ib(x)**: float->int coercion with bit parity.
* **ib2f(x)**: int->float coercion with bit parity.
* **sinc(x)**: sinc (*sinus cardinalis*) function. Returns f(x).
* **besselI0(x)**: Bessel function. Returns f(x).
* **fplot(array, css)**: formattable console plot of any *array*. *css* parameters are passed as a string to the Javascript console object.
