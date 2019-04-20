// p5.func examples - fourier1_plot
// I<3DM rld

var mic, p5fft;


var SPF = 1024; // samples per frame
var FS = 44100;
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
  background(255);
  fill(0);

  textSize(18);

  x = 0;

  mic = new p5.AudioIn();
  mic.start();
  p5fft = new p5.FFT(0, 1024);
  p5fft.setInput(mic);


  fft = new p5.FastFourierTransform(FFTSIZE, FS);

  gen = new p5.Gen();

  //sig = gen.fillArray('random', FFTSIZE);
  //sig = gen.fillArray('harmonics', FFTSIZE, [0, 0, 0, 0, 1., 0, 0, 0, 1]);
  //sig = gen.fillArray('waveform', FFTSIZE, 'square');

  win = gen.fillArray('window', FFTSIZE, 'hanning');

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(width*0.1, height*0.1);
  tb.size(500, 500);
}

function draw()
{
  sig = p5fft.waveform(); // get the time domain values from an audio input
  //console.log(sig);
  fft.forward(multiplyArray(sig, win));

  background(255);

  var hs = '';
  hs+= 'p5.Fourier()<br><br>';
  hs+= 'signal peak: ' + fft.getBandFrequency(fft.peakBand).toFixed(4) + 'Hz at ' + fft.peak.toFixed(4);
  tb.html(hs);

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
