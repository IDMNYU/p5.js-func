// <3 rld

var FFTSIZE = 512;
var FS = 60;

var filt;
var x; // sig pointer
var gen;

var isig = new Array(FFTSIZE); // collector signal (input)
var osig = new Array(FFTSIZE); // collector signal (output)
var win = new Array(FFTSIZE); // window function

var ifft, offt;

function setup()
{
  createCanvas(1280, 720);
  background(255);
  fill(0);

  textSize(18);
  text("Unit Test for p5.Filt()", 40, 40);

  filt = new p5.Filt(FS);
  filt.set("LPF", 5, 1, 0);
  x = 0;

  ifft = new p5.FastFourierTransform(FFTSIZE, FS);
  offt = new p5.FastFourierTransform(FFTSIZE, FS);

  gen = new p5.Gen();
  win = gen.fillArray('window', FFTSIZE, 'hanning');

}

function draw()
{

  var n = random(-1., 1.);
  var f = filt.tick(n);

  fill(0);
  ellipse(x+width*0.1, map(n, -1., 1., height*0.4, height*0.2), 5, 5);
  ellipse(x+width*0.1, map(f, -1., 1., height*0.8, height*0.6), 5, 5);

  isig[x] = n;
  osig[x] = f;

  x++;

  if(x>511) {
    ifft.forward(multiplyArray(isig, win));
    offt.forward(multiplyArray(osig, win));

    x = 0;
    background(255);
    fill(0);
    text("Unit Test for p5.Filt()", 40, 40);
    text("input:", width*0.1, height*0.15);
    text("output:", width*0.1, height*0.55);
    text("peak: " + ifft.getBandFrequency(ifft.peakBand).toFixed(4) + "Hz at " + ifft.peak.toFixed(4), width*0.6, height*0.2);
    text("peak: " + offt.getBandFrequency(offt.peakBand).toFixed(4) + "Hz at " + offt.peak.toFixed(4), width*0.6, height*0.6);

    fill(200);
    rect(width*0.6, height*0.2, width*0.35, height*0.2);
    rect(width*0.6, height*0.6, width*0.35, height*0.2);

    noFill();
    beginShape();
    for(var i in ifft.spectrum)
    {
      var xs = map(i, 0, ifft.spectrum.length-1, width*0.6, width*0.95);
      var ys = map(ifft.spectrum[i], 0, ifft.peak, height*0.4, height*0.2);
      ellipse(xs, ys, 2, 2);
      vertex(xs, ys);
    }
    endShape();

    beginShape();
    for(var i in offt.spectrum)
    {
      var xs = map(i, 0, offt.spectrum.length-1, width*0.6, width*0.95);
      var ys = map(offt.spectrum[i], 0, offt.peak, height*0.8, height*0.6);
      ellipse(xs, ys, 2, 2);
      vertex(xs, ys);
    }
    endShape();

    var inv = Array.from(offt.inverse(offt.real, offt.imag));
    console.log(inv);
    fplot(Array.from(inv));
  }

}
