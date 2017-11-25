// <3 rld

var FR = 30;
var SPF = 64; // samples per frame
var FS = FR*SPF;
var FFTSIZE = SPF;

var x; // sig pointer
var gen;

var sig = new Array(FFTSIZE); // collector signal (input)
var win = new Array(FFTSIZE); // window function

var fft;


function setup()
{
  createCanvas(1280, 720);
  noLoop();
  background(255);
  fill(0);

  textSize(18);
  text("Unit Test for p5.Fourier()", 40, 40);
  text("input:", width*0.1, height*0.15);
  text("output:", width*0.1, height*0.55);

  x = 0;


  fft = new p5.FastFourierTransform(FFTSIZE, FS);

  gen = new p5.Gen();
  //sig = gen.fillArray('random', FFTSIZE);
  //sig = gen.fillArray('harmonics', FFTSIZE, [0, 0, 0, 0, 1., 0, 0, 0, 1]);
  sig = gen.fillArray('waveform', FFTSIZE, 'square');

  win = gen.fillArray('window', FFTSIZE, 'hanning');



  drawFFTandClear();

}

function draw()
{

}

function drawFFTandClear()
{
  fft.forward(multiplyArray(sig, win));

  background(255);
  fill(0);
  textSize(18);
  text("Unit Test for p5.Fourier()", 40, 40);
  text("signal:", width*0.1, height*0.15);
  text("peak: " + fft.getBandFrequency(fft.peakBand).toFixed(4) + "Hz at " + fft.peak.toFixed(4), width*0.6, height*0.15);

  fill(240);
  rect(width*0.1, height*0.2, width*0.8, height*0.7);

  noFill();
  beginShape();
  for(var i in fft.spectrum)
  {
    var xs = map(i, 0, fft.spectrum.length-1, width*0.1, width*0.9);
    var ys = map(sqrt(fft.spectrum[i]), 0, sqrt(fft.peak), height*0.9, height*0.2);
    vertex(xs, ys);
    ellipse(xs, ys, 5, 5);
  }
  endShape();

}
