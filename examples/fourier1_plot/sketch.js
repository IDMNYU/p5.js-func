// p5.func examples - fourier1_plot
// I<3DM rld

var FR = 30;
var SPF = 64; // samples per frame
var FS = FR*SPF;
var FFTSIZE = SPF;

var x; // sig pointer
var gen;

var sig = new Array(FFTSIZE); // collector signal (input)
var win = new Array(FFTSIZE); // window function

var fft;

var tb; // textbox

function setup()
{
  createCanvas(800, 600);
  noLoop();
  background(255);
  fill(0);

  textSize(18);

  x = 0;

  fft = new p5.FastFourierTransform(FFTSIZE, FS);

  gen = new p5.Gen();

  //sig = gen.fillArray('random', FFTSIZE);
  //sig = gen.fillArray('harmonics', FFTSIZE, [0, 0, 0, 0, 1., 0, 0, 0, 1]);
  sig = gen.fillArray('waveform', FFTSIZE, 'square');

  win = gen.fillArray('window', FFTSIZE, 'hanning');

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(width*0.1, height*0.1);
  tb.size(500, 500);

  noLoop();
}

function draw()
{
  fft.forward(multiplyArray(sig, win));

  background(255);

  var hs = '';
  hs+= 'p5.FastFourierTransform()<br><br>';
  hs+= 'signal peak: ' + fft.getBandFrequency(fft.peakBand).toFixed(4) + 'Hz at ' + fft.peak.toFixed(4);
  tb.html(hs);

  fill(240);
  rect(width*0.1, height*0.2, width*0.8, height*0.7);

  noFill();
  beginShape();
  for(var i in fft.magnitude)
  {
    var xs = map(i, 0, fft.magnitude.length-1, width*0.1, width*0.9);
    var ys = map(sqrt(fft.magnitude[i]), 0, sqrt(fft.peak), height*0.9, height*0.2);
    vertex(xs, ys);
    ellipse(xs, ys, 5, 5);
  }
  endShape();
}
