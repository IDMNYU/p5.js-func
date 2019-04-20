// p5.func examples - fourier2_plot2
// I<3DM rld

var mic, wf;


var SPF = 1024; // samples per frame
var FS = 44100;
var FFTSIZE = SPF;

var x; // sig pointer
var gen;

var sig = new Array(FFTSIZE); // collector signal (input)
var win = new Array(FFTSIZE); // window function

var fft;
var phasedelta = new Array(FFTSIZE);
for(let i = 0;i<phasedelta.length;i++)
{
  phasedelta[i] = 0;
}

var tb; // textbox


function setup()
{
  createCanvas(800, 600);
  background(255);
  fill(0);

  textSize(18);

  x = 0;

  mic = new Tone.UserMedia();
  mic.open();
  wf = new Tone.Waveform(SPF);
  mic.connect(wf);

  fft = new p5.FastFourierTransform(FFTSIZE, FS);

  gen = new p5.Gen();

  win = gen.fillArray('window', FFTSIZE, 'hanning');

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(width*0.1, height*0.1);
  tb.size(500, 500);
}

function draw()
{
  sig = wf.getValue(); // get the time domain values from an audio input
  //console.log(sig);
  fft.forward(multiplyArray(sig, win));
  var temp = Array.from(fft.phase);
  phasedelta = subtractArray(phasedelta, temp); // compute running phase
  phasedelta = moduloArray(phasedelta, PI);
  // look here for how to compute instantaneous frequency:
  // https://dsp.stackexchange.com/questions/24487/calculate-and-interpret-the-instantaneous-frequency

  background(255);

  var hs = '';
  hs+= 'p5.Fourier()<br><br>';
  hs+= 'signal peak: ' + fft.getBandFrequency(fft.peakBand).toFixed(4) + 'Hz at ' + fft.peak.toFixed(4);
  tb.html(hs);

  fill(240);
  rect(width*0.1, height*0.2, width*0.8, height*0.7);

  var peaks = new Array(10);
  for(var i = 0;i<peaks.length;i++)
  {
    peaks[i] = 0;
  }
  // find 10 biggest
  spectsort = new Array(fft.spectrum.length);
  for(var i =0;i<spectsort.length;i++)
  {
    var p = new Array();
    p[0] = fft.spectrum[i].toFixed(6);
    p[1] = i;
    spectsort[i] = p;
  }
  spectsort.sort();
  spectsort.reverse();
  var topten = new Array(10);
  for(var i =0;i<10;i++)
  {
    topten[i] = spectsort[i][1];
  }
  //console.log(topten);

  stroke(0);
  noFill();
  beginShape();
  for(var i in fft.spectrum)
  {
    var xlog = sqrt(map(i, 0, fft.spectrum.length-1, 0., 1.));
    var xs = map(xlog, 0, 1, width*0.1, width*0.9);
    var ys = map(sqrt(fft.spectrum[i]), 0, 0.707, height*0.9, height*0.2);
    vertex(xs, ys);
    noFill();
    for(var j in topten)
    {
      if(i==topten[j]) fill(255, 0, 0);
    }
    ellipse(xs, ys, 5, 5);
  }
  endShape();
}
