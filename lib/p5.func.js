/*! p5.func.js v0.0.1 2017-05-27 */
/**
 * @module p5.func
 * @submodule p5.func
 * @for p5.func
 * @main
 */
/**
 *  p5.func
 *  R. Luke DuBois (dubois@nyu.edu)
 *  Integrated Digital Media / Brooklyn Experimental Media Center
 *  New York University
 *  The MIT License (MIT).
 *
 *  https://github.com/IDMNYU/p5.js-func
 *
 *  the p5.func module contains five new objects for extending p5.js :
 *  p5.Gen() : function generators (waveforms, curves, window functions, noise, etc.)
 *  p5.Ease() : easing / interpolation functions
 *  p5.ArrayEval() : equation evaluator to generate pre-computed arrays
 *  p5.Filt() : biquadratic filter object
 *  p5.FastFourierTransform() : signal neutral FFT implementation
 *
 *  p5.func also contains some miscellaneous functions:
 *  imap() : constrainted integer mapping function
 *  wrap() : wrapping function
 *  fold() : folding function
 *  pickrand() : return a random element from an array
 *  createArray()/normalizeArray()/resizeArray()/multiplyArray()/addArray()/sumArray() : array functions
 *  f2ib() / ib2f() : int<->float coercion with bit parity
 *  sinc() : sinc (sinus cardinalis) function
 *  besselI0() : Bessel function
 *  fplot() : formattable console plot of any array
 *
 *  primary sources:
 *  RTcmix Scorefile Commands: http://rtcmix.org/reference/scorefile/
 *  Robert Penner's Easing Functions: http://robertpenner.com/easing/
 *  Golan Levin's Pattern Master: https://github.com/golanlevin/Pattern_Master
 *  Robert Bristow-Johnson's Audio EQ Cookbook: http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt
 *  Corban Brook's dsp.js: https://github.com/corbanbrook/dsp.js/
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define('p5.func', ['p5'], function (p5) { (factory(p5));});
  else if (typeof exports === 'object')
    factory(require('../p5'));
  else
    factory(root['p5']);
}(this, function (p5) {

  // =============================================================================
  //                         p5.Gen
  // =============================================================================

    /**
     * Base class for a function generator
     *
     * @class p5.Gen
     * @constructor
     */
     p5.Gen = function() {
      //
      // this object implements GEN table-style
      // algorithms adapted from MUSICN languages
      // (e.g. Csound, RTcmix, ChucK, Supercollider, Max).
      // these algorithms are solved by direct (0.-1.)
      // evaluation with utility functions to compute arrays.
      //
      // some code below is adapted from RTcmix :
      // https://github.com/RTcmix/RTcmix
      // Copyright (C) 2005  The RTcmix Development Team, released under the Apache 2.0 License
      //

      this.version = 0.01; // just some crap for constructor

      var that = this; // some bullshit

    };     // end p5.Gen constructor

    // harmonic / periodic wave from a list of partial strengths.
    // Csound / RTcmix GEN10, ported from RTcmix.
    p5.Gen.prototype.harmonics = function(_x, _args) {
      var u = true; // single value?
      if(!Array.isArray(_x) && _x.constructor !== Float32Array && _x.constructor !== Float64Array) {
        _x = [_x]; // process all values as arrays
        u = false;
      }
      if(!Array.isArray(_args)) _args = [_args]; // catch single harmonic
      var _sum; // match type:
      if(Array.isArray(_x)) _sum = new Array(_x.length);
      else if(_x.constructor === Float32Array) _sum = new Float32Array(_x.length);
      else if(_x.constructor === Float64Array) _sum = new Float64Array(_x.length);
      for(var i in _x) {
        var j = _args.length;
        _sum[i] = 0.0;
        while (j--) {
          if (_args[j] != 0) {
              var _val = TWO_PI * _x[i] * (j + 1);
              _sum[i] += (sin(_val) * _args[j]);
          }
        }
      }
      return(u ? _sum : _sum[0]);
    };

    // wave from triples (ratio, amp, phase).
    // Csound / RTcmix GEN09, ported from RTcmix.
    p5.Gen.prototype.triples = function(_x, _args) {
      var u = true; // single value?
      if(!Array.isArray(_x) && _x.constructor !== Float32Array && _x.constructor !== Float64Array) {
        _x = [_x]; // process all values as arrays
        u = false;
      }
      if(_args.length<2) {
        console.log("p5.Gen : we need at least 3 arguments!")
        return(0.);
      }
      else if(_args.length%3!=0) {
        console.log("p5.Gen : incomplete <partial, amp, phase> triplet!");
      }
      var _sum; // match type:
      if(Array.isArray(_x)) _sum = new Array(_x.length);
      else if(_x.constructor === Float32Array) _sum = new Float32Array(_x.length);
      else if(_x.constructor === Float64Array) _sum = new Float64Array(_x.length);
      for(i in _x) {
        _sum[i] = 0.0;
        for (var j = _args.length - 1; j > 0; j -= 3) {
          if (_args[j - 1] != 0.0) {
            var val;
            if (_args[j - 2] == 0.0) val = 1.0; // BGG: harmonic 0 (DC)
            else {
              val = sin(TWO_PI * (_x[i] / (1.0 / _args[j - 2]) + _args[j] / 360.0));
            }
            _sum[i] += (val * _args[j - 1]);
          }
        }
      }
      return(u ? _sum : _sum[0]);
    };

    // transfer function from chebyshev polynomials.
    // Csound / RTcmix GEN17, ported from RTcmix.
    p5.Gen.prototype.chebyshev = function(_x, _args) {
      var u = true; // single value?
      if(!Array.isArray(_x) && _x.constructor !== Float32Array && _x.constructor !== Float64Array) {
        _x = [_x]; // process all values as arrays
        u = false;
      }
      if(!Array.isArray(_args)) _args = [_args]; // catch single value
    	// compute the transfer function using the chebyshev equation...
      var _sum // match type:
      if(Array.isArray(_x)) _sum = new Array(_x.length);
      else if(_x.constructor === Float32Array) _sum = new Float32Array(_x.length);
      else if(_x.constructor === Float64Array) _sum = new Float64Array(_x.length);
      for(var i in _x) {
    		var v=_x[i]*2.-1.;
    		_sum[i]=0.;
    		var Tn1=1;
    		var Tn=v;
    		for(var j=0; j<_args.length;j++) {
    			_sum[i]+=_args[j]*Tn;
    			Tn2=Tn1;
    			Tn1=Tn;
    			Tn=2*v*Tn1-Tn2;
    		}
      }
      return(u ? _sum : _sum[0]);
    }

    // linear breakpoint function (time, value pairs with y normalization).
    // Csound GEN27 / RTcmix GEN24, rewritten by rld.
    p5.Gen.prototype.bpf = function(_x, _args) {
      var u = true; // single value?
      if(!Array.isArray(_x) && _x.constructor !== Float32Array && _x.constructor !== Float64Array) {
        _x = [_x]; // process all values as arrays
        u = false;
      }
      if(_args.length%2!=0) {
        console.log("p5.Gen : incomplete <time, value> pair!")
        return(0.);
      }

    	var endtime = _args[_args.length - 2];
    	var starttime = _args[0];
    	if (endtime - starttime <= 0.0) {
        console.log("p5.Gen : bpf times must be in ascending order!");
        return(0.);
      }

    	var scaler = 1.0 / (endtime - starttime);

      var thistime = 0;
      var nexttime = 0;
      var thisval = 0;
      var nextval = 0;
      var _y // match type:
      if(Array.isArray(_x)) _y = new Array(_x.length);
      else if(_x.constructor === Float32Array) _y = new Float32Array(_x.length);
      else if(_x.constructor === Float64Array) _y = new Float64Array(_x.length);
      for(i in _x)
      {
        for (var k = 1; k < _args.length; k += 2) {
          thistime = _args[k-1]*scaler;
          thisval = _args[k];
          if(k<_args.length-1) {
            nexttime = _args[k+1]*scaler;
            nextval = _args[k+2];
          }
          else {
            nexttime = thistime;
            nextval = thisval;
          }
          if(nexttime - thistime < 0.0) { // okay for them to be the same
            console.log("p5.Gen : bpf times music be in ascending order!");
            return(0.);
          }
            if(_x[i]>=thistime && _x[i]<=nexttime) // this point in bpf
            {
              var _thisval = _args[k+1];

              _y[i] = map(_x[i], thistime, nexttime, thisval, nextval);
              break;
            }
          }
      }
      return(u ? _y : _y[0]);
    }

    // common random number distributions.
    // Csound GEN21 / RTcmix GEN20, written by rld.
    // if no seed, auto-generated from millis().
    // algorithms adapted from dodge and jerse (1985).
    // inspired by denis lorrain's
    // 'a panoply of stochastic cannons' (1980):
    // http://www.jstor.org/stable/3679442
    p5.Gen.prototype.random = function(_x, _type) {
      // distributions based on RTcmix GEN20:
      // even distribution ["even" or "linear"]
      // low weighted linear distribution ["low"]
      // high weighted linear distribution ["high"]
      // triangle linear distribution ["triangle"]
      // gaussian distribution ["gaussian"]
      // cauchy distribution ["cauchy"]
      //
      // a -1 in the seed parameter (or missing) will
      // instruct the algorithm to use the millisecond
      // clock for a random seed.

      var u = true; // single value?
      var _s = 0.;

      if(!_x) // no arguments, so do linear with random seed
      {
        _type = 'linear';
        _x = [millis()];
        u = false;
      }
      else if(typeof(_x)!='string') // first argument is a number, so seed
      {
        if(!Array.isArray(arguments[0]) && arguments[0].constructor !== Float32Array && arguments[0].constructor !== Float64Array) {
          _x = [_x]; // process all values as arrays
          u = false;
        }
      }
      else // argument is a string, so type
      {
        _type=_x; // it's the type, not the seed
        _x = [millis()]; // random seed
        u = false;
      }

      var _v; // match type:
      if(Array.isArray(_x)) _v= new Array(_x.length);
      else if(_x.constructor === Float32Array) _v = new Float32Array(_x.length);
      else if(_x.constructor === Float64Array) _v = new Float64Array(_x.length);

      if(_x[0]===-1) randomSeed(millis()*100000.);
      for(var i in _x)
      {
        if(_x[i]!=-1) randomSeed(_x[i]*100000.);
        switch(_type) {
          case "linear":
          case "even":
            _v[i] = random();
            break;
          case "low":
            _v[i] = min(random(), random());
            break;
          case "high":
            _v[i] = max(random(), random());
            break;
          case "triangle":
            _v[i] = (random()+random())/2.0;
            break;
          case "gaussian":
            var n = 12;
            var sigma = 0.166666;
            var randnum = 0.0;
            for (var j = 0; j < n; j++) {
               randnum += random();
            }
            _v[i] = sigma * (randnum - n/2) + 0.5;
            break;
          case "cauchy":
            var alpha = 0.00628338;
            do {
              do {
                _v[i] = random();
              } while (_v[i] == 0.5);
              _v[i] = (alpha * tan(_v[i] * PI)) + 0.5;
            } while (_v[i] < 0.0 || _v[i] > 1.0);
            break;
          default:
            _v[i] = random();
            break;
        }
      }
      return(u ? _v : _v[0]);
    }

    // common window functions for signal processing.
    // Csound GEN20 / RTcmix GEN25 (paris smaragdis / dave topper)
    // and Pattern Master by @golanlevin .
    // rewritten / ported from C and Java by rld.
    // equations from Wikipedia: https://en.wikipedia.org/wiki/Window_function
    p5.Gen.prototype.window = function(_x, _type, _args) {
      // flag order based on CSOUND GEN20:
      // 1 = hamming
      // 2 = hanning
      // 3 = bartlett (triangle)
      // 4 = blackman (3-term)
      // 5 = blackman-harris (4-term)
      // 6 = gaussian
      // 7 = kaiser
      // 8 = rectangle
      // 9 = sinc
      // these and others are addressible by name.
      var u = true; // single value?
      if(!Array.isArray(_args)) _args = [_args]; // catch single value
      if(!Array.isArray(_x) && _x.constructor !== Float32Array && _x.constructor !== Float64Array) {
        _x = [_x]; // process all values as arrays
        u = false;
      }
      var _y; // match type:
      if(Array.isArray(_x)) _y= new Array(_x.length);
      else if(_x.constructor === Float32Array) _y = new Float32Array(_x.length);
      else if(_x.constructor === Float64Array) _y = new Float64Array(_x.length);
      var i;

      switch(_type) {
        // proposed by richard wesley hamming (1915-1998).
        // optimized to quash the nearest sidelobe.
        case 1:
        case "hamming":
          var alpha = 0.54;
          var beta = 0.46;
          for(i in _x) _y[i] = alpha - beta * cos(TWO_PI * _x[i]);
        break;
        // named for julius von hann (1839-1921).
        // sidelobes fall at 18db/oct.
        case 2:
        case "hanning": // not the guy's actual name
        case "vonhann": // the guy's actual name
        case "hann": // sort of the guy's actual name
        case "hannsolo": // no
        case "hanningvonhannmeister": // very much no
          for(i in _x) _y[i] = 0.5 * (1-cos(TWO_PI*_x[i]));
        break;
        // proposed by m.s. bartlett (1910-2002).
        // also by lipót (leopold) fejér (1880-1959).
        // triangular (2nd order b-spline) window.
        case 3:
        case "bartlett":
        case "fejer":
        case "fejér": // get the accent right
        case "triangle":
          for(i in _x) _y[i] = 1.0 - abs((_x[i]-0.5)/0.5);
        break;
        // bartlett-hann window.
        case "bartlett-hann":
          var a0 = 0.62;
          var a1 = 0.48;
          var a2 = 0.38;
          for(i in _x) _y[i] = a0 - a1*abs(_x[i] - 0.5) - a2*cos(2*PI*_x[i]);
        break;
        case 4:
        // proposed by ralph beebe blackman (1904-1990).
        // 'exact' blackman kills sidelobes 3 and 4, but only 6db/oct damping.
        // 'unqualified' blackman still has the sidelobes, but an 18db/oct damping.
        case "blackman":
            // 'exact' blackman:
            var a0 = 7938/18608;
            var a1 = 9240/18608;
            var a2 = 1430/18608;
            // 'unqualified' blackman:
            // var a0 = 0.42;
            // var a1 = 0.5;
            // var a2 = 0.08;
            for(i in _x) _y[i] = a0 - a1 * cos(2.*PI*_x[i]) + a2 * cos(4.*PI*_x[i]);
        break;
        // generalized (variable center) blackman.
        case "generalizedblackman":
          if(!_args[0]) _args[0] = 0.5; // default center
          var _a = _args[0];
          var a0 = (1.0 - _a)/2.0;
          var a1 = 0.5;
          var a2 = _a / 2.0;
          for(i in _x)
          {
            var pix = PI*_x[i];
            _y[i] = a0 - a1*cos(2*pix) + a2*cos(4*pix);
          }
        break;
        // blackman window improved by fred harris (brooklyn poly '61):
        // http://web.mit.edu/xiphmont/Public/windows.pdf
        // 4-term sinc functions to minimize sidelobes.
        case 5:
        case "blackman-harris":
            var a0 = 0.35875;
            var a1 = 0.48829;
            var a2 = 0.14128;
            var a3 = 0.01168;
            for(i in _x) _y[i] = a0 - a1 * cos(2.*PI*_x[i]) + a2 * cos(4.*PI*_x[i]) + a3 * cos(6.*PI*_x[i]);
        break;
        // 4-term blackman-nuttal (same as BH with different coefficients).
        case "blackman-nuttal":
            var a0 = 0.3635819;
            var a1 = 0.4891775;
            var a2 = 0.1365995;
            var a3 = 0.0106411;
            for(i in _x) _y[i] = a0 - a1 * cos(2.*PI*_x[i]) + a2 * cos(4.*PI*_x[i]) + a3 * cos(6.*PI*_x[i]);
        break;
        // 4-term nuttal (same as BH with different coefficients).
        case "nuttal":
            var a0 = 0.355768;
            var a1 = 0.487396;
            var a2 = 0.144232;
            var a3 = 0.012604;
            for(i in _x) _y[i] = a0 - a1 * cos(2.*PI*_x[i]) + a2 * cos(4.*PI*_x[i]) + a3 * cos(6.*PI*_x[i]);
        break;
        // gaussians are eigenfunctions of fourier transforms.
        // gaussian window needs to be zeroed at the ends.
        // parabolic.
        case 6:
        case "gaussian":
          if(!_args[0]) _args[0] = 0.4; // default sigma
          var sigma = _args[0];
          for(i in _x) _y[i] = exp(-0.5 * ((_x[i]-0.5) / (sigma*0.5)) * ((_x[i]-0.5) / (sigma*0.5)));
        break;
        // jim kaiser's 1980 approximation of a DPSS /
        // slepian window using bessel functions,
        // developed at bell labs for audio coding.
        // concentrates the energy in the main lobe.
        case 7:
        case "kaiser":
          var alpha = 3.;
          for(i in _x) {
            var above = PI * alpha * sqrt(1.0 - (2. * _x[i] - 1.0) * (2. * _x[i] - 1.0));
            var below = PI * alpha;
            _y[i] = besselI0(above) / besselI0(below);
          }
        break;
        // an 'unwindow'.  all samples within window envelope are at unity.
        // bad signal-to-noise ratio.  lots of scalloping loss.
        // sometimes named for peter gustav lejeune dirichlet (1805-1859).
        case 8:
        case "rectangle":
        case "boxcar":
        case "dirichlet":
          for(i in _x) _y[i] = 1.; // nothing to it
        break;
        // cosine window
        case "cosine":
          for(i in _x) _y[i] = sin(PI*_x[i]);
        break;
        // named for cornelius lanczos (1906-1974).
        // a normalized (double-window) since function is often
        // used as a kernel for interpolation / low-pass filtering.
        case 9:
        case "sinc":
        case "sync": // learn to spell
        case "lanczos":
          for(i in _x) _y[i] = sinc(2*_x[i]-1.0);
        break;
        // flat top window.
        case "flattop":
          var a0 = 1.000;
          var a1 = 1.930;
          var a2 = 1.290;
          var a3 = 0.388;
          var a4 = 0.032;
          for(i in _x) {
            _y[i] = a0 - a1*cos(2*PI*_x[i]) + a2*cos(4*PI*_x[i]) - a3*cos(6*PI*_x[i]) + a4*cos(8*PI*_x[i]);
            _y[i] /= (a0 + a1 + a2 + a3 + a4);
          }
        break;
        // tukey window courtesy of @golanlevin :
        // The Tukey window, also known as the tapered cosine window,
        // can be regarded as a cosine lobe of width \tfrac{\alpha N}{2}
        // that is convolved with a rectangle window of width \left(1 -\tfrac{\alpha}{2}\right)N.
        // At alpha=0 it becomes rectangular, and at alpha=1 it becomes a Hann window.
        case "tukey":
          if(!_args[0]) _args[0] = 0.5; // default center
          var _a = _args[0];
          var ah = _a/2.0;
          var omah = 1.0 - ah;
          for(i in _x)
          {
            _y[i] = 1.0;
            if (_x[i] <= ah) {
              _y[i] = 0.5 * (1.0 + cos(PI*((2*_x[i]/_a)-1.0)));
            }
            else if (_x[i] > omah) {
              _y[i] = 0.5 * (1.0 + cos(PI*((2*_x[i]/_a)-(2/_a)+1.0)));
            }
          }
        break;
        // adjustable sliding gaussian courtesy of @golanlevin .
        case "slidinggaussian":
          if(!_args[0]) _args[0] = 0.5; // default center
          if(!_args[1]) _args[1] = 0.4; // default sigma
          var dx = 2.0*(_args[0] - 0.5);
          var sigma = _args[1] * 2.;
          for(var i in _x) _y[i] = exp(0.0 - (sq(_x[i]*2.-1.0-dx) / (2.0*sigma*sigma)));
        break;
        // adjustable center cosine window courtesy of @golanlevin .
        case "adjustablecosine":
          if(!_args[0]) _args[0] = 0.5; // default center
          var _a = _args[0];
          var ah = _a/2.0;
          var omah = 1.0 - ah;
          for(i in _x)
          {
            _y[i] = 1.0;
            if (_x[i] <= _a) {
              _y[i] = 0.5 * (1.0 + cos(PI*((_x[i]/_a)-1.0)));
            }
            else {
              _y[i] = 0.5 * (1.0 + cos(PI*(((_x[i]-_a)/(1.0-_a)))));
            }
          }
        break;
        // adjustable center elliptic window courtesy of @golanlevin .
        case "elliptic":
          if(!_args[0]) _args[0] = 0.5; // default center
          var _a = _args[0];
          var min_param_a = 0.0 + Number.EPSILON;
          var max_param_a = 1.0 - Number.EPSILON;
          _a = constrain(_a, min_param_a, max_param_a);
          for(i in _x)
          {
            _y[i] = 0;
            if (_x[i]<=_a){
              _y[i] = (1.0/_a) * sqrt(sq(_a) - sq(_x[i]-_a));
            }
            else {
              _y[i] = (1.0/(1-_a)) * sqrt(sq(1.0-_a) - sq(_x[i]-_a));
            }
          }
        break;
        // adjustable center hyperelliptic window courtesy of @golanlevin .
        case "hyperelliptic":
          if(!_args[0]) _args[0] = 0.5; // default center
          if(!_args[1]) _args[1] = 3; // default order
          var _a = _args[0];
          var _n = _args[1];
          var min_param_a = 0.0 + Number.EPSILON;
          var max_param_a = 1.0 - Number.EPSILON;
          _a = constrain(_a, min_param_a, max_param_a);
          for(i in _x)
          {
            _y[i] = 0;
            var pwn = _n * 2.0;

            if (_x[i]<=_a){
              _y[i] = (1.0/_a) * pow( pow(_a, pwn) - pow(_x[i]-_a, pwn), 1.0/pwn);
            }
            else {
              _y[i] =  ((1.0/ (1-_a)))  * pow( pow(1.0-_a, pwn) - pow(_x[i]-_a, pwn), 1.0/pwn);
            }
          }
        break;
        // adjustable center squircular window courtesy of @golanlevin .
        case "squircular":
          if(!_args[0]) _args[0] = 0.5; // default center
          if(!_args[1]) _args[1] = 3; // default order
          var _a = _args[0];
          var _n = _args[1];
          var min_param_a = 0.0 + Number.EPSILON;
          var max_param_a = 1.0 - Number.EPSILON;
          _a = constrain(_a, min_param_a, max_param_a);
          for(i in _x)
          {
            _y[i] = 0;
            var pwn = max(2, _n * 2.0);

            if (_x[i]<=_a){
              _y[i] = (1-_a) + pow( pow(_a, pwn) - pow(_x[i]-_a, pwn), 1.0/pwn);
            }
            else {
              _y[i] = _a + pow( pow(1.0-_a, pwn) - pow(_x[i]-_a, pwn), 1.0/pwn);
            }
          }
        break;
        // poisson window functions courtesy of @golanlevin .
        case "poisson":
          if(!_args[0]) _args[0] = 0.5; // default center
          var tau = max(_args[0], Number.EPSILON);
          for(var i in _x) _y[i] = exp (0.0 - (abs(_x[i] - 0.5))*(1.0/tau));
        break;
        case "hann-poisson":
        case "poisson-hann":
        case "hannpoisson":
        case "poissonhann":
          if(!_args[0]) _args[0] = 0.5; // default center
          var tau = 25.0 * max(_args[0]*_args[0]*_args[0]*_args[0], Number.EPSILON); // nice control
          for(i in _x) {
            var hy = 0.5 * (1.0 - cos(TWO_PI*_x[i]));
            var py = exp (0.0 - (abs(_x[i] - 0.5))*(1.0/tau));
            _y[i] = hy * py;
          }
        break;
        case "slidinghann-poisson":
        case "slidingpoisson-hann":
        case "slidinghannpoisson":
        case "slidingpoissonhann":
          if(!_args[0]) _args[0] = 0.5; // default center
          if(!_args[1]) _args[1] = 0.5; // default sigma
          var tau = 25.0 * max(_args[1]*_args[1]*_args[1]*_args[1], Number.EPSILON); // nice control
          for(i in _x) {
            var newx = constrain(_x[i] + (0.5 - _args[0]), 0, 1);
            var hy = 0.5 * (1.0 - cos(TWO_PI*newx));
            var py = exp (0.0 - (abs(newx - 0.5))*(1.0/tau));
            _y[i] = hy * py;
          }
        break;
          for(i in _x) _y[i] = _x[i];
        default:
      }
      return(u ? _y : _y[0]);
    }

    // common waveform functions (0-1 evaluation).
    p5.Gen.prototype.waveform = function(_x, _type) {
      // algorithms:
      // sine
      // cosine
      // saw / sawup
      // sawdown
      // phasor (ramp 0.-1.)
      // square
      // rect / rectangle
      // pulse
      // tri / triangle
      // buzz
      var u = true; // single value?
      if(!Array.isArray(_x) && _x.constructor !== Float32Array && _x.constructor !== Float64Array) {
        _x = [_x]; // process all values as arrays
        u = false;
      }
      var _y // match type:
      if(Array.isArray(_x)) _y = new Array(_x.length);
      else if(_x.constructor === Float32Array) _y = new Float32Array(_x.length);
      else if(_x.constructor === Float64Array) _y = new Float64Array(_x.length);
      var i;

      switch(_type) {
        // sine wave 0. to 1. to -1. to 0.
        case "sine":
        case "sin":
          _y = this.harmonics(_x, [1.]);
          break;
        // cosine wave 1. to -1. to 1.
        case "cosine":
        case "cos":
          _y = this.triples(_x, [1., 1., 90]);
          break;
        // rising saw -1. to 1.
        case "saw":
        case "sawtooth":
        case "sawup":
          _y = this.bpf(_x, [0, -1., 1, 1.]);
          break;
        // falling saw 1. to -1.
        case "sawdown":
          _y = this.bpf(_x, [0, 1., 1, -1.]);
          break;
        // phasor ramp 0. to 1.
        case "phasor":
          _y = this.bpf(_x, [0, 0., 1, 1.]);
          break;
        // square wave 1. to -1. (equal duty cycle)
        case "square":
          _y = this.bpf(_x, [0, 1., 1, 1., 1, -1., 2, -1]);
          break;
        // rectangle wave 1. to -1. (10% duty cycle)
        case "rect":
        case "rectangle":
          _y = this.bpf(_x, [0, 1., 1, 1., 1, -1., 10, -1]);
          break;
        // pulse wave 1. to -1. (1% duty cycle)
        case "pulse":
          _y = this.bpf(_x, [0, 1., 1, 1., 1, -1., 100, -1]);
          break;
        // triangle wave 0. to 1. to -1. to 0.
        case "tri":
        case "triangle":
          _y = this.bpf(_x, [0, 0, 1, 1, 2, 0, 3, -1, 4, 0]);
          break;
        // buzz wave (10 harmonics at equal amplitude) 0. to 1. to -1. to 0.
        case "buzz":
          _y = this.harmonics(_x, [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
        break;
        default:
      }
      return(u ? _y : _y[0]);
    }

    // list algorithms
    p5.Gen.prototype.listAlgos = function() {
      var _styles = new Array();
      for(var i in this.__proto__) {
        var _t = true;
        if(i=="listAlgos") _t=false;
        else if(i=="fillArray") _t=false;
        else if(i=="fillFloat32Array") _t=false;
        else if(i=="fillFloat64Array") _t=false;
        if(_t) _styles.push(i);
      }
      return(_styles);
    }

    // array xfer (for pre-rendered use)
    p5.Gen.prototype.fillArray = function(_algo, _len, _args, _seed) {
      var _p = new Array(_len);
      var _dest = new Array(_len);

      if(_algo==='random') { // 4th argument is seed
        for(var i = 0;i<_len;i++)
        {
          if(_seed) _p[i] = i/(_len-1)*10000.+_seed;
          else _p[i] = '-1';
        }
      }
      else {
        for(var i = 0;i<_len;i++)
        {
          _p[i] = i/(_len-1); // 0.-1.
        }
      }
      _dest = this[_algo](_p, _args, _seed);
      return(_dest);
    }

    // array xfer (for pre-rendered use)
    p5.Gen.prototype.fillFloat32Array = function(_algo, _len, _args, _seed) {
      var _p = new Float32Array(_len);
      var _dest = new Float32Array(_len);

      if(_algo==='random') { // 4th argument is seed
        for(var i = 0;i<_len;i++)
        {
          if(_seed) _p[i] = i/(_len-1)*10000.+_seed;
          else _p[i] = '-1';
        }
      }
      else {
        for(var i = 0;i<_len;i++)
        {
          _p[i] = i/(_len-1); // 0.-1.
        }
      }
      _dest = this[_algo](_p, _args, _seed);
      return(_dest);
    }

    // array xfer (for pre-rendered use)
    p5.Gen.prototype.fillFloat64Array = function(_algo, _len, _args, _seed) {
      var _p = new Float64Array(_len);
      var _dest = new Float64Array(_len);

      if(_algo==='random') { // 4th argument is seed
        for(var i = 0;i<_len;i++)
        {
          if(_seed) _p[i] = i/(_len-1)*10000.+_seed;
          else _p[i] = '-1';
        }
      }
      else {
        for(var i = 0;i<_len;i++)
        {
          _p[i] = i/(_len-1); // 0.-1.
        }
      }
      _dest = this[_algo](_p, _args, _seed);
      return(_dest);
    }

  // =============================================================================
  //                         p5.Ease
  // =============================================================================

  /**
   * Base class for an easing function
   *
   * @class p5.Ease
   * @constructor
   */
   p5.Ease = function() {
     //
     // this object generates easing / tweening functions
     // through direct (0.-1.) evaluation, with utilities
     // to pre-evaluate functions into lookup tables.
     //
     // algorithms based on:
     //
     // robert penner's algorithms discussed in
     // 'programming macromedia flash mx' (2002).
     // Copyright (C) 2001  Robert Penner, released under the BSD License
     //
     // golan levin's Pattern_Master functions:
     // https://github.com/golanlevin/Pattern_Master
     // Copyright (C) 2006  Golan Levin
     //
     // some functions have additional parameters,
     // such as an order of interpolation (n) or up to four
     // coefficients (a, b, c, d) which will change the
     // behavior of the easing function.
     //

    this.version = 0.01; // just some crap for constructor

    var that = this; // some bullshit

  };     // end p5.Ease constructor


// Penner's Easing Functions:

  // line y = x
  p5.Ease.prototype.linear = function(_x) {
    return(_x);
  };

  // parabola y = x^2
  p5.Ease.prototype.quadraticIn = function(_x) {
  	return(_x * _x);
  };

  // parabola y = -x^2 + 2x
  p5.Ease.prototype.quadraticOut = function(_x) {
  	return(-(_x * (_x - 2)));
  }

  // piecewise quadratic
  // y = (1/2)((2x)^2)             ; [0, 0.5)
  // y = -(1/2)((2x-1)*(2x-3) - 1) ; [0.5, 1]
  p5.Ease.prototype.quadraticInOut = function(_x) {
  	if(_x < 0.5)
  	{
  		return(2 * _x * _x);
  	}
  	else
  	{
  		return((-2 * _x * _x) + (4 * _x) - 1);
  	}
  }

  // cubic y = x^3
  p5.Ease.prototype.cubicIn = function(_x) {
  	return(_x * _x * _x);
  }

  // cubic y = (x - 1)^3 + 1
  p5.Ease.prototype.cubicOut = function(_x) {
  	var _v = (_x - 1);
  	return(_v * _v * _v + 1);
  }

  // piecewise cubic
  // y = (1/2)((2x)^3)       ; [0, 0.5)
  // y = (1/2)((2x-2)^3 + 2) ; [0.5, 1]
  p5.Ease.prototype.cubicInOut = function(_x) {
  	if(_x < 0.5)
  	{
  		return(4 * _x * _x * _x);
  	}
  	else
  	{
  		var _v = ((2 * _x) - 2);
  		return(0.5 * _v * _v * _v + 1);
  	}
  }

  // quartic x^4
  p5.Ease.prototype.quarticIn = function(_x) {
  	return(_x * _x * _x * _x);
  }

  // quartic y = 1 - (x - 1)^4
  p5.Ease.prototype.quarticOut = function(_x) {
  	var _v = (_x - 1);
  	return(_v * _v * _v * (1 - _x) + 1);
  }

  // piecewise quartic
  // y = (1/2)((2x)^4)        ; [0, 0.5)
  // y = -(1/2)((2x-2)^4 - 2) ; [0.5, 1]
  p5.Ease.prototype.quarticInOut = function(_x) {
  	if(_x < 0.5)
  	{
  		return(8 * _x * _x * _x * _x);
  	}
  	else
  	{
  		var _v = (_x - 1);
  		return(-8 * _v * _v * _v * _v + 1);
  	}
  }

  // quintic y = x^5
  p5.Ease.prototype.quinticIn = function(_x) {
  	return(_x * _x * _x * _x * _x);
  }

  // quintic y = (x - 1)^5 + 1
  p5.Ease.prototype.quinticOut = function(_x) {
  	var _v = (_x - 1);
  	return(_v * _v * _v * _v * _v + 1);
  }

  // piecewise quintic
  // y = (1/2)((2x)^5)       ; [0, 0.5)
  // y = (1/2)((2x-2)^5 + 2) ; [0.5, 1]
  p5.Ease.prototype.quinticInOut = function(_x) {
  	if(_x < 0.5)
  	{
  		return(16 * _x * _x * _x * _x * _x);
  	}
  	else
  	{
  		var _v = ((2 * _x) - 2);
  		return(0.5 * _v * _v * _v * _v * _v + 1);
  	}
  }

  // quarter-cycle sine
  p5.Ease.prototype.sineIn = function(_x) {
  	return(sin((_x - 1) * HALF_PI) + 1);
  }

  // quarter-cycle cosine
  p5.Ease.prototype.sineOut = function(_x) {
  	return(sin(_x * HALF_PI));
  }

  // half sine
  p5.Ease.prototype.sineInOut = function(_x) {
  	return(0.5 * (1 - cos(_x * PI)));
  }

  // shifted quadrant IV of unit circle
  p5.Ease.prototype.circularIn = function(_x) {
  	return(1 - sqrt(1 - (_x * _x)));
  }

  // shifted quadrant II of unit circle
  p5.Ease.prototype.circularOut = function(_x) {
  	return(sqrt((2 - _x) * _x));
  }

  // piecewise circular function
  // y = (1/2)(1 - sqrt(1 - 4x^2))           ; [0, 0.5)
  // y = (1/2)(sqrt(-(2x - 3)*(2x - 1)) + 1) ; [0.5, 1]
  p5.Ease.prototype.circularInOut = function(_x) {
  	if(_x < 0.5)
  	{
  		return(0.5 * (1 - sqrt(1 - 4 * (_x * _x))));
  	}
  	else
  	{
  		return(0.5 * (sqrt(-((2 * _x) - 3) * ((2 * _x) - 1)) + 1));
  	}
  }

  // exponential function y = 2^(10(x - 1))
  p5.Ease.prototype.exponentialIn = function(_x) {
  	return((_x == 0.0) ? _x : pow(2, 10 * (_x - 1)));
  }

  // exponential function y = -2^(-10x) + 1
  p5.Ease.prototype.exponentialOut = function(_x) {
  	return((_x == 1.0) ? _x : 1 - pow(2, -10 * _x));
  }

  // piecewise exponential
  // y = (1/2)2^(10(2x - 1))         ; [0,0.5)
  // y = -(1/2)*2^(-10(2x - 1))) + 1 ; [0.5,1]
  p5.Ease.prototype.exponentialInOut = function(_x) {
  	if(_x == 0.0 || _x == 1.0) return _x;

  	if(_x < 0.5)
  	{
  		return(0.5 * pow(2, (20 * _x) - 10));
  	}
  	else
  	{
  		return(-0.5 * pow(2, (-20 * _x) + 10) + 1);
  	}
  }

  // damped sine wave y = sin(13pi/2*x)*pow(2, 10 * (x - 1))
  p5.Ease.prototype.elasticIn = function(_x) {
  	return(sin(13 * HALF_PI * _x) * pow(2, 10 * (_x - 1)));
  }

  // damped sine wave y = sin(-13pi/2*(x + 1))*pow(2, -10x) + 1
  p5.Ease.prototype.elasticOut = function(_x) {
  	return(sin(-13 * HALF_PI * (_x + 1)) * pow(2, -10 * _x) + 1);
  }

  // piecewise damped sine wave:
  // y = (1/2)*sin(13pi/2*(2*x))*pow(2, 10 * ((2*x) - 1))      ; [0,0.5)
  // y = (1/2)*(sin(-13pi/2*((2x-1)+1))*pow(2,-10(2*x-1)) + 2) ; [0.5, 1]
  p5.Ease.prototype.elasticInOut = function(_x) {
  	if(_x < 0.5)
  	{
  		return(0.5 * sin(13 * HALF_PI * (2 * _x)) * pow(2, 10 * ((2 * _x) - 1)));
  	}
  	else
  	{
  		return(0.5 * (sin(-13 * HALF_PI * ((2 * _x - 1) + 1)) * pow(2, -10 * (2 * _x - 1)) + 2));
  	}
  }

  // overshooting cubic y = x^3-x*sin(x*pi)
  p5.Ease.prototype.backIn = function(_x) {
  	return(_x * _x * _x - _x * sin(_x * PI));
  }

  // overshooting cubic y = 1-((1-x)^3-(1-x)*sin((1-x)*pi))
  p5.Ease.prototype.backOut = function(_x) {
  	var f = (1 - _x);
  	return(1 - (f * f * f - f * sin(f * PI)));
  }

  // piecewise overshooting cubic function:
  // y = (1/2)*((2x)^3-(2x)*sin(2*x*pi))           ; [0, 0.5)
  // y = (1/2)*(1-((1-x)^3-(1-x)*sin((1-x)*pi))+1) ; [0.5, 1]
  p5.Ease.prototype.backInOut = function(_x) {
  	if(_x < 0.5)
  	{
  		var f = 2 * _x;
  		return(0.5 * (f * f * f - f * sin(f * PI)));
  	}
  	else
  	{
  		var f = (1 - (2*_x - 1));
  		return(0.5 * (1 - (f * f * f - f * sin(f * PI))) + 0.5);
  	}
  }

  // penner's four-part bounce algorithm
  p5.Ease.prototype.bounceIn = function(_x) {
  	return(1 - this.bounceOut(1 - _x));
  }

  // penner's four-part bounce algorithm
  p5.Ease.prototype.bounceOut = function(_x) {
  	if(_x < 4/11.0)
  	{
  		return((121 * _x * _x)/16.0);
  	}
  	else if(_x < 8/11.0)
  	{
  		return((363/40.0 * _x * _x) - (99/10.0 * _x) + 17/5.0);
  	}
  	else if(_x < 9/10.0)
  	{
  		return((4356/361.0 * _x * _x) - (35442/1805.0 * _x) + 16061/1805.0);
  	}
  	else
  	{
  		return((54/5.0 * _x * _x) - (513/25.0 * _x) + 268/25.0);
  	}
  }

  // piecewise penner's four-part bounce algorithm
  p5.Ease.prototype.bounceInOut = function(_x) {
  	if(_x < 0.5)
  	{
  		return(0.5 * this.bounceIn(_x*2));
  	}
  	else
  	{
  		return(0.5 * this.bounceOut(_x * 2 - 1) + 0.5);
  	}
  }

// Golan's Pattern Master Functions:

  // bryce summers' cubic easing function (@Bryce-Summers)
  p5.Ease.prototype.brycesCubic = function(_x, _n)
  {
    if(!_n) _n = 3; // default
    var p = pow(_x, _n-1);
    var xn = p * _x;
    return(_n*p - (_n-1)*xn);
  }

  // staircase function - n is # of steps
  p5.Ease.prototype.staircase = function(_x, _n)
  {
    if(!_n) _n = 3; // default
    var _y = floor(_x*_n) / (_n-1);
    if(_x>=1.) _y=1.;
    return(_y);
  }

  // staircase function with smoothing - a is smoothing, n is # of steps
  p5.Ease.prototype.exponentialSmoothedStaircase = function(_x, _a, _n)
  {
    if(!_a) _a = 0.25; // default
    if(!_n) _n = 3; // default
    // See http://web.mit.edu/fnl/volume/204/winston.html

     var fa = sq (map(_a, 0,1, 5,30));
     var _y = 0;
     for (var i=0; i<_n; i++){
       _y += (1.0/(_n-1.0))/ (1.0 + exp(fa*(((i+1.0)/_n) - _x)));
     }
     _y = constrain(_y, 0,1);
     return(_y);
  }

  // gompertz curve
  // http://en.wikipedia.org/wiki/Gompertz_curve
  p5.Ease.prototype.gompertz = function(_x, _a)
  {
    if(!_a) _a = 0.25; // default
    var min_param_a = 0.0 + Number.EPSILON;
    _a = max(_a, min_param_a);

    var b = -8.0;
    var c = 0 - _a*16.0;
    var _y = exp( b * exp(c * _x));

    var maxVal = exp(b * exp(c));
    var minVal = exp(b);
    _y = map(_y, minVal, maxVal, 0, 1);

    return(_y);
  }

  // clamped processing map function with terms reordered:
  // min in, max in, min out, max out
  p5.Ease.prototype.generalizedLinearMap = function(_x, _a, _b, _c, _d)
  {
    if(!_a) _a = 0.; // default
    if(!_b) _b = 0.; // default
    if(!_c) _c = 1.; // default
    if(!_d) _d = 1.; // default

    var _y = 0;

    if (_a < _c) {
      if (_x <= _a) {
        _y = _b;
      }
      else if (_x >= _c) {
        _y = _d;
      }
      else {
        _y = map(_x, _a, _c, _b, _d);
      }
    }
    else {
      if (_x <= _c) {
        _y = _d;
      }
      else if (_x >= _a) {
        _y = _b;
      }
      else {
        _y = map(_x, _c, _a, _d, _b);
      }
    }

    return(_y);
  }

  // double-(odd) polynomial ogee
  // what the hell is an ogee, you may ask?
  // https://en.wikipedia.org/wiki/Ogee
  p5.Ease.prototype.doubleOddPolynomialOgee = function(_x, _a, _b, _n)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default
    if(!_n) _n = 3; // default
    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    var min_param_b = 0.0;
    var max_param_b = 1.0;

    _a = constrain(_a, min_param_a, max_param_a);
    _b = constrain(_b, min_param_b, max_param_b);
    var p = 2*_n + 1;
    var _y = 0;
    if (_x <= _a) {
      _y = _b - _b*pow(1-_x/_a, p);
    }
    else {
      _y = _b + (1-_b)*pow((_x-_a)/(1-_a), p);
    }

    return(_y);
  }

  // double-linear interpolator
  p5.Ease.prototype.doubleLinear = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    var _y = 0;
    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    var min_param_b = 0.0;
    var max_param_b = 1.0;
    _a = constrain(_a, min_param_a, max_param_a);
    _b = constrain(_b, min_param_b, max_param_b);

    if (_x<=_a) {
      _y = (_b/_a) * _x;
    }
    else {
      _y = _b + ((1-_b)/(1-_a))*(_x-_a);
    }

    return(_y);
  }

  // triple-linear interpolator
  p5.Ease.prototype.tripleLinear = function(_x, _a, _b, _c, _d)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default
    if(!_c) _c = 0.75; // default
    if(!_d) _d = 0.25; // default

    var _y = 0;
    if (_a < _c) {
      if (_x <= _a) {
        _y = map(_x, 0, _a, 0, _b);
      }
      else if (_x >= _c) {
        _y = map(_x, _c, 1, _d, 1);
      }
      else {
        _y = map(_x, _a, _c, _b, _d);
      }
    }
    else {
      if (_x <= _c) {
        _y = map(_x, 0, _c, 0, _d);
      }
      else if (_x >= _a) {
        _y = map(_x, _a, 1, _b, 1);
      }
      else {
        _y = map(_x, _c, _a, _d, _b);
      }
    }
    return(_y);

  }

  // variable staircase interpolator
  p5.Ease.prototype.variableStaircase = function(_x, _a, _n)
  {
    if(!_a) _a = 0.25; // default
    if(!_n) _n = 3; // default

    var aa = (_a - 0.5);
    if (aa == 0) {
      return(_x);
    }

    var x0 = (floor (_x*_n))/ _n;
    var x1 = (ceil  (_x*_n))/ _n;
    var y0 = x0;
    var y1 = x1;

    var px = 0.5*(x0+x1) + aa/_n;
    var py = 0.5*(x0+x1) - aa/_n;

    var _y = 0;
    if ((_x < px) && (_x > x0)) {
      _y = map(_x, x0, px, y0, py);
    }
    else {
      _y = map(_x, px, x1, py, y1);
    }

    return(_y);
  }

  // quadratic bezier staircase function
  p5.Ease.prototype.quadraticBezierStaircase = function(_x, _a, _n)
  {
    if(!_a) _a = 0.25; // default
    if(!_n) _n = 3; // default

    var aa = (_a - 0.5);
    if (aa == 0) {
      return(_x);
    }

    var x0 = (floor (_x*_n))/ _n;
    var x1 = (ceil  (_x*_n))/ _n;
    var y0 = x0;
    var y1 = x1;

    var px = 0.5*(x0+x1) + aa/_n;
    var py = 0.5*(x0+x1) - aa/_n;

    var p0x = (x0 + px)/2.0;
    var p0y = (y0 + py)/2.0;
    var p1x = (x1 + px)/2.0;
    var p1y = (y1 + py)/2.0;

    var _y = 0;
    var denom = (1.0/_n)*0.5;

    if ((_x <= p0x) && (_x >= x0)) {
      // left side
      if (floor (_x*_n) <= 0){
        _y = map(_x, x0, px, y0, py);
      } else {
        if (abs(_x - x0) < Number.EPSILON){
          // problem when x == x0 !
        }

        var za = (x0  - (p1x - 1.0/_n))/denom;
        var zb = (y0  - (p1y - 1.0/_n))/denom;
        var zx = (_x  - (p1x - 1.0/_n))/denom;
        var om2a = 1.0 - 2.0*za;

        var interior = max (0, za*za + om2a*zx);
        var t = (sqrt(interior) - za)/om2a;
        var zy = (1.0-2.0*zb)*(t*t) + (2*zb)*t;
        zy *= (p1y - p0y);
        zy += p1y; //(p1y - 1.0/n);
        if (_x > x0){
          zy -= 1.0/_n;
        }
        _y = zy;
      }
    }

    else if ((_x >= p1x) && (_x <= x1)) {
      // right side
      if (ceil(_x*_n) >= _n) {
        _y = map(_x, px, x1, py, y1);
      }
      else {
        if (abs(_x - x1) < Number.EPSILON){
          // problem when x == x1 !
        }

        var za = (x1 - p1x)/denom;
        var zb = (y1 - p1y)/denom;
        var zx = (_x - p1x)/denom;
        if (za == 0.5) {
          za += Number.EPSILON;
        }
        var om2a = 1.0 - 2.0*za;
        if (abs(om2a) < Number.EPSILON) {
          om2a = ((om2a < 0) ? -1:1) * Number.EPSILON;
        }

        var interior = max (0, za*za + om2a*zx);
        var t = (sqrt(interior) - za)/om2a;
        var zy = (1.0-2.0*zb)*(t*t) + (2*zb)*t;
        zy *= (p1y - p0y);
        zy += p1y;
        _y = zy;
      }
    }

    else {
      // center
      var za = (px - p0x)/denom;
      var zb = (py - p0y)/denom;
      var zx = (_x - p0x)/denom;
      if (za == 0.5) {
        za += Number.EPSILON;
      }
      var om2a = 1.0 - 2.0*za;
      var t = (sqrt(za*za + om2a*zx) - za)/om2a;
      var zy = (1.0-2.0*zb)*(t*t) + (2*zb)*t;
      zy *= (p1y - p0y);
      zy += p0y;
      _y = zy;
    }

    return(_y);
  }

  // symmetric double-element sigmoid function (a is slope)
  // https://en.wikipedia.org/wiki/Sigmoid_function
  p5.Ease.prototype.doubleExponentialSigmoid = function(_x, _a)
  {
    if(!_a) _a = 0.75; // default

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    _a = constrain(_a, min_param_a, max_param_a);
    _a = 1-_a;

    var _y = 0;
    if (_x<=0.5){
      _y = (pow(2.0*_x, 1.0/_a))/2.0;
    }
    else {
      _y = 1.0 - (pow(2.0*(1.0-_x), 1.0/_a))/2.0;
    }
    return(_y);
  }

  // double-element sigmoid function with an adjustable center (b is center)
  p5.Ease.prototype.adjustableCenterDoubleExponentialSigmoid = function(_x, _a, _b)
  {
    if(!_a) _a = 0.75; // default
    if(!_b) _b = 0.5; // default

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    _a = constrain(_a, min_param_a, max_param_a);
    _a = 1-_a;

    var _y = 0;
    var w = max(0, min(1, _x-(_b-0.5)));
    if (w<=0.5){
      _y = (pow(2.0*w, 1.0/_a))/2.0;
    }
    else {
      _y = 1.0 - (pow(2.0*(1.0-w), 1.0/_a))/2.0;
    }

    return(_y);
  }

  // quadratic sigmoid function
  p5.Ease.prototype.doubleQuadraticSigmoid = function(_x)
  {
    var _y = 0;
    if (_x<=0.5){
      _y = sq(2.0*_x)/2.0;
    }
    else {
      _y = 1.0 - sq(2.0*(_x-1.0))/2.0;
    }

    return(_y);
  }

  // double polynomial sigmoid function
  p5.Ease.prototype.doublePolynomialSigmoid = function(_x, _n)
  {
    if(!_n) _n = 3; // default

    var _y = 0;
    if (_n%2 == 0){
      // even polynomial
      if (_x<=0.5){
        _y = pow(2.0*_x, _n)/2.0;
      }
      else {
        _y = 1.0 - pow(2*(_x-1.0), _n)/2.0;
      }
    }

    else {
      // odd polynomial
      if (_x<=0.5){
        _y = pow(2.0*_x, _n)/2.0;
      }
      else {
        _y = 1.0 + pow(2.0*(_x-1.0), _n)/2.0;
      }

    }

    return(_y);
  }

  // double elliptic ogee
  // http://www.flong.com/texts/code/shapers_circ/
  p5.Ease.prototype.doubleEllipticOgee = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    _a = constrain(_a, min_param_a, max_param_a);
    var _y = 0;

    if (_x<=_a){
      _y = (_b/_a) * sqrt(sq(_a) - sq(_x-_a));
    }
    else {
      _y = 1.0 - ((1.0-_b)/(1.0-_a))*sqrt(sq(1.0-_a) - sq(_x-_a));
    }

    return(_y);
  }

  // double-cubic ogee
  p5.Ease.prototype.doubleCubicOgee = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    var min_param_b = 0.0;
    var max_param_b = 1.0;

    _a = constrain(_a, min_param_a, max_param_a);
    _b = constrain(_b, min_param_b, max_param_b);

    var _y = 0;
    if (_x <= _a){
      _y = _b - _b*pow(1.0-_x/_a, 3.0);
    }
    else {
      _y = _b + (1.0-_b)*pow((_x-_a)/(1.0-_a), 3.0);
    }

    return(_y);
  }

  // double circular sigmoid function
  p5.Ease.prototype.doubleCircularSigmoid = function(_x, _a)
  {
    if(!_a) _a = 0.25; // default

    var _y = 0;
    if (_x<=_a) {
      _y = _a - sqrt(_a*_a - _x*_x);
    }
    else {
      _y = _a + sqrt(sq(1.0-_a) - sq(_x-1.0));
    }

    return(_y);
  }

  // double squircular sigmoid function
  p5.Ease.prototype.doubleSquircularSigmoid = function(_x, _a, _n)
  {
    if(!_a) _a = 0.25; // default
    if(!_n) _n = 3; // default

    var pwn = max(2, _n * 2.0);
    var _y = 0;
    if (_x<=_a) {
      _y = _a - pow( pow(_a,pwn) - pow(_x,pwn), 1.0/pwn);
    }
    else {
      _y = _a + pow(pow(1.0-_a, pwn) - pow(_x-1.0, pwn), 1.0/pwn);
    }

    return(_y);
  }

  // double quadratic bezier curve
  // http://engineeringtraining.tpub.com/14069/css/14069_150.htm
  p5.Ease.prototype.doubleQuadraticBezier = function(_x, _a, _b, _c, _d)
  {
    // produces mysterious values when a=0,b=1,c=0.667,d=0.417

    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default
    if(!_c) _c = 0.75; // default
    if(!_d) _d = 0.25; // default

    var xmid = (_a + _c)/2.0;
    var ymid = (_b + _d)/2.0;
    xmid = constrain (xmid, Number.EPSILON, 1.0-Number.EPSILON);
    ymid = constrain (ymid, Number.EPSILON, 1.0-Number.EPSILON);

    var _y = 0;
    var om2a;
    var t;
    var xx;
    var aa;
    var bb;

    if (_x <= xmid){
      xx = _x / xmid;
      aa = _a / xmid;
      bb = _b / ymid;
      om2a = 1.0 - 2.0*aa;
      if (om2a == 0) {
         om2a = Number.EPSILON;
      }
      t = (sqrt(aa*aa + om2a*xx) - aa)/om2a;
      _y = (1.0-2.0*bb)*(t*t) + (2*bb)*t;
      _y *= ymid;
    }
    else {
       xx = (_x - xmid)/(1.0-xmid);
       aa = (_c - xmid)/(1.0-xmid);
       bb = (_d - ymid)/(1.0-ymid);
       om2a = 1.0 - 2.0*aa;
       if (om2a == 0) {
         om2a = Number.EPSILON;
       }
       t = (sqrt(aa*aa + om2a*xx) - aa)/om2a;
       _y = (1.0-2.0*bb)*(t*t) + (2*bb)*t;
       _y *= (1.0 - ymid);
       _y += ymid;
    }

    return(_y);
  }

  // double-elliptic sigmoid function
  p5.Ease.prototype.doubleEllipticSigmoid = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    var _y = 0;
    if (_x<=_a){
      if (_a <= 0){
        _y = 0;
      } else {
        _y = _b * (1.0 - (sqrt(sq(_a) - sq(_x))/_a));
      }
    }
    else {
      if (_a >= 1){
        _y = 1.0;
      } else {
        _y = _b + ((1.0-_b)/(1.0-_a))*sqrt(sq(1.0-_a) - sq(_x-1.0));
      }
    }

    return(_y);
  }

  // simplified double-cubic ogee
  p5.Ease.prototype.doubleCubicOgeeSimplified = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    _b = 1 - _b; //reverse, for intelligibility.

    var _y = 0;
    if (_x<=_a){
      if (_a <= 0){
        _y = 0;
      } else {
        var val = 1 - _x/_a;
        _y = _b*_x + (1-_b)*_a*(1.0- val*val*val);
      }
    }
    else {
      if (_a >= 1){
        _y = 1;
      } else {
        var val = (_x-_a)/(1-_a);
        _y = _b*_x + (1-_b)*(_a + (1-_a)* val*val*val);
      }
    }

    return(_y);
  }

  // raised inverted cosine function
  p5.Ease.prototype.raisedInvertedCosine = function(_x)
  {
    var _y = (1.0 - cos(PI*_x))/2.0;

    return(_y);
  }

  // blinn / wyvill's cosine approximation
  // http://www.flong.com/texts/code/shapers_poly/
  p5.Ease.prototype.cosineApproximation = function(_x)
  {
    var x2 = _x*_x;
    var x4 = x2*x2;
    var x6 = x4*x2;
    var fa = (4.0/9.0);
    var fb = (17.0/9.0);
    var fc = (22.0/9.0);
    var _y = fa*x6 - fb*x4 + fc*x2;

    return(_y);
  }

  // smoothstep function
  // https://en.wikipedia.org/wiki/Smoothstep
  p5.Ease.prototype.smoothStep = function(_x)
  {
    return(_x*_x*(3.0 - 2.0*_x));
  }

  // ken perlin's 'smoother step' smoothstep function
  // https://www.amazon.com/Texturing-Modeling-Third-Procedural-Approach/dp/1558608486
  p5.Ease.prototype.smootherStep = function(_x)
  {
    return(_x*_x*_x*(_x*(_x*6.0 - 15.0) + 10.0));
  }

  // maclaurin cosine approximation
  // http://blogs.ubc.ca/infiniteseriesmodule/units/unit-3-power-series/taylor-series/the-maclaurin-expansion-of-cosx/
  p5.Ease.prototype.maclaurinCosine = function(_x)
  {
    var nTerms = 6; // anything less is fouled

    _x *= PI;
    var xp = 1.0;
    var x2 = _x*_x;

    var sig  = 1.0;
    var fact = 1.0;
    var _y = xp;

    for (var i=0; i<nTerms; i++) {
      xp   *= x2;
      sig  = 0-sig;
      fact *= (i*2+1);
      fact *= (i*2+2);
      _y  += sig * (xp / fact);
    }

    _y = (1.0 - _y)/2.0;

    return(_y);
  }

  // paul bourke's catmull rom spline
  // https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
  // from http://paulbourke.net/miscellaneous/interpolation/
  p5.Ease.prototype.catmullRomInterpolate = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    var y0 = _a;
    var y3 = _b;
    var x2 = _x*_x;

    var a0 = -0.5*y0 + 0.5*y3 - 1.5 ;
    var a1 =      y0 - 0.5*y3 + 2.0 ;
    var a2 = -0.5*y0          + 0.5 ;

    var _y = a0*_x*x2 + a1*x2 + a2*_x;

    return(constrain(_y, 0, 1));
  }

  // hermite polynomial function
  // https://en.wikipedia.org/wiki/Hermite_polynomials
  // from http://musicdsp.org/showArchiveComment.php?ArchiveID=93
  // by Laurent de Soras
  p5.Ease.prototype.hermite = function(_x, _a, _b, _c, _d)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.; // default - ???
    if(!_c) _c = 1.; // default - ???
    if(!_d) _d = 0.25; // default

    _a = map(_a, 0,1, -1,1);
    _c = map(_c, 0,1, -1,1);

    var hC = (_c - _a) * 0.5;
    var hV = (_b - _c);
    var hW = hC + hV;
    var hA = hW + hV + (_d - _b) * 0.5;
    var hB = hW + hA;

    var _y = (((hA * _x) - hB) * _x + hC) * _x + _b;

    return(_y);
  }

  // hermite polynomial function
  // from http://paulbourke.net/miscellaneous/interpolation/
  p5.Ease.prototype.hermite2 = function(_x, _a, _b, _c, _d)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default
    if(!_c) _c = 0.75; // default
    if(!_d) _d = 0.25; // default

    //
    // Tension: 1 is high, 0 normal, -1 is low
    // Bias: 0 is even, positive is towards first segment, negative towards the other
    //

    var tension = map (_c, 0,1, -1,1);
    var bias    = map (_d, 0,1, -1,1);

    var y0 = 2.0 * (_a - 0.5);  //? a
    var y1 = 0.0;
    var y2 = 1.0;
    var y3 = _b;

    var x2 = _x * _x;
    var x3 = x2 * _x;

    var m0, m1;
    m0  = (y1-y0)*(1.0+bias)*(1.0-tension)/2.0;
    m0 += (y2-y1)*(1.0-bias)*(1.0-tension)/2.0;
    m1  = (y2-y1)*(1.0+bias)*(1.0-tension)/2.0;
    m1 += (y3-y2)*(1.0-bias)*(1.0-tension)/2.0;

    var a0  =  2.0*x3 - 3.0*x2 + 1.0;
    var a1  =      x3 - 2.0*x2 + _x;
    var a2  =      x3 -     x2;
    var a3  = -2.0*x3 + 3.0*x2;

    var _y = a0*y1 + a1*m0 + a2*m1 + a3*y2;

    return(_y);
  }

  // error function
  // http://en.wikipedia.org/wiki/Error_function
  // Note that this implementation is a shifted, scaled and normalized error function!
  p5.Ease.prototype.normalizedErf = function(_x)
  {
    var erfBound = 2.0; // set bounds for artificial "normalization"
    var erfBoundNorm = 0.99532226501; // this = erf(2.0), i.e., erf(erfBound)
    var z = map(_x, 0.0, 1.0, 0-erfBound, erfBound);

    var z2 = z*z;
    var a = (8.0*(PI-3.0)) / ((3*PI)*(4.0-PI));
    var _y = sqrt (1.0 - exp(0 - z2*(  (a*z2 + 4.0/PI) / (a*z2 + 1.0))));
    if (z < 0.0) _y = 0-_y;

    _y /= erfBoundNorm;
    _y = (_y+1.0) / 2.0;

    return(_y);
  }

  // inverse error function
  p5.Ease.prototype.normalizedInverseErf = function(_x)
  {
    var erfBound = 2.0;
    var erfBoundNorm = 0.99532226501; // this = erf(2.0), i.e., erf(erfBound)
    var z = map(_x, 0, 1, -erfBoundNorm, erfBoundNorm);
    var z2 = z*z;
    var a = (8.0*(PI-3.0)) / ((3*PI)*(4.0-PI));

    var A = (2.0 / (PI *a)) + (log(1.0-z2) / 2.0);
    var B = (log(1.0-z2) / a);
    var _y = sqrt( sqrt(A*A - B) - A );

    if (z < 0.0) _y = 0-_y;
    _y /= erfBound;
    _y = (_y+1.0);
    _y /= 2.0;

    _y = constrain(_y, 0, 1);  // necessary

    return(_y);
  }

  // exponential emphasis function
  p5.Ease.prototype.exponentialEmphasis = function(_x, _a)
  {
    if(!_a) _a = 0.25; // default

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    _a = constrain(_a, min_param_a, max_param_a);

    if (_a < 0.5) {
      // emphasis
      _a = 2*(_a);
      var _y = pow(_x, _a);
      return(_y);
    }
    else {
      // de-emphasis
      _a = 2*(_a-0.5);
      var _y = pow(_x, 1.0/(1-_a));
      return(_y);
    }
  }

  // iterative square root
  // http://en.wikipedia.org/wiki/Methods_of_computing_square_roots
  // ancient babylonian technology
  p5.Ease.prototype.iterativeSquareRoot = function(_x)
  {
    var _y = 0.5;
    var n = 6;
    for (var i=0; i<n; i++) {
      _y = (_y + _x/_y)/2.0;
    }

    return(_y);
  }

  // fast inverse square root
  // http://en.wikipedia.org/wiki/Fast_inverse_square_root
  // http://stackoverflow.com/questions/11513344/how-to-implement-the-fast-inverse-square-root-in-java
  p5.Ease.prototype.fastSquareRoot = function(_x)
  {
    var xhalf = 0.5 * _x;

    var i = f2ib(_x);

    i = 0x5f3759df - (i>>1);

    _x = ib2f(i);

    _x = _x*(1.5 - xhalf*_x*_x);
    return(1.0/_x);
  }

  // symmetric double-exponential ogee
  p5.Ease.prototype.doubleExponentialOgee = function(_x, _a)
  {
    if(!_a) _a = 0.25; // default

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    _a = constrain(_a, min_param_a, max_param_a);

    var _y = 0;
    if (_x<=0.5){
      _y = (pow(2.0*_x, 1.0-_a))/2.0;
    }
    else {
      _y = 1.0 - (pow(2.0*(1.0-_x), 1.0-_a))/2.0;
    }

    return(_y);
  }

  // joining two lines with a circular arc fillet
  // Adapted from robert d. miller / graphics gems
  // http://www.realtimerendering.com/resources/GraphicsGems/gemsiii/fillet.c
  p5.Ease.prototype.circularFillet = function(_x, _a, _b, _c)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default
    if(!_c) _c = 0.75; // default

    var arcStartAngle = 0;
    var arcEndAngle = 0;
    var arcStartX = 0;
    var arcStartY = 0;
    var arcEndX = 0;
    var arcEndY = 0;
    var arcCenterX = 0;
    var arcCenterY = 0;
    var arcRadius = 0;

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    var min_param_b = 0.0 + Number.EPSILON;
    var max_param_b = 1.0 - Number.EPSILON;
    _a = constrain(_a, min_param_a, max_param_a);
    _b = constrain(_b, min_param_b, max_param_b);

    var R = _c;

    // helper function:
    // return signed distance from line Ax + By + C = 0 to point P.
    function linetopoint(a, b, c, ptx, pty) {
      var lp = 0.0;
      var d = sqrt((a*a)+(b*b));
      if (d != 0.0) {
        lp = (a*ptx + b*pty + c)/d;
      }
      return(lp);
    }

    // compute fillet parameters:
    computefillet: {
      var p1x = 0;
      var p1y = 0;
      var p2x = _a;
      var p2y = _b;
      var p3x = _a;
      var p3y = _b;
      var p4x = 1;
      var p4y = 1;
      var r = R;

      var c1   = p2x*p1y - p1x*p2y;
      var a1   = p2y-p1y;
      var b1   = p1x-p2x;
      var c2   = p4x*p3y - p3x*p4y;
      var a2   = p4y-p3y;
      var b2   = p3x-p4x;
      if ((a1*b2) == (a2*b1)) {  /* Parallel or coincident lines */
        break computefillet;
      }

      var d1, d2;
      var mPx, mPy;
      mPx= (p3x + p4x)/2.0;
      mPy= (p3y + p4y)/2.0;
      d1 = linetopoint(a1, b1, c1, mPx, mPy);  /* Find distance p1p2 to p3 */
      if (d1 == 0.0) {
        break computefillet;
      }
      mPx= (p1x + p2x)/2.0;
      mPy= (p1y + p2y)/2.0;
      d2 = linetopoint(a2, b2, c2, mPx, mPy);  /* Find distance p3p4 to p2 */
      if (d2 == 0.0) {
        break computefillet;
      }

      var c1p, c2p, d;
      var rr = r;
      if (d1 <= 0.0) {
        rr= -rr;
      }
      c1p = c1 - rr*sqrt((a1*a1)+(b1*b1));  /* Line parallel l1 at d */
      rr = r;
      if (d2 <= 0.0) {
        rr = -rr;
      }
      c2p = c2 - rr*sqrt((a2*a2)+(b2*b2));  /* Line parallel l2 at d */
      d = (a1*b2)-(a2*b1);

      var pCx = (c2p*b1-c1p*b2)/d;                /* Intersect constructed lines */
      var pCy = (c1p*a2-c2p*a1)/d;                /* to find center of arc */
      var pAx = 0;
      var pAy = 0;
      var pBx = 0;
      var pBy = 0;
      var dP, cP;

      dP = (a1*a1) + (b1*b1);              /* Clip or extend lines as required */
      if (dP != 0.0) {
        cP = a1*pCy - b1*pCx;
        pAx = (-a1*c1 - b1*cP)/dP;
        pAy = ( a1*cP - b1*c1)/dP;
      }
      dP = (a2*a2) + (b2*b2);
      if (dP != 0.0) {
        cP = a2*pCy - b2*pCx;
        pBx = (-a2*c2 - b2*cP)/dP;
        pBy = ( a2*cP - b2*c2)/dP;
      }

      var gv1x = pAx-pCx;
      var gv1y = pAy-pCy;
      var gv2x = pBx-pCx;
      var gv2y = pBy-pCy;

      var arcStart = atan2(gv1y, gv1x);
      var arcAngle = 0.0;
      var dd = sqrt(((gv1x*gv1x)+(gv1y*gv1y)) * ((gv2x*gv2x)+(gv2y*gv2y)));
      if (dd != 0.0) {
        arcAngle = (acos((gv1x*gv2x + gv1y*gv2y)/dd));
      }
      var crossProduct = (gv1x*gv2y - gv2x*gv1y);
      if (crossProduct < 0.0) {
        arcStart -= arcAngle;
      }

      var arc1 = arcStart;
      var arc2 = arcStart + arcAngle;
      if (crossProduct < 0.0) {
        arc1 = arcStart + arcAngle;
        arc2 = arcStart;
      }

      arcCenterX    = pCx;
      arcCenterY    = pCy;
      arcStartAngle = arc1;
      arcEndAngle   = arc2;
      arcRadius     = r;
      arcStartX = arcCenterX + arcRadius*cos(arcStartAngle);
      arcStartY = arcCenterY + arcRadius*sin(arcStartAngle);
      arcEndX   = arcCenterX + arcRadius*cos(arcEndAngle);
      arcEndY   = arcCenterY + arcRadius*sin(arcEndAngle);
    }
    // end compute

    var t = 0;
    var y = 0;
    _x = constrain(_x, 0, 1);

    if (_x <= arcStartX) {
      if (arcStartX < Math.EPSILON){
        _y = 0;
      } else {
        t = _x / arcStartX;
        _y = t * arcStartY;
      }
    }
    else if (_x >= arcEndX) {
      t = (_x - arcEndX)/(1 - arcEndX);
      _y = arcEndY + t*(1 - arcEndY);
    }
    else {
      if (_x >= arcCenterX) {
        _y = arcCenterY - sqrt(sq(arcRadius) - sq(_x-arcCenterX));
      }
      else {
        _y = arcCenterY + sqrt(sq(arcRadius) - sq(_x-arcCenterX));
      }
    }

    return(_y);
  }

  // circular arc through a point
  // adapted from paul bourke
  // http://paulbourke.net/geometry/circlesphere/Circle.cpp
  p5.Ease.prototype.circularArcThroughAPoint = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    var m = {};
    m.centerX = 0;
    m.centerY = 0;
    m.dRadius = 0;

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    var min_param_b = 0.0 + Number.EPSILON;
    var max_param_b = 1.0 - Number.EPSILON;
    _a = constrain(_a, min_param_a, max_param_a);
    _b = constrain(_b, min_param_b, max_param_b);
    _x = constrain(_x, 0+Number.EPSILON,1-Number.EPSILON);

    var pt1x = 0;
    var pt1y = 0;
    var pt2x = _a;
    var pt2y = _b;
    var pt3x = 1;
    var pt3y = 1;

    // helper functions:

    // check if the lines defined by the given points are perpendicular
    // to the x or y axis - used as a check before calcCircleFrom3Points()
    // from paul bourke's Circle.cpp
    function isPerpendicular(pt1x, pt1y, pt2x, pt2y, pt3x, pt3y)
    {
      var yDelta_a = pt2y - pt1y;
      var xDelta_a = pt2x - pt1x;
      var yDelta_b = pt3y - pt2y;
      var xDelta_b = pt3x - pt2x;

      // checking whether the line of the two pts are vertical
      if (abs(xDelta_a) <= Number.EPSILON && abs(yDelta_b) <= Number.EPSILON){
        return(false);
      }
      if (abs(yDelta_a) <= Number.EPSILON){
        return(true);
      }
      else if (abs(yDelta_b) <= Number.EPSILON){
        return(true);
      }
      else if (abs(xDelta_a)<= Number.EPSILON){
        return(true);
      }
      else if (abs(xDelta_b)<= Number.EPSILON){
        return(true);
      }
      else return(false);
    }

    // from paul bourke's Circle.cpp
    function calcCircleFrom3Points(pt1x, pt1y, pt2x, pt2y, pt3x, pt3y, m)
    {
      var yDelta_a = pt2y - pt1y;
      var xDelta_a = pt2x - pt1x;
      var yDelta_b = pt3y - pt2y;
      var xDelta_b = pt3x - pt2x;

      if (abs(xDelta_a) <= Number.EPSILON && abs(yDelta_b) <= Number.EPSILON){
        m.centerX = 0.5*(pt2x + pt3x);
        m.centerY = 0.5*(pt1y + pt2y);
        m.dRadius = sqrt(sq(m.centerX-pt1x) + sq(m.centerY-pt1y));
        return;
      }

      // isPerpendicular() assures that xDelta(s) are not zero
      var aSlope = yDelta_a / xDelta_a;
      var bSlope = yDelta_b / xDelta_b;
      if (abs(aSlope-bSlope) <= Number.EPSILON){	// checking whether the given points are colinear.
        return;
      }

      // calc center
      m.centerX = (aSlope*bSlope*(pt1y - pt3y) + bSlope*(pt1x + pt2x)- aSlope*(pt2x+pt3x) )/(2* (bSlope-aSlope) );
      m.centerY = -1*(m.centerX - (pt1x+pt2x)/2)/aSlope +  (pt1y+pt2y)/2;
      m.dRadius = sqrt(sq(m.centerX-pt1x) + sq(m.centerY-pt1y));
    }

    if      (!isPerpendicular(pt1x,pt1y, pt2x,pt2y, pt3x,pt3y) )	calcCircleFrom3Points (pt1x,pt1y, pt2x,pt2y, pt3x,pt3y, m);
    else if (!isPerpendicular(pt1x,pt1y, pt3x,pt3y, pt2x,pt2y) )	calcCircleFrom3Points (pt1x,pt1y, pt3x,pt3y, pt2x,pt2y, m);
    else if (!isPerpendicular(pt2x,pt2y, pt1x,pt1y, pt3x,pt3y) )	calcCircleFrom3Points (pt2x,pt2y, pt1x,pt1y, pt3x,pt3y, m);
    else if (!isPerpendicular(pt2x,pt2y, pt3x,pt3y, pt1x,pt1y) )	calcCircleFrom3Points (pt2x,pt2y, pt3x,pt3y, pt1x,pt1y, m);
    else if (!isPerpendicular(pt3x,pt3y, pt2x,pt2y, pt1x,pt1y) )	calcCircleFrom3Points (pt3x,pt3y, pt2x,pt2y, pt1x,pt1y, m);
    else if (!isPerpendicular(pt3x,pt3y, pt1x,pt1y, pt2x,pt2y) )	calcCircleFrom3Points (pt3x,pt3y, pt1x,pt1y, pt2x,pt2y, m);
    else {
      return 0;
    }

    // constrain
    if ((m.centerX > 0) && (m.centerX < 1)){
       if (_a < m.centerX){
         m.centerX = 1;
         m.centerY = 0;
         m.dRadius = 1;
       } else {
         m.centerX = 0;
         m.centerY = 1;
         m.dRadius = 1;
       }
    }

    //------------------
    var _y = 0;
    if (_x >= m.centerX){
      _y = m.centerY - sqrt(sq(m.dRadius) - sq(_x-m.centerX));
    }
    else{
      _y = m.centerY + sqrt(sq(m.dRadius) - sq(_x-m.centerX));
    }
    return(_y);
  }

  // bezier shapers
  // adapted from BEZMATH.PS (1993)
  // by don lancaster, SYNERGETICS inc.
  // http://www.tinaja.com/text/bezmath.html
  p5.Ease.prototype.quadraticBezier = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    var min_param_a = 0.0;
    var max_param_a = 1.0;
    var min_param_b = 0.0;
    var max_param_b = 1.0;
    _a = constrain(_a, min_param_a, max_param_a);
    _b = constrain(_b, min_param_b, max_param_b);

    if (_a == 0.5){
      _a += Number.EPSILON;
    }
    // solve t from x (an inverse operation)
    var om2a = 1.0 - 2.0*_a;
    var t = (sqrt(_a*_a + om2a*_x) - _a)/om2a;
    var _y = (1.0-2.0*_b)*(t*t) + (2*_b)*t;

    return(_y);
  }

  // cubic bezier shaper
  p5.Ease.prototype.cubicBezier = function(_x, _a, _b, _c, _d)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default
    if(!_c) _c = 0.75; // default
    if(!_d) _d = 0.25; // default

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    var min_param_b = 0.0;
    var max_param_b = 1.0;
    var min_param_c = 0.0 + Number.EPSILON;
    var max_param_c = 1.0 - Number.EPSILON;
    var min_param_d = 0.0;
    var max_param_d = 1.0;
    _a = constrain(_a, min_param_a, max_param_a);
    _b = constrain(_b, min_param_b, max_param_b);
    _c = constrain(_c, min_param_c, max_param_c);
    _d = constrain(_d, min_param_d, max_param_d);

    //-------------------------------------------
    var y0a = 0.00; // initial y
    var x0a = 0.00; // initial x
    var y1a = _b;    // 1st influence y
    var x1a = _a;    // 1st influence x
    var y2a = _d;    // 2nd influence y
    var x2a = _c;    // 2nd influence x
    var y3a = 1.00; // final y
    var x3a = 1.00; // final x

    var A =   x3a - 3*x2a + 3*x1a - x0a;
    var B = 3*x2a - 6*x1a + 3*x0a;
    var C = 3*x1a - 3*x0a;
    var D =   x0a;

    var E =   y3a - 3*y2a + 3*y1a - y0a;
    var F = 3*y2a - 6*y1a + 3*y0a;
    var G = 3*y1a - 3*y0a;
    var H =   y0a;

    // Solve for t given x (using Newton-Raphelson), then solve for y given t.
    // Assume for the first guess that t = x.
    var currentt = _x;
    var nRefinementIterations = 5;
    for (var i=0; i<nRefinementIterations; i++){
      var currentx = A*(currentt*currentt*currentt) + B*(currentt*currentt) + C*currentt + D;
      var currentslope = 1.0/(3.0*A*currentt*currentt + 2.0*B*currentt + C);
      currentt -= (currentx - _x)*(currentslope);
      currentt = constrain(currentt, 0,1.0);
    }

    //------------
    var _y = E*(currentt*currentt*currentt) + F*(currentt*currentt) + G*currentt + H;

    return(_y);
  }

  // parabola through a point
  p5.Ease.prototype.parabolaThroughAPoint = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    var min_param_b = 0.0;
    var max_param_b = 1.0;
    _a = constrain(_a, min_param_a, max_param_a);
    _b = constrain(_b, min_param_b, max_param_b);

    var A = (1-_b)/(1-_a) - (_b/_a);
    var B = (A*(_a*_a)-_b)/_a;
    var _y = A*(_x*_x) - B*(_x);
    _y = constrain(_y, 0,1);

    return(_y);
  }

  // damped sine wave
  // n.b. decays to 0 at x=1
  // http://en.wikipedia.org/wiki/Damped_sine_wave
  p5.Ease.prototype.dampedSinusoid = function(_x, _a)
  {
    if(!_a) _a = 0.25; // default

    var omega  = 100*_a;
    var lambda = -6.90775527; // ln(lambda) = 0.001 // decay constant
    var phi = 0;
    var e = 2.718281828459045;

    var t = _x;
    var _y = pow(e, lambda*t) * cos(omega*t + phi);

    return(_y);
  }

  // damped sine wave (reversed)
  p5.Ease.prototype.dampedSinusoidReverse = function(_x, _a)
  {
    if(!_a) _a = 0.25; // default

    var omega = 100*_a;
    var lambda = -6.90775527; // ln(lambda) = 0.001
    var phi = 0;
    var e = 2.718281828459045;

    var t = 1.0-_x;
    var _y = pow(e, lambda*t) * cos(omega*t + phi);

    return(_y);
  }

  // cubic bezier through two points
  p5.Ease.prototype.cubicBezierThrough2Points = function(_x, _a, _b, _c, _d)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default
    if(!_c) _c = 0.75; // default
    if(!_d) _d = 0.25; // default

    var _y = 0;

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    var min_param_b = 0.0 + Number.EPSILON;
    var max_param_b = 1.0 - Number.EPSILON;
    _a = constrain(_a, min_param_a, max_param_a);
    _b = constrain(_b, min_param_b, max_param_b);

    var x0 = 0;
    var y0 = 0;
    var x4 = _a;
    var y4 = _b;
    var x5 = _c;
    var y5 = _d;
    var x3 = 1;
    var y3 = 1;
    var x1,y1,x2,y2; // to be solved.

    var t1 = 0.3;
    var t2 = 0.7;

    var B0t1 = (1-t1)*(1-t1)*(1-t1);
    var B1t1 = 3*t1*(1-t1)*(1-t1);
    var B2t1 = 3*t1*t1*(1-t1);
    var B3t1 = t1*t1*t1;
    var B0t2 = (1-t2)*(1-t2)*(1-t2);
    var B1t2 = 3*t2*(1-t2)*(1-t2);;
    var B2t2 = 3*t2*t2*(1-t2);;
    var B3t2 = t2*t2*t2;

    var ccx = x4 - x0*B0t1 - x3*B3t1;
    var ccy = y4 - y0*B0t1 - y3*B3t1;
    var ffx = x5 - x0*B0t2 - x3*B3t2;
    var ffy = y5 - y0*B0t2 - y3*B3t2;

    x2 = (ccx - (ffx*B1t1)/B1t2) / (B2t1 - (B1t1*B2t2)/B1t2);
    y2 = (ccy - (ffy*B1t1)/B1t2) / (B2t1 - (B1t1*B2t2)/B1t2);
    x1 = (ccx - x2*B2t1) / B1t1;
    y1 = (ccy - y2*B2t1) / B1t1;

    x1 = constrain(x1, 0+Number.EPSILON,1-Number.EPSILON);
    x2 = constrain(x2, 0+Number.EPSILON,1-Number.EPSILON);

    _y = this.cubicBezier (_x, x1,y1, x2,y2);
    _y = constrain(_y,0,1);

    return(_y);
  }

  // double circular ogee
  p5.Ease.prototype.doubleCircularOgee = function(_x, _a)
  {
    if(!_a) _a = 0.25; // default

    var min_param_a = 0.0;
    var max_param_a = 1.0;

    _a = constrain(_a, min_param_a, max_param_a);
    var _y = 0;
    if (_x<=_a){
      _y = sqrt(sq(_a) - sq(_x-_a));
    }
    else {
      _y = 1 - sqrt(sq(1-_a) - sq(_x-_a));
    }

    return(_y);
  }

  // double squircular ogee
  p5.Ease.prototype.doubleSquircularOgee = function(_x, _a, _n)
  {
    if(!_a) _a = 0.25; // default
    if(!_n) _n = 3; // default

    var min_param_a = 0.0;
    var max_param_a = 1.0;
    _a = constrain(_a, min_param_a, max_param_a);
    var pown = 2.0 * _n;

    var _y = 0;
    if (_x<=_a){
      _y = pow( pow(_a,pown) - pow(_x-_a, pown), 1.0/pown);
    }
    else {
      _y = 1.0 - pow( pow(1-_a,pown) - pow(_x-_a, pown), 1.0/pown);
    }

    return(_y);
  }

  // generalized combo sigmoid / logit function
  p5.Ease.prototype.generalSigmoidLogitCombo = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    var _y = 0;
    if (_a < 0.5){
      // Logit
      var dy = _b - 0.5;
      _y = dy + this.normalizedLogit (_x, 1.0-(2.0*_a));
    } else {
      // Sigmoid
      var dx = _b - 0.5;
      _y = this.normalizedLogitSigmoid (_x+dx, (2.0*(_a-0.5)));
    }

    _y = constrain(_y, 0, 1);

    return(_y);
  }

  // normalized logistic sigmoid function
  p5.Ease.prototype.normalizedLogitSigmoid = function(_x, _a)
  {
    if(!_a) _a = 0.25; // default

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    var emph = 5.0;

    _a = constrain(_a, min_param_a, max_param_a);
    _a = (1.0/(1.0-_a) - 1.0);
    _a = emph * _a;

    var _y    = 1.0 / (1.0 + exp(0 - (_x-0.5)*_a    ));
    var miny = 1.0 / (1.0 + exp(  0.5*_a    ));
    var maxy = 1.0 / (1.0 + exp( -0.5*_a    ));
    _y = map(_y, miny, maxy, 0, 1);

    return(_y);
  }

  // logit function
  // https://en.wikipedia.org/wiki/Logit
  p5.Ease.prototype.normalizedLogit = function(_x, _a)
  {
    if(!_a) _a = 0.25; // default

    var min_param_a = 0.0 + Number.EPSILON;
    var max_param_a = 1.0 - Number.EPSILON;
    var emph = 5.0;

    _a = constrain(_a, min_param_a, max_param_a);
    _a = (1/(1-_a) - 1);
    _a = emph * _a;

    var minx = 1.0 / (1.0 + exp(  0.5*_a    ));
    var maxx = 1.0 / (1.0 + exp( -0.5*_a    ));
    _x = map(_x, 0,1, minx, maxx);

    var _y = log (_x / (1.0 - _x)) ;
    _y *= 1.0/_a;
    _y += 0.5;

    _y = constrain (_y, 0, 1);

    return(_y);
  }

  // quartic easing function
  p5.Ease.prototype.generalizedQuartic = function(_x, _a, _b)
  {
    if(!_a) _a = 0.25; // default
    if(!_b) _b = 0.75; // default

    var min_param_a = 0.0;
    var max_param_a = 1.0;
    var min_param_b = 0.0;
    var max_param_b = 1.0;
    _a = constrain(_a, min_param_a, max_param_a);
    _b = constrain(_b, min_param_b, max_param_b);

    _a = 1.0-_a;
    var _w = (1-2*_a)*(_x*_x) + (2*_a)*_x;
    var _y = (1-2*_b)*(_w*_w) + (2*_b)*_w;

    return(_y);
  }

  // boxcar function (normalized heaviside step function)
  // http://mathworld.wolfram.com/BoxcarFunction.html
  // https://en.wikipedia.org/wiki/Heaviside_step_function
  p5.Ease.prototype.boxcar = function(_x)
  {
    return(_x>=0.5);
  }

  // list algorithms
  p5.Ease.prototype.listAlgos = function() {
    var _styles = new Array();
    for(var i in this.__proto__) {
      var _t = true;
      if(i=="listAlgos") _t=false;
      else if(i=="fillArray") _t=false;
      else if(i=="fillFloat32Array") _t=false;
      else if(i=="fillFloat64Array") _t=false;
      if(_t) _styles.push(i);
    }
    return(_styles);
  }

  // array xfer (for pre-rendered use)
  p5.Ease.prototype.fillArray = function(_algo, _len, _args) {
    var _dest = new Array(_len);
    for(var i = 0;i<_len;i++)
    {
      var _p = i/(_len-1); // 0.-1.
      _dest[i] = this[_algo](_p, _args);
    }
    return(_dest);
  }

  // array xfer (for pre-rendered use)
  p5.Ease.prototype.fillFloat32Array = function(_algo, _len, _args) {
    var _dest = new Float32Array(_len);
    for(var i = 0;i<_len;i++)
    {
      var _p = i/(_len-1); // 0.-1.
      _dest[i] = this[_algo](_p, _args);
    }
    return(_dest);
  }

  // array xfer (for pre-rendered use)
  p5.Ease.prototype.fillFloat64Array = function(_algo, _len, _args) {
    var _dest = new Float64Array(_len);
    for(var i = 0;i<_len;i++)
    {
      var _p = i/(_len-1); // 0.-1.
      _dest[i] = this[_algo](_p, _args);
    }
    return(_dest);
  }

  // =============================================================================
  //                         p5.ArrayEval
  // =============================================================================

    /**
     * Base class for an array evaluator
     *
     * @class p5.Gen
     * @constructor
     */
     p5.ArrayEval = function() {
      //
      // this object implements an 'eval'-style
      // equation evaluator across n-dimensional arrays.
      // insired by the 'exprfill' / [jit.expr] functionality
      // in Max/MSP.
      //
      // note that the javascript eval() function is *not*
      // considered to be particularly secure, as it can
      // easily be used to execute arbitrary code.
      //
      // see here for an exhausting discussion of the issue:
      // https://stackoverflow.com/questions/86513/why-is-using-the-javascript-eval-function-a-bad-idea
      //
      // the p5.ArrayEval object has three methods to create
      // 1-, 2-, and 3- dimensional javascript arrays based on
      // a formula encoded in a string.
      // the letters u, v, and w will be replaced with various
      // 'normal' maps based on their cell positions.
      //     * u, v, w will unwrap to 0. to 1. across dimension 1, 2, and 3
      //     * su, sv, sw will unwrap to -1. to 1.
      //     * cu, cv, cw will unwrap to their integer position in the array
      //     * du, dv, dw gets replaced with the length of the array in that dimension
      //
      // the object returns an array that solves the equation, so...
      // if you instantiate an object...
      //     var e = new p5.ArrayEval();
      // then...
      //     e.eval('u', 40);
      // will return a one-dimensional array with 40 values from 0. to 1.
      // and...
      //     e.eval2d('su*sv', 20, 20);
      // will return a two-dimensional array with 20x20 values from -1. to 1. multiplied together.
      //
      // because the eval() is run in the browser, any code included will add
      // functionality to the p5.ArrayEval object, e.g. p5.js math functions
      // (sin(), cos(), etc.) will work correctly.
      //

      this.version = 0.01; // just some crap for constructor

      var that = this; // some bullshit

      // global dims
      var l1 = 0;
      var l2 = 0;
      var l3 = 0;

    };     // end p5.ArrayEval constructor

    // array return - 1d
    p5.ArrayEval.prototype.eval = function(_evalstr, _l1) {
      this.l1 = _l1; // make global
      var multi = 0; // default one output
      var e;

      if(Array.isArray(_evalstr)) multi = 1; // array per result

      var _dest;
      if(multi) _dest = createArray(_l1, _evalstr.length);
      else _dest = createArray(_l1);
      // string expansion:
      // u unwraps to 0-1
      // su unwraps to -1 to 1
      // cu unwraps to cell value (0 to dim-1)
      // du unwraps to a constant representing the dimension (size)
      if(multi)
      {
        for(e in _evalstr)
        {
          _evalstr[e] = _evalstr[e].replace(/cu/g, "i");
          _evalstr[e] = _evalstr[e].replace(/du/g, "l1");
          _evalstr[e] = _evalstr[e].replace(/su/g, "(i/(l1-1)*2.-1.)");
          _evalstr[e] = _evalstr[e].replace(/u/g, "(i/(l1-1))");
        }
      }
      else {
        _evalstr = _evalstr.replace(/cu/g, "i");
        _evalstr = _evalstr.replace(/du/g, "l1");
        _evalstr = _evalstr.replace(/su/g, "(i/(l1-1)*2.-1.)");
        _evalstr = _evalstr.replace(/u/g, "(i/(l1-1))");
      }

      //console.log(_evalstr);
      for(var i = 0;i<this.l1;i++)
      {
        if(multi)
        {
          for(e = 0;e<_evalstr.length;e++)
          {
            _dest[i][e] = eval('with(this) { ' + _evalstr[e] + ' }');
          }
        }
        else _dest[i] = eval('with(this) { ' + _evalstr + ' }');
      }
      return(_dest);
    }

    // function synonym
    p5.ArrayEval.prototype.eval1d = function(_evalstr, _l1)
    {
      return(this.eval(_evalstr, _l1));
    }

    // array return - 2d
    p5.ArrayEval.prototype.eval2d = function(_evalstr, _l1, _l2) {
      this.l1 = _l1; // make global
      this.l2 = _l2; // make global
      var multi = 0; // default one output
      var e;

      if(Array.isArray(_evalstr)) multi = 1; // array per result

      var _dest;
      if(multi) _dest = createArray(_l1, _l2, _evalstr.length);
      else _dest = createArray(_l1, _l2);
      // string expansion:
      // u unwraps to 0-1
      // su unwraps to -1 to 1
      // cu unwraps to cell value (0 to dim-1)
      // du unwraps to a constant representing the dimension (size)
      // v unwraps to 0-1
      // sv unwraps to -1 to 1
      // cv unwraps to cell value (0 to dim-1)
      // dv unwraps to a constant representing the dimension (size)
      if(multi)
      {
        for(e in _evalstr)
        {
          _evalstr[e] = _evalstr[e].replace(/cu/g, "i");
          _evalstr[e] = _evalstr[e].replace(/du/g, "l1");
          _evalstr[e] = _evalstr[e].replace(/su/g, "(i/(l1-1)*2.-1.)");
          _evalstr[e] = _evalstr[e].replace(/u/g, "(i/(l1-1))");
          _evalstr[e] = _evalstr[e].replace(/cv/g, "j");
          _evalstr[e] = _evalstr[e].replace(/dv/g, "l2");
          _evalstr[e] = _evalstr[e].replace(/sv/g, "(j/(l2-1)*2.-1.)");
          _evalstr[e] = _evalstr[e].replace(/v/g, "(j/(l2-1))");
        }
      }
      else {
        _evalstr = _evalstr.replace(/cu/g, "i");
        _evalstr = _evalstr.replace(/du/g, "l1");
        _evalstr = _evalstr.replace(/su/g, "(i/(l1-1)*2.-1.)");
        _evalstr = _evalstr.replace(/u/g, "(i/(l1-1))");
        _evalstr = _evalstr.replace(/cv/g, "j");
        _evalstr = _evalstr.replace(/dv/g, "l2");
        _evalstr = _evalstr.replace(/sv/g, "(j/(l2-1)*2.-1.)");
        _evalstr = _evalstr.replace(/v/g, "(j/(l2-1))");
      }

      //console.log(_evalstr);
      for(var i = 0;i<this.l1;i++)
      {
        for(var j = 0;j<this.l2;j++)
        {
          if(multi)
          {
            for(e = 0;e<_evalstr.length;e++)
            {
            _dest[i][j][e] = eval('with(this) { ' + _evalstr[e] + ' }');
            }
          }
          else _dest[i][j] = eval('with(this) { ' + _evalstr + ' }');
        }
      }
      return(_dest);
    }

    // array return - 3d
    p5.ArrayEval.prototype.eval3d = function(_evalstr, _l1, _l2, _l3) {
      this.l1 = _l1; // make global
      this.l2 = _l2; // make global
      this.l3 = _l3; // make global
      var multi = 0; // default one output
      var e;

      if(Array.isArray(_evalstr)) multi = 1; // array per result

      var _dest;
      if(multi) _dest = createArray(_l1, _l2, _l3, _evalstr.length);
      else _dest = createArray(_l1, _l2, _l3);
      // string expansion:
      // u unwraps to 0-1
      // su unwraps to -1 to 1
      // cu unwraps to cell value (0 to dim-1)
      // du unwraps to a constant representing the dimension (size)
      // v unwraps to 0-1
      // sv unwraps to -1 to 1
      // cv unwraps to cell value (0 to dim-1)
      // dv unwraps to a constant representing the dimension (size)
      // w unwraps to 0-1
      // sw unwraps to -1 to 1
      // cw unwraps to cell value (0 to dim-1)
      // dw unwraps to a constant representing the dimension (size)
      if(multi)
      {
        for(e in _evalstr)
        {
          _evalstr[e] = _evalstr[e].replace(/cu/g, "i");
          _evalstr[e] = _evalstr[e].replace(/du/g, "l1");
          _evalstr[e] = _evalstr[e].replace(/su/g, "(i/(l1-1)*2.-1.)");
          _evalstr[e] = _evalstr[e].replace(/u/g, "(i/(l1-1))");
          _evalstr[e] = _evalstr[e].replace(/cv/g, "j");
          _evalstr[e] = _evalstr[e].replace(/dv/g, "l2");
          _evalstr[e] = _evalstr[e].replace(/sv/g, "(j/(l2-1)*2.-1.)");
          _evalstr[e] = _evalstr[e].replace(/v/g, "(j/(l2-1))");
          _evalstr[e] = _evalstr[e].replace(/cw/g, "k");
          _evalstr[e] = _evalstr[e].replace(/dw/g, "l3");
          _evalstr[e] = _evalstr[e].replace(/sw/g, "(k/(l3-1)*2.-1.)");
          _evalstr[e] = _evalstr[e].replace(/w/g, "(k/(l3-1))");
        }
      }
      else {
        _evalstr = _evalstr.replace(/cu/g, "i");
        _evalstr = _evalstr.replace(/du/g, "l1");
        _evalstr = _evalstr.replace(/su/g, "(i/(l1-1)*2.-1.)");
        _evalstr = _evalstr.replace(/u/g, "(i/(l1-1))");
        _evalstr = _evalstr.replace(/cv/g, "j");
        _evalstr = _evalstr.replace(/dv/g, "l2");
        _evalstr = _evalstr.replace(/sv/g, "(j/(l2-1)*2.-1.)");
        _evalstr = _evalstr.replace(/v/g, "(j/(l2-1))");
        _evalstr = _evalstr.replace(/cw/g, "k");
        _evalstr = _evalstr.replace(/dw/g, "l3");
        _evalstr = _evalstr.replace(/sw/g, "(k/(l3-1)*2.-1.)");
        _evalstr = _evalstr.replace(/w/g, "(k/(l3-1))");
      }

      //console.log(_evalstr);
      for(var i = 0;i<this.l1;i++)
      {
        for(var j = 0;j<this.l2;j++)
        {
          for(var k = 0;k<this.l3;k++)
          {
            if(multi)
            {
              for(e = 0;e<_evalstr.length;e++)
              {
              _dest[i][j][k][e] = eval('with(this) { ' + _evalstr[e] + ' }');
              }
            }
            else _dest[i][j][k] = eval('with(this) { ' + _evalstr + ' }');
          }
        }
      }
      return(_dest);
    }


    // =============================================================================
    //                         p5.Filt
    // =============================================================================

      /**
       * Base class for a time-domain filter
       *
       * @class p5.Filt
       * @constructor
       */
       p5.Filt = function(_fs) {
        //
        // this object implements time-domain filtering based on
        // robert bristow-johnson's cookbook formulae for
        // biquadratic (2 pole, 2 zero) filters :
        // http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt
        // Copyright (C) 2003  Robert Bristow-Johnson
        //
        // we are using his general 2p2z / biquad formula:
        // y[n] = (b0/a0)*x[n] + (b1/a0)*x[n-1] + (b2/a0)*x[n-2] - (a1/a0)*y[n-1] - (a2/a0)*y[n-2]
        //
        // this is the same algorithm used in the [biquad~] object in PureData and Max/MSP,
        // the [2p2z~] object in Max/FTS, the BiQuad.cpp ugen in the STK (ChucK, etc.),
        // SOS in SuperCollider, the biquada opcode in CSOUND, etc. etc. etc.
        //
        // the biquadratic filter equation is pretty standard, insofar as you can
        // construct any 'simple' filter (lowpass, highpass, bandpass, bandstop,
        // allpass, etc.) with independent gain controls (coefficients) for the
        // input (x[n]), (usually) the overall output (y[n]), and four samples
        // of memory - the two previous input samples (x[n-1], x[n-2]), and the
        // two previous output samples (y[n-1], y[n-2]).
        //
        // so this filter has both 2nd-order FIR (feedforward) and 2nd-order IIR
        // (feedback) capabilities.  you set the coefficients by running some
        // trig against your desired filter characteristics...
        //      * type
        //      * cutoff / center frequency
        //      * Q / resonance
        //      * gain (for some filters)
        // ...and the known sample rate (Fs).
        //
        // more complex filters can be constructed by 'cascading' biquad filters
        // in series, e.g. for butterworth / chebyshev filters that require a
        // more flat frequency response than a simple biquad can offer.
        //
        // you can find lots of info about this filter by searching for
        // 'biquad' on your internet machine.  however...
        //
        // some people, they will flip their 'a' and 'b' coefficients.
        // some people, they will skip a0 and use 5 coefficients for biquad formulae.
        // some people, they like to go out dancing.
        //
        // p5.Filt is offered here as a module to allow for filter design
        // independent of the Web Audio framework used by p5.sound / Tone.js.
        // there are lots of other things one might want to 'filter' besides sound.
        // the defaults provided here are against the nominal graphics frame rate
        // for p5.js (60Hz), giving an effective nyquist (upper frequency limit)
        // of 30Hz.  try running a random() generator through it, or using it
        // to smooth out a noisy signal coming from a sensor or a network API.
        // it wil process input sample-by-sample through the tick() method or
        // process arrays vector-by-vector through the process() method.
        //

        if(!_fs) _fs = 60.; // nominal p5 default framerate

        this.version = 0.01; // just some crap for constructor

        var that = this; // some bullshit

        // biquad / 2p2z coefficients
        this.a0 = 1.; // denominator gain for filter output (y[n] term)
        this.b0 = 1.; // gain for current input (x[n] term)
        this.a1 = 0.; // gain for previous input (x[n-1] term)
        this.b1 = 0.; // gain for previous previous input (x[n-2] term)
        this.a2 = 0.; // gain for previous output (y[n-1] term)
        this.b2 = 0.; // gain for previous previous output (y[n-2] term)
        // sample memory
        this.xn = 0.; // x[n] (input)
        this.yn = 0.; // y[n] (output)
        this.xpn = 0.; // x[n-1] (previous input)
        this.ypn = 0.; // y[n-1] (previous output)
        this.xppn = 0.; // x[n-2] (previous previous input)
        this.yppn = 0.; // y[n-2] (previous previous output)
        // parameters
        this.fs = _fs; // sampling rate
        this.type = "LPF"; // default to lowpass filter
        this.f0 = this.fs/4.; // center/cutoff frequency; default to fs/4 (half nyquist)
        this.dB = 0.; // gain for peaking / shelving
        this.Q = 1.; // width / resonance of filter
        // intermediates
        this.A; // amplitude
        this.w0; // filter increment in radians
        this.cw0; // cosine of w0 - precompute
        this.sw0; // sine of w0 - precompute
        this.alpha; // alpha term - precompute
        this.soff; // shelving offset - precompute

        // compute coefficients based on default parameters
        this.precalc();

      };     // end p5.Filt constructor

      // define the filter characteristics all at once.
      p5.Filt.prototype.set = function(_type, _f0, _Q, _dB)
      {
        if(_type) this.type = _type;
        if(_f0) this.f0 = _f0;
        if(_Q) this.Q = _Q;
        if(_dB) this.dB = _dB; // only matters for shelving filters

        this.precalc();
      }

      // set the sampling rate (fs) of the filter.
      p5.Filt.prototype.setFs = function(_fs)
      {
        if(_fs) this.fs = _fs;
        this.precalc();
      }

      // set the type of the filter.
      p5.Filt.prototype.setType = function(_type)
      {
        if(_type) this.type = _type;
        this.precalc();
      }

      // set the cutoff/center frequency.
      p5.Filt.prototype.setFreq = function(_f0)
      {
        if(_f0) this.f0 = _f0;
        this.precalc();
      }

      // set the Q(uality) of the filter.
      p5.Filt.prototype.setQ = function(_Q)
      {
        if(_Q) this.Q = _Q;
        this.precalc();
      }

      // set the gain (in decibels).
      p5.Filt.prototype.setGain = function(_dB)
      {
        if(_dB) this.dB = _dB;
        this.precalc();
      }

      // set the bandwidth in Hz (inverse of Q).
      p5.Filt.prototype.setBW = function(_bw)
      {
        // technically...
        // this.Q = 1.0/(2*Math.sinh(log(2)/2*_bw*this.w0/this.sw0));
        // but YOLO...
        if(_bw) this.Q = this.f0/_bw;
        this.precalc();
      }

      // process multiple values as a single vector;
      // n.b. filter will retain memory... use a clear()
      // beforehand if you want the filter zeroed.
      p5.Filt.prototype.process = function(_x)
      {
        var _y; // output
        // figure out input type
        if(Array.isArray(_x)) _y = new Array(_x.length);
        if(_x.constructor == Float32Array) _y = new Float32Array(_x.length);
        if(_x.constructor == Float64Array) _y = new Float64Array(_x.length);

        for(var i in _x)
        {
          _y[i] = this.tick(_x[i]);
        }

        // output
        return(_y);
      }

      // process sample-by-sample, STK style.
      p5.Filt.prototype.tick = function(_x)
      {
        // input
        this.xn = _x;

        // biquad - the only line in this whole situation that really matters:
        this.yn = (this.b0/this.a0)*this.xn + (this.b1/this.a0)*this.xpn + (this.b2/this.a0)*this.xppn - (this.a1/this.a0)*this.ypn - (this.a2/this.a0)*this.yppn;

        // shift
        this.xppn = this.xpn;
        this.xpn = this.xn;
        this.yppn = this.ypn;
        this.ypn = this.yn;

        // output
        return(this.yn);
      }

      // clear biquad memory -
      // useful if the filter becomes unstable and you start getting NaNs as output.
      p5.Filt.prototype.clear = function()
      {
        // clear samples
        this.xn = 0; // x[n] (input)
        this.yn = 0; // y[n] (output)
        this.xpn = 0; // x[n-1]
        this.ypn = 0; // y[n-1]
        this.xppn = 0; // x[n-2]
        this.yppn = 0; // y[n-2]
      }

      // set coefficients 'by hand' -
      // useful for cascade (butterworth / chebyshev) filtering
      p5.Filt.prototype.coeffs = function(_a0, _b0, _b1, _b2, _a1, _a2)
      {
        if(arguments.length!=6)
        {
          console.log("p5.Filt needs six coefficients for raw biquad:");
          console.log("     a0 -> denominator gain for filter (y[n] term).");
          console.log("     b0 -> gain for current input (x[n] term).");
          console.log("     b1 -> gain for previous input (x[n-1] term).");
          console.log("     b2 -> gain for previous previous input (x[n-2] term).");
          console.log("     a1 -> gain for previous output (y[n-1] term).");
          console.log("     a2 -> gain for previous previous output (y[n-2] term).");
          console.log("when working with 5-coefficient biquad formulae set a0 to 1.0.");
          console.log("n.b. some systems will refer to y terms as 'b' and x terms as 'a'.");
        }
        else
        {
          this.a0 = _a0; // y[n] (overall gain)
          this.b0 = _b0; // x[n]
          this.b1 = _b1; // x[n-1]
          this.b2 = _b2; // x[n-2]
          this.a1 = _a1; // y[n-1]
          this.a2 = _a2; // y[n-2]
        }
      }

      // calculate filter coefficients from parameters
      p5.Filt.prototype.precalc = function()
      {
        // intermediates
        this.A = sqrt(pow(10, this.dB/20)); // amplitude
        this.w0 = 2*PI*this.f0/this.fs; // filter increment in radians
        this.cw0 = cos(this.w0); // cosine of w0 - precompute
        this.sw0 = sin(this.w0); // sine of w0 - precompute
        this.alpha = sin(this.w0)/(2*this.Q); // alpha term - precompute
        this.soff = 2*sqrt(this.A)*this.alpha; // shelving offset - precompute

        switch(this.type) {
          case "LPF":
          case "lowpass":
            this.b0 =  (1 - this.cw0)/2;
            this.b1 =   1 - this.cw0;
            this.b2 =  (1 - this.cw0)/2;
            this.a0 =   1 + this.alpha;
            this.a1 =  -2 * this.cw0;
            this.a2 =   1 - this.alpha;
          break;
          case "HPF":
          case "highpass":
            this.b0 =  (1 + this.cw0)/2;
            this.b1 = -(1 + this.cw0);
            this.b2 =  (1 + this.cw0)/2;
            this.a0 =   1 + this.alpha;
            this.a1 =  -2 * this.cw0;
            this.a2 =   1 - this.alpha;
          break;
          case "BPF":
          case "bandpass":
            this.b0 =   this.sw0/2;
            this.b1 =   0;
            this.b2 =  -this.sw0/2;
            this.a0 =   1 + this.alpha;
            this.a1 =  -2 * this.cw0;
            this.a2 =   1 - this.alpha;
          break;
          case "BPF0": // constant 0 peak gain
          case "resonant":
            this.b0 =   this.alpha;
            this.b1 =   0;
            this.b2 =  -this.alpha;
            this.a0 =   1 + this.alpha;
            this.a1 =  -2 * this.cw0;
            this.a2 =   1 - this.alpha;
          break;
          case "notch":
          case "bandreject":
          case "bandstop":
            this.b0 =   1;
            this.b1 =  -2 * this.cw0;
            this.b2 =   1;
            this.a0 =   1 + this.alpha;
            this.a1 =  -2 * this.cw0;
            this.a2 =   1 - this.alpha;
          break;
          case "APF":
          case "allpass":
            this.b0 =   1 - this.alpha;
            this.b1 =  -2 * this.cw0;
            this.b2 =   1 + this.alpha;
            this.a0 =   1 + this.alpha;
            this.a1 =  -2 * this.cw0;
            this.a2 =   1 - this.alpha;
          break;
          case "peakingEQ":
          case "peaknotch":
            this.b0 =   1 + this.alpha*this.A;
            this.b1 =  -2 * this.cw0;
            this.b2 =   1 - this.alpha*this.A;
            this.a0 =   1 + this.alpha/this.A;
            this.a1 =  -2 * this.cw0;
            this.a2 =   1 - this.alpha/this.A;
          break;
          case "lowShelf":
          case "lowshelf":
            this.b0 =    this.A*((this.A+1) - (this.A-1)*this.cw0 + this.soff);
            this.b1 =  2*this.A*((this.A-1) - (this.A+1)*this.cw0);
            this.b2 =    this.A*((this.A+1) - (this.A-1)*this.cw0 - this.soff);
            this.a0 =       (this.A+1) + (this.A-1)*this.cw0 + this.soff;
            this.a1 =   -2*((this.A-1) + (this.A+1)*this.cw0);
            this.a2 =       (this.A+1) + (this.A-1)*this.cw0 - this.soff;
          break;
          case "highShelf":
          case "highshelf":
            this.b0 =    this.A*((this.A+1) + (this.A-1)*this.cw0 + this.soff);
            this.b1 = -2*this.A*((this.A-1) + (this.A+1)*this.cw0);
            this.b2 =    this.A*((this.A+1) + (this.A-1)*this.cw0 - this.soff);
            this.a0 =       (this.A+1) - (this.A-1)*this.cw0 + this.soff;
            this.a1 =    2*((this.A-1) - (this.A+1)*this.cw0);
            this.a2 =       (this.A+1) - (this.A-1)*this.cw0 - this.soff;
          break;
          default: // pass through
            this.b0 = 1.;
            this.b1 = 0.;
            this.b2 = 0.;
            this.a0 = 1.;
            this.a1 = 0.;
            this.a2 = 0.;
          break;
        }

      }

  // =============================================================================
  //                         p5.FastFourierTransform
  // =============================================================================

  /**
   * Base class for an FFT (non-signal) module
   *
   * @class p5.FastFourierTranform
   * @constructor
   */
   p5.FastFourierTransform = function(_bufsize, _fs) {
     //
     // this object implements a simple FFT (fast fourier transform)
     // module using the 1965 cooley-tukey FFT algorithm:
     // http://www.ams.org/journals/mcom/1965-19-090/S0025-5718-1965-0178586-1/S0025-5718-1965-0178586-1.pdf
     //
     // there's a great breakdown of how the FFT algorithm works here:
     // https://www.cs.cmu.edu/afs/andrew/scs/cs/15-463/2001/pub/www/notes/fourier/fourier.pdf
     //
     // the code below is adapted from the FFT module in dsp.js written by @corbanbrook :
     // https://github.com/corbanbrook/dsp.js/
     // Copyright (c) 2010 Corban Brook, released under the MIT license
     //
     // p5.FastFourierTransform runs completely independent of the Web Audio
     // framework used by p5.sound / Tone.js, which allows you to analyze
     // and synthesize frequency-domain data regardless of whether it counts
     // as 'sound' or runs at audio rate.
     //

     // how many samples are we analyzing?
     // should be a power of 2.
     this.bufferSize = _bufsize ? _bufsize : 512;

     // fourier transforms are 'rate' agnostic...
     // the algorithm doesn't care how fast the signal is, so
     // the sampling rate here is simply to calculate
     // getBandFrequency() as a utility function so we can
     // find out, e.g. the center frequency of a specific FFT bin.
     this.sampleRate = _fs ? _fs : 60;
     this.bandwidth  = 2 / this.bufferSize * this.sampleRate / 2; // used for getBandFrequency()

     // data arrays for the magnitude / phase spectrum and the raw real/imaginary
     // FFT data.  note that the spectrum (correctly) only needs a half frame of
     // data, as the FFT output is mirrored for bins above nyquist (SR/2).
     this.spectrum   = new Float64Array(this.bufferSize/2);
     this.phase      = new Float64Array(this.bufferSize/2);
     this.real       = new Float64Array(this.bufferSize);
     this.imag       = new Float64Array(this.bufferSize);

     // the calculateSpectrum() method will stash the 'loudest'
     // bin, as well as its value.
     this.peakBand   = 0; // peak band (FFT bin)
     this.peak       = 0.; // peak value.

     // calculate the FFT 'reverse table'.
     // the reverse table is a super groovy hack that helps put the
     // 'fast' in fast fourier transform.
     //
     // to quote jim noxon at texas instruments :
     // "The purpose of having this table is due to a quirk of the FFT algorithm.
     // As it turns out, the indexing done in the FFT algorithm (and the IFFT too)
     // relates the input index to the output index in a manner where reversing
     // the bits of the input index creates the appropriate index for the output.
     // As you can see the inner for() loop would have to be run for every
     // input to output index operation of the FFT algorithm so by creating a table
     // up front, the FFT algorithm can be run multiple times and only needs to
     // be calculated once. Further, if this table is calculated at compile time,
     // then there is no dynamic initialization necessary at all. Now, it is
     // simply a look up into the table using the input index to generate the
     // output index. Some DSPs have a special addressing mode that does this
     // automatically eliminating the need for the table all together."
     //
     this.reverseTable = new Uint32Array(this.bufferSize);

     var limit = 1;
     var bit = this.bufferSize >> 1;

     var i;

     while (limit < this.bufferSize) {
       for (i = 0; i < limit; i++) {
         this.reverseTable[i + limit] = this.reverseTable[i] + bit;
       }

       limit = limit << 1;
       bit = bit >> 1;
     }

     // precompute sine and cosine sampling increment (SI) arrays.
     this.sinTable = new Float64Array(this.bufferSize);
     this.cosTable = new Float64Array(this.bufferSize);

     for (i = 0; i < this.bufferSize; i++) {
       // we never call index 0, which is NaN
       this.sinTable[i] = sin(-PI/i);
       this.cosTable[i] = cos(-PI/i);
     }

   };     // end p5.FastFourierTransform constructor

   // query the center frequency of a specific FFT band (e.g. the peakBand).
   // remember that this is the frequency of the *filter*, not necessarily
   // the signal that is actuating the filter. to find that out you would
   // compute running phase off of sequential frames of data to see whether
   // the phase in the bin is rising or falling, and use that to compute
   // the frequency differential between the band and the actuating signal.
   p5.FastFourierTransform.prototype.getBandFrequency = function(_index) {
     return this.bandwidth * _index + this.bandwidth / 2;
   }

   // calculate the spectrum (magnitude / phase) from the cartesian
   // (real / imaginary - x / y) raw FFT output. this is basically a
   // pythagorean transformation, with the magnitudes scaled to ranges
   // based on the FFT size.
   p5.FastFourierTransform.prototype.calculateSpectrum = function() {
     var rval, ival, mag, phase;
     var bSi       = 2 / this.bufferSize; // scaling factor for magnitudes

     this.peakBand = 0; // reset each spectral frame
     this.peak = 0; // reset each spectral frame

     for (var i = 0, N = this.bufferSize/2; i < N; i++) {
       rval = this.real[i]; // x
       ival = this.imag[i]; // y
       mag = bSi * sqrt(rval * rval + ival * ival);
       phase = atan2(ival/rval);
       if (mag > this.peak) {
         this.peakBand = i;
         this.peak = mag;
       }

       this.spectrum[i] = mag;
       this.phase[i] = phase;
     }
   }

    // performs a forward FFT transform on a sample buffer.
    // this converts the data from the time domain into the frequency domain.
    // fills up the real and imag buffers in the object's data structure,
    // and also runs calculateSpectrum() to get the magnitude and phase.
    p5.FastFourierTransform.prototype.forward = function(_buffer) {

     var k = floor(log(this.bufferSize) / Math.LN2);

     if (pow(2, k) !== this.bufferSize) { throw "buffer size must be a power of 2."; }
     if (this.bufferSize !== _buffer.length)  { throw "buffer is not the same size as defined FFT. FFT: " + bufferSize + " buffer: " + buffer.length; }

     var halfSize = 1;
     var phaseShiftStepReal, phaseShiftStepImag;
     var currentPhaseShiftReal, currentPhaseShiftImag;
     var tr, ti;
     var tmpReal;
     var i, o;

     // STEP 1 - fill up the 'real' array with the signal according to the reverseTable ordering
     // makes it faster for memory access later as it's already copied in there and we can adjustable
     // iterate through it.
     for (i = 0; i < this.bufferSize; i++) {
       this.real[i] = _buffer[this.reverseTable[i]];
       this.imag[i] = 0;
     }

     // STEP 2 - do the actual discrete fourier transform (DFT).
     // halfSize will increment in powers of two up to half of the FFT size (nyquist)
     // so for a 1024-sample FFT, we're doing 10 outer loops (1, 2, 4, 8, 16, 32, 64, 128, 256, 512).
     while (halfSize < this.bufferSize) {
       // figure out the phase increment necessary for each sample size
       phaseShiftStepReal = this.cosTable[halfSize];
       phaseShiftStepImag = this.sinTable[halfSize];

       // starting x,y positions
       currentPhaseShiftReal = 1;
       currentPhaseShiftImag = 0;

       // intermediate loop - fftStep will increment from 0 to halfSize-1,
       // i.e. number of fftStep loops equals to halfSize each time.
       // each one of these passes is a DFT.
       for (var fftStep = 0; fftStep < halfSize; fftStep++) {

         i = fftStep;

         // inner loop - i and o will integrate the convolution of the input signal
         // with cosine and sine functions at a period equal to the fftStep
         while (i < this.bufferSize) {
           o = i + halfSize;
           // uncomment the line below to see what's going on:
           // console.log('halfSize : ' + halfSize + ', fftStep : ' + fftStep + ', i : ' + i + ', o : ' + o + ', psr : ' + currentPhaseShiftReal + ', psi : ' + currentPhaseShiftImag);
           tr = (currentPhaseShiftReal * this.real[o]) - (currentPhaseShiftImag * this.imag[o]);
           ti = (currentPhaseShiftReal * this.imag[o]) + (currentPhaseShiftImag * this.real[o]);

           this.real[o] = this.real[i] - tr;
           this.imag[o] = this.imag[i] - ti;
           this.real[i] += tr;
           this.imag[i] += ti;

           i += halfSize << 1;
         }

         // increment the sampling interval for the next DFT in the loop:
         tmpReal = currentPhaseShiftReal;
         currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
         currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
       }

       // shift up halfSize for next outer loop
       halfSize = halfSize << 1;
     }

     this.calculateSpectrum(); // calculate mag/phase from real/imag
   }

   // performs an inverse FFT transform (an IFFT) on either real/imag
   // data passed into the function or, if called without arguments,
   // the current spectral frame stored in the object.
   // this converts the data from the frequency domain into the time domain.
   // the function returns a buffer containing the time-domain signal.
   p5.FastFourierTransform.prototype.inverse = function(_real, _imag) {

     _real = _real || this.real;
     _imag = _imag || this.imag;

     var halfSize = 1;
     var phaseShiftStepReal, phaseShiftStepImag;
     var currentPhaseShiftReal, currentPhaseShiftImag;
     var off;
     var tr, ti;
     var tmpReal;
     var i;

     for (i = 0; i < this.bufferSize; i++) {
       _imag[i] *= -1;
     }

     var revReal = new Float64Array(this.bufferSize);
     var revImag = new Float64Array(this.bufferSize);

     for (i = 0; i < _real.length; i++) {
       revReal[i] = _real[this.reverseTable[i]];
       revImag[i] = _imag[this.reverseTable[i]];
     }

     _real = revReal;
     _imag = revImag;

     while (halfSize < this.bufferSize) {
       phaseShiftStepReal = this.cosTable[halfSize];
       phaseShiftStepImag = this.sinTable[halfSize];
       currentPhaseShiftReal = 1;
       currentPhaseShiftImag = 0;

       for (var fftStep = 0; fftStep < halfSize; fftStep++) {
         i = fftStep;

         while (i < this.bufferSize) {
           off = i + halfSize;
           tr = (currentPhaseShiftReal * _real[off]) - (currentPhaseShiftImag * _imag[off]);
           ti = (currentPhaseShiftReal * _imag[off]) + (currentPhaseShiftImag * _real[off]);

           _real[off] = _real[i] - tr;
           _imag[off] = _imag[i] - ti;
           _real[i] += tr;
           _imag[i] += ti;

           i += halfSize << 1;
         }

         tmpReal = currentPhaseShiftReal;
         currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
         currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
       }

       halfSize = halfSize << 1;
     }

     var buffer = new Float64Array(this.bufferSize); // this should be reused instead
     for (i = 0; i < this.bufferSize; i++) {
       buffer[i] = _real[i] / this.bufferSize;
     }

     return buffer;
   }


  // =============================================================================
  //                   Luke's Misc. Utilities (extends p5.js)
  // =============================================================================

  // constrained integer mapping function (useful for array lookup).
  // similar to the Max [zmap] object when used with integers.
  // syntactically equivalent to the p5.js / processing map() function.
  p5.prototype.imap = function(_x, _a, _b, _c, _d) {
    return(constrain(floor(map(_x, _a, _b, _c, _d)), min(_c,_d), max(_c, _d)-1));
  }

  // number wrapping (courtesy of @pd-l2ork puredata [pong])
  p5.prototype.wrap = function(_x, _min, _max) {
    _a = min(_min, _max);
    _b = max(_min, _max);
    var _y;
    var _r = _b-_a; // range
    if(_x < _b && _x >= _a) { // normal
      return(_x);
		}
    else if(_a==_b) { // catch
      return(_a);
    }
    else {
      if(_x < _a) {
			    _y = _x;
          while(_y < _a){
            _y += _r;
          };
		  }
      else {
        _y = ((_x-_a)%_r) + _a;
      }
    }
    return(_y);
  }

  // number folding (courtesy of @pd-l2ork puredata [pong])
  p5.prototype.fold = function(_x, _min, _max) {
    _a = min(_min, _max);
    _b = max(_min, _max);
    var _y;
    var _r = _b-_a; // range
    if(_x < _b && _x >= _a) { // normal
      return(_x);
		}
    else if(_a==_b) { // catch
      return(_a);
    }
    else {
      if(_x < _a) {
        var _d = _a - _x; // diff between input and minimum (positive)
        var _m = floor(_d/_r); // case where input is more than a range away from minval
        if(_m % 2 == 0) { // even number of ranges away = counting up from min
          _d = _d - _m*_r;
          _y = _d + _a;
        }
        else { // odd number of ranges away = counting down from max
          _d = _d - _m*_r;
          _y = _b - _d;
        }
      }
      else { // input > maxval
        var _d = _x - _b; // diff between input and max (positive)
        var _m  = floor(_d/_r); // case where input is more than a range away from maxval
        if(_m % 2 == 0) { // even number of ranges away = counting down from max
          _d = _d - _m*_r;
          _y = _b - _d;
        }
        else { //odd number of ranges away = counting up from min
          _d = _d - _m*_r;
          _y = _d + _a;
        }
      }
    }
    return(_y);
  }

  // pick a random element from an array
  p5.prototype.pickrand = function(_array) {
    return(_array[floor(random(_array.length))]);
  }

  // create n-dimensional arrays
  p5.prototype.createArray = function(_len)
  {
    var _arr = new Array(_len || 0).fill(0),
        i = _len;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) _arr[_len-1 - i] = this.createArray.apply(this, args);
    }
    return _arr;
  }

  // normalize a numerical array to absmax=1.0 without shifting DC
  p5.prototype.normalizeArray = function(_array) {
    var _max = max(max(_array), abs(min(_array)));
    return(_array.map(function(_v) { return _v/_max; }));
  }

  // resize a numerical array to a new size with linear interpolation
  p5.prototype.resizeArray = function(_array, _newlen) {
    var _out = [];
    for(var i = 0;i<_newlen;i++)
    {
      var aptr = map(i, 0, _newlen-1, 0, _array.length-1);
      var a = floor(aptr);
      var b = ceil(aptr);
      var l = aptr%1.0;

      _out[i] = lerp(_array[a], _array[b], l);
    }
    return(_out);
  }

  // multiply two arrays
  p5.prototype.multiplyArray = function(_a1, _a2) {
    if(!Array.isArray(_a2)) _a2 = [_a2]; // allow scalars
    var _out = [];
    if(_a1.length!=_a2.length) _a2 = resizeArray(_a2, _a1.length);
    for(var i = 0;i<_a1.length;i++)
    {
      _out[i] = _a1[i] * _a2[i];
    }
    return(_out);
  }

  // add two arrays
  p5.prototype.addArray = function(_a1, _a2) {
    if(!Array.isArray(_a2)) _a2 = [_a2]; // allow scalars
    var _out = [];
    if(_a1.length!=_a2.length) _a2 = resizeArray(_a2, _a1.length);
    for(var i = 0;i<_a1.length;i++)
    {
      _out[i] = _a1[i] + _a2[i];
    }
    return(_out);
  }

  // return the sum of an array
  p5.prototype.sumArray = function(_a) {
    var _s = _a.reduce(function(_acc, _val) {
      return(_acc+_val);
    });
    return(_s);
  }

  // Java Float.floatToIntBits() IEEE 754 / 32-bit (h/t @mattdesl):
  p5.prototype.f2ib = function(_x)
  {
    var int8 = new Int8Array(4);
    var int32 = new Int32Array(int8.buffer, 0, 1);
    var float32 = new Float32Array(int8.buffer, 0, 1);
    float32[0] = _x;
    return(int32[0]);
  }

  // Java Float.intBitstoFloat() IEEE 754 / 32-bit (h/t @mattdesl):
  p5.prototype.ib2f = function(_x)
  {
    var int8 = new Int8Array(4);
    var int32 = new Int32Array(int8.buffer, 0, 1);
    var float32 = new Float32Array(int8.buffer, 0, 1);
    int32[0] = _x;
    return(float32[0]);
  }

  // normalized sinc function (integral equals 1, not PI)
  // the normalized sinc is the FT of the rectangular function.
  // 'sinc' is short for sinus cardinalis (woodward '52):
  // http://www.norbertwiener.umd.edu/crowds/documents/Woodward52.pdf
  p5.prototype.sinc = function(_x) {
    return(sin(PI*_x)/(PI*_x));
  }

  // besselI0 - regular modified cylindrical Bessel function (Bessel I)
  // https://en.wikipedia.org/wiki/Bessel_function
  // ported from kbdwindow.cpp by craig stuart sapp @ CCRMA ca. 2001
  p5.prototype.besselI0 = function(_x) {
    var denominator;
    var numerator;
    var z;

    if (_x == 0.0) {
        return(1.0);
    } else {
        z = _x * _x;
        numerator = (z* (z* (z* (z* (z* (z* (z* (z* (z* (z* (z* (z* (z*
            (z* 0.210580722890567e-22  + 0.380715242345326e-19 ) +
            0.479440257548300e-16) + 0.435125971262668e-13 ) +
            0.300931127112960e-10) + 0.160224679395361e-7  ) +
            0.654858370096785e-5)  + 0.202591084143397e-2  ) +
            0.463076284721000e0)   + 0.754337328948189e2   ) +
            0.830792541809429e4)   + 0.571661130563785e6   ) +
            0.216415572361227e8)   + 0.356644482244025e9   ) +
            0.144048298227235e10);

        denominator = (z*(z*(z-0.307646912682801e4)+
            0.347626332405882e7)-0.144048298227235e10);
    }
    return(-numerator/denominator);
  }

  // plot an array to the console as if it were a VT100 terminal.
  // ported from a copy of fplot.c found on luke's NeXTstation.
  // fplot.c seems rewritten from FORTRAN, presumably by
  // paul lansky, while porting MIX to C in 83/84.
  // man page last troff'ed january 31, 1987, 6:56PM by paul lansky.
  // c code last modified october 18, 1990, 2:26PM by brad garton.
  p5.prototype.fplot = function(_array, _css) {
    var a;
    if(!Array.isArray(_array)) a = [_array]; // single value
    if(Array.isArray(_array)) a = _array; // normal array
    if(_array.constructor == Float32Array) a = Array.prototype.slice.call(_array);
    if(_array.constructor == Float64Array) a = Array.prototype.slice.call(_array);

    var TERMWIDTH = 80; // columns (1 additional will be used for left margin)
    var TERMHEIGHT = 23; // VT100 is 24 rows ('take back one kadam...')
    var out = [];
    var si, phase;
    var i, j, k, len, wave;
    var line = '';
    len = _array.length;

    // decimate or interpolate array to TERMWIDTH values, scale to absmax=1.
    out = resizeArray(a, TERMWIDTH);
    out = normalizeArray(out);

    // plot the fucker
    si = 1./((TERMHEIGHT-1)/2.);
    phase = 1.;
    for(i = 0; i < TERMHEIGHT; i++) {
      k = 0;
      // add alternator to left margin of line - prevents browser consoles
      // from interpreting duplicate lines and only printing them once:
      if(i%2) line= '~'; else line='|';
      // format line based on function being within phase boundary
      for(j = 0; j < TERMWIDTH-1; j++) {
        if(isNaN(out[j])) out[j] = 0; // filter out garbage
        if((out[j]>=phase) && (out[j]<phase+si)) {
          line+= (out[j+1] > phase+si) ? '/' : '-';
          if(out[j+1] < phase) line+= '\\';
          k = j;
          }
          else if (((out[j]<phase)&&(out[j+1]>phase+si)) ||
          ((out[j]>phase+si)&&(out[j+1]<phase))) {
            line+= '|';
            k = j;
          }
        else line+= ' '; // function isn't within range... fill with space
      }
      // center line
      if ((0>=phase) && (0<phase+si)) {
        line = '~'; // alternator
        for(j = 0; j < TERMWIDTH; j++) line+= '-';
        k = TERMWIDTH-2;
      }
      console.log('%c'+line, _css); // print, including CSS
      phase-= si; // decrement phase
    }

    return(0);
  }

}));

/*
todo:
*/

// EOF
