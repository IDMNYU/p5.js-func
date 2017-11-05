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
 *  RTcmix Scorefile Commands: http://rtcmix.org/reference/scorefile/
 *  Robert Penner's Easing Functions: http://robertpenner.com/easing/
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
      // evaluation with utility functions to preload arrays.
      //

      this.version = 0.01; // just some crap for constructor

      var that = this; // some bullshit

    };     // end p5.Gen constructor

    // harmonic / periodic wave from a list of partial strengths.
    // Csound / RTcmix GEN10, ported from RTcmix via PeRColate.
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
    // Csound / RTcmix GEN17, ported from RTcmix via PeRColate.
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
    p5.Gen.prototype.random = function() {
      /*
      distributions based on RTcmix GEN20:
      even distribution ["even" or "linear"]
      low weighted linear distribution ["low"]
      high weighted linear distribution ["high"]
      triangle linear distribution ["triangle"]
      gaussian distribution ["gaussian"]
      cauchy distribution ["cauchy"]
      */
      var u = true; // single value?
      var _type = 'linear';
      var _s = 0.;

      if(typeof(arguments[0])!='string') {
        if(!Array.isArray(arguments[0]) && arguments[0].constructor !== Float32Array && arguments[0].constructor !== Float64Array) {
          _x = [arguments[0]]; // process all values as arrays
          u = false;
        }
        else _x = arguments[0];
        if(typeof(arguments[1])==='string')
        {
          _type = arguments[1];
        }
      }
      else
      {
        _x = [millis()];
        u = false;
        if(typeof(arguments[0])==='string') _type=arguments[0];
      }
      var _v; // match type:
      if(Array.isArray(_x)) _v= new Array(_x.length);
      else if(_x.constructor === Float32Array) _v = new Float32Array(_x.length);
      else if(_x.constructor === Float64Array) _v = new Float64Array(_x.length);

      if(_x[0]==='m') randomSeed(millis()*100000.);
      for(var i in _x)
      {
        if(_x[i]!='m') randomSeed(_x[i]*100000.);
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
    // Csound GEN20 / RTcmix GEN25, rewritten by rld.
    // equations from Wikipedia: https://en.wikipedia.org/wiki/Window_function
    p5.Gen.prototype.window = function(_x, _type) {
      /*
      flag order based on CSOUND GEN20:
      1 = hamming
      2 = hanning
      3 = bartlett (triangle)
      4 = blackman (3-term)
      5 = blackman-harris (4-term)
      6 = gaussian
      7 = kaiser
      8 = rectangle
      9 = sinc
      */
      var u = true; // single value?
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
        // gaussians are eigenfunctions of fourier transforms.
        // gaussian window needs to be zeroed at the ends.
        // parabolic.
        case 6:
        case "gaussian":
          var sigma = 0.4;
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
        // named for cornelius lanczos (1906-1974).
        // a normalized (double-window) since function is often
        // used as a kernel for interpolation / low-pass filtering.
        case 9:
        case "sinc":
        case "sync": // learn to spell
        case "lanczos":
          for(i in _x) _y[i] = sinc(2*_x[i]-1.0);
        break;
        default:
      }
      return(u ? _y : _y[0]);
    }

    // common waveform functions for synthesis.
    p5.Gen.prototype.waveform = function(_x, _type) {
      /*
      algorithms:
      sine
      saw / sawup
      sawdown
      phasor (ramp 0.-1.)
      square
      rect / rectangle
      pulse
      tri / triangle
      buzz
      */
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
          _y = this.harmonics(_x, [1.]);
          break;
        // rising saw -1. to 1.
        case "saw": // very much no
        case "sawtooth": // very much no
        case "sawup": // very much no
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

      if(_algo==='random') {
        for(var i = 0;i<_len;i++)
        {
          if(_seed) _p[i] = i/(_len-1)*10000.+_seed;
          else _p[i] = 'm';
        }
      }
      else {
        for(var i = 0;i<_len;i++)
        {
          _p[i] = i/(_len-1); // 0.-1.
        }
      }
      _dest = this[_algo](_p, _args);


      return(_dest);
    }

    // array xfer (for pre-rendered use)
    p5.Gen.prototype.fillFloat32Array = function(_algo, _len, _args, _seed) {
      var _p = new Float32Array(_len);
      var _dest = new Float32Array(_len);

      if(_algo==='random') {
        for(var i = 0;i<_len;i++)
        {
          if(_seed) _p[i] = i/(_len-1)*10000.+_seed;
          else _p[i] = 'm';
        }
      }
      else {
        for(var i = 0;i<_len;i++)
        {
          _p[i] = i/(_len-1); // 0.-1.
        }
      }
      _dest = this[_algo](_p, _args);
      return(_dest);
    }

    // array xfer (for pre-rendered use)
    p5.Gen.prototype.fillFloat64Array = function(_algo, _len, _args, _seed) {
      var _p = new Float64Array(_len);
      var _dest = new Float64Array(_len);

      if(_algo==='random') {
        for(var i = 0;i<_len;i++)
        {
          if(_seed) _p[i] = i/(_len-1)*10000.+_seed;
          else _p[i] = 'm';
        }
      }
      else {
        for(var i = 0;i<_len;i++)
        {
          _p[i] = i/(_len-1); // 0.-1.
        }
      }
      _dest = this[_algo](_p, _args);


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
     // based on robert penner's algorithms discussed in
     // 'programming macromedia flash mx' (2002).
     //

    this.version = 0.01; // just some crap for constructor

    var that = this; // some bullshit

  };     // end p5.Gen constructor


// Easing Functions:

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
  p5.Ease.prototype.fillArray = function(_algo, _len) {
    var _dest = new Array(_len);
    for(var i = 0;i<_len;i++)
    {
      var _p = i/(_len-1); // 0.-1.
      _dest[i] = this[_algo](_p);
    }
    return(_dest);
  }

  // array xfer (for pre-rendered use)
  p5.Ease.prototype.fillFloat32Array = function(_algo, _len) {
    var _dest = new Float32Array(_len);
    for(var i = 0;i<_len;i++)
    {
      var _p = i/(_len-1); // 0.-1.
      _dest[i] = this[_algo](_p);
    }
    return(_dest);
  }

  // array xfer (for pre-rendered use)
  p5.Ease.prototype.fillFloat64Array = function(_algo, _len) {
    var _dest = new Float64Array(_len);
    for(var i = 0;i<_len;i++)
    {
      var _p = i/(_len-1); // 0.-1.
      _dest[i] = this[_algo](_p);
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
     p5.ArrayEval = function(_evalstr, _len) {
      //
      // this object implements an 'eval'-style
      // equation evaluator across n-dimensional arrays.
      // insired by the 'exprfill' / [jit.expr] functionality
      // in Max/MSP.
      //

      this.version = 0.01; // just some crap for constructor

      var that = this; // some bullshit

      // global dims
      var l1 = 0;
      var l2 = 0;
      var l3 = 0;

    };     // end p5.ArrayEval constructor

    // array return - 1d
    p5.ArrayEval.prototype.eval = function(_evalstr, _len) {
      this.l1 = _len; // make global

      var _dest = this.createArray(_len);
      // string expansion
      // u unwraps to 0-1
      // su unwraps to -1 to 1
      // cu unwraps to cell value (0 to dim)
      // du unwraps to a constant representing the dimension (size)
      _evalstr = _evalstr.replace(/cu/g, "i");
      _evalstr = _evalstr.replace(/du/g, "l1");
      _evalstr = _evalstr.replace(/su/g, "(i/(l1-1)*2.-1.)");
      _evalstr = _evalstr.replace(/u/g, "(i/(l1-1))");

      console.log(_evalstr);
      for(var i = 0;i<this.l1;i++)
      {
        _dest[i] = eval('with(this) { ' + _evalstr + ' }');
        //console.log(_dest[i]);
      }
      return(_dest);
    }

    // array return - 2d
    p5.ArrayEval.prototype.eval2d = function(_evalstr, _l1, _l2) {
      this.l1 = _l1; // make global
      this.l2 = _l2; // make global

      var _dest = this.createArray(_l1, _l2);
      // string expansion
      // u unwraps to 0-1
      // su unwraps to -1 to 1
      // cu unwraps to cell value (0 to dim)
      // du unwraps to a constant representing the dimension (size)
      _evalstr = _evalstr.replace(/cu/g, "i");
      _evalstr = _evalstr.replace(/du/g, "l1");
      _evalstr = _evalstr.replace(/su/g, "(i/(l1-1)*2.-1.)");
      _evalstr = _evalstr.replace(/u/g, "(i/(l1-1))");
      // string expansion
      // v unwraps to 0-1
      // sv unwraps to -1 to 1
      // cv unwraps to cell value (0 to dim)
      // dv unwraps to a constant representing the dimension (size)
      _evalstr = _evalstr.replace(/cv/g, "j");
      _evalstr = _evalstr.replace(/dv/g, "l2");
      _evalstr = _evalstr.replace(/sv/g, "(j/(l2-1)*2.-1.)");
      _evalstr = _evalstr.replace(/v/g, "(j/(l2-1))");

      for(var i = 0;i<this.l1;i++)
      {
        for(var j = 0;j<this.l2;j++)
        {
          _dest[i][j] = eval('with(this) { ' + _evalstr + ' }');
        }
      }
      return(_dest);
    }

    // array return - 3d
    p5.ArrayEval.prototype.eval3d = function(_evalstr, _l1, _l2, _l3) {
      this.l1 = _l1; // make global
      this.l2 = _l2; // make global
      this.l3 = _l3; // make global

      var _dest = this.createArray(_l1, _l2, _l3);
      //console.log(_dest);
      // string expansion
      // u unwraps to 0-1
      // su unwraps to -1 to 1
      // cu unwraps to cell value (0 to dim)
      // du unwraps to a constant representing the dimension (size)
      _evalstr = _evalstr.replace(/cu/g, "i");
      _evalstr = _evalstr.replace(/du/g, "l1");
      _evalstr = _evalstr.replace(/su/g, "(i/(l1-1)*2.-1.)");
      _evalstr = _evalstr.replace(/u/g, "(i/(l1-1))");
      // v unwraps to 0-1
      // sv unwraps to -1 to 1
      // cv unwraps to cell value (0 to dim)
      // dv unwraps to a constant representing the dimension (size)
      _evalstr = _evalstr.replace(/cv/g, "j");
      _evalstr = _evalstr.replace(/dv/g, "l2");
      _evalstr = _evalstr.replace(/sv/g, "(j/(l2-1)*2.-1.)");
      _evalstr = _evalstr.replace(/v/g, "(j/(l2-1))");
      // w unwraps to 0-1
      // sw unwraps to -1 to 1
      // cw unwraps to cell value (0 to dim)
      // dw unwraps to a constant representing the dimension (size)
      _evalstr = _evalstr.replace(/cw/g, "k");
      _evalstr = _evalstr.replace(/dw/g, "l3");
      _evalstr = _evalstr.replace(/sw/g, "(k/(l3-1)*2.-1.)");
      _evalstr = _evalstr.replace(/w/g, "(k/(l3-1))");

      for(var i = 0;i<this.l1;i++)
      {
        for(var j = 0;j<this.l2;j++)
        {
          for(var k = 0;k<this.l3;k++)
          {
            _dest[i][j][k] = eval('with(this) { ' + _evalstr + ' }');
          }
        }
      }
      return(_dest);
    }

    // p5.ArrayEval.prototype.eval_iter = function(_arr, d, _estr)
    // {
    //   //console.log(d);
    //   _arr.forEach(function each(item, idx) {
    //     id[id.length-1] = idx;
    //     if (Array.isArray(item)) {
    //       // If is array, continue repeat loop
    //       d++;
    //       id.push(0);
    //       eval_iter(item, d);
    //       id.pop();
    //       d--;
    //     } else {
    //       item = eval('with(this) { ' + _estr + ' }');
    //       console.log(d + " " + id + " " + item);
    //     }
    //   });
    //   return(_arr);
    // }

    p5.ArrayEval.prototype.createArray = function(_len)
    {
      var _arr = new Array(_len || 0).fill(0),
          i = _len;

      if (arguments.length > 1) {
          var args = Array.prototype.slice.call(arguments, 1);
          while(i--) _arr[_len-1 - i] = this.createArray.apply(this, args);
      }

      return _arr;
    }


  // =============================================================================
  //                         Luke's Misc. Utilities
  // =============================================================================

  // constrained integer mapping function (useful for array lookup).
  // similar to the Max [zmap] object when used with integers.
  // syntactically equivalent to the p5.js / processing map() function.
  p5.prototype.imap = function(v, a, b, c, d) {
    return(constrain(floor(map(v, a, b, c, d)), min(c,d), max(c, d)-1));
  }

  // normalize a numerical array to absmax=1.0 without shifting DC
  p5.prototype.normalizeArray = function(_array) {
    var _max = max(max(_array), abs(min(_array)));
    return(_array.map(function(_v) { return _v/_max; }));
  }

  // resize a numerical array to a new size with linear interpolation
  p5.prototype.resizeArray = function(_array, _newlen) {
    // decimate or interpolate array to TERMWIDTH values, scale to absmax=1.
    var _out = [];
    for(i = 0;i<_newlen;i++)
    {
      var aptr = map(i, 0, _newlen-1, 0, _array.length-1);
      var a = floor(aptr);
      var b = ceil(aptr);
      var l = aptr%1.0;

      _out[i] = lerp(_array[a], _array[b], l);
    }
    return(_out);
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
  // man page last troff'ed january 31, 1987, 6:56PM by paul lansky.
  // c code last modified october 18, 1990, 2:26PM by brad garton.
  p5.prototype.fplot = function(_array, _css) {
    if(!Array.isArray(_array)) _array = [_array];
    var TERMWIDTH = 80; // columns (2 additional will be used for left margin)
    var TERMHEIGHT = 23; // VT100 is 24 rows ('take back one kadam...')
    var out = [];
    var si, phase;
    var i, j, k, len, wave;
    var line = '';
    len = _array.length;

    // decimate or interpolate array to TERMWIDTH values, scale to absmax=1.
    out = resizeArray(_array, TERMWIDTH);
    out = normalizeArray(out);

    // plot the fucker
    si = 1./((TERMHEIGHT-1)/2.);
    phase = 1.;
    for(i = 0; i < TERMHEIGHT; i++) {
      k = 0;
      // add indices to left margin of line - prevents browser consoles
      // from interpreting duplicate lines and only printing them once:
      if(i<10) line= ' '+i; else line=i;
      // format line based on function being within phase boundary
      for(j = 0; j < TERMWIDTH-1; j++) {
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
        line = i;
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




// var cubes = [
//  [1, 2, 3],
//  [4, 5, 6],
//  [7, 8, 9]
// ];
// var dim = 0;
// var id = [0];
// var e = ['PI'];
// var a = eval_iter(cubes, dim, e);
// console.log(a);
//
// function eval_iter(arr, d, evalstr)
// {
//   console.log(d);
//   arr.forEach(function each(item, idx) {
//     id[id.length-1] = idx;
//     if (Array.isArray(item)) {
//       // If is array, continue repeat loop
//       d++;
//       id.push(0);
//       eval_iter(item, d);
//       id.pop();
//       d--;
//     } else {
//       eval(evalstr);
//       console.log(d + " " + id + " " + item);
//     }
//   });
//   return(arr);
// }
