// p5.func examples - filter2_plot
// I<3DM rld

var FR = 30;
var SPF = 2048; // samples per frame
var FS = FR*SPF;
var FFTSIZE = SPF;

var filt;
var x; // sig pointer
var gen;

var isig = new Array(FFTSIZE); // collector signal (input)
var osig = new Array(FFTSIZE); // collector signal (output)
var win = new Array(FFTSIZE); // window function

var ifft, offt;

var sel, fslider, qslider, gslider; // p5.dom elements

function setup()
{
  createCanvas(1280, 720);
  frameRate(FR);
  background(255);
  fill(0);

  textSize(18);

  filt = new p5.Filt(FS);
  filt.set("LPF", 125, 5, 0);
  x = 0;

  ifft = new p5.FastFourierTransform(FFTSIZE, FS);
  offt = new p5.FastFourierTransform(FFTSIZE, FS);

  gen = new p5.Gen();
  win = gen.fillArray('window', FFTSIZE, 'hanning');

  // p5.dom menu:
  sel = createSelect();
  sel.position(250, 25);
  sel.option('LPF');
  sel.option('HPF');
  sel.option('BPF');
  sel.option('BPF0');
  sel.option('notch');
  sel.option('APF');
  sel.option('peakingEQ');
  sel.option('lowShelf');
  sel.option('highShelf');
  sel.changed(typeMenu);

  fslider = createSlider(0, FS/2, 125, 0.01);
  fslider.position(350, 25);
  fslider.changed(fsliderChanged);

  qslider = createSlider(0.1, 30, 5, 0.01);
  qslider.position(500, 25);
  qslider.changed(qsliderChanged);

  gslider = createSlider(-32., 32., 0., 0.01);
  gslider.position(650, 25);
  gslider.changed(gsliderChanged);

}

function draw()
{
  if(x>FFTSIZE-1) {
    drawFFTandClear();
    x = 0;
  }

  // params:
  fill(255);
  textSize(12);
  rect(40, 70-12, 200, height*0.025);
  fill(0);
  text('filt.set(\"' + filt.type + '\", ' + filt.f0 + ', ' + filt.Q + ', ' + filt.dB + ');', 45, 70);

  text('type: ' + filt.type, 250, 15);
  text('frequency: ' + filt.f0, 350, 15);
  text('Q: ' + filt.Q, 500, 15);
  text('gain: ' + filt.dB, 650, 15);


  fill(240);
  rect(width*0.1, height*0.2, width*0.4, height*0.2);
  rect(width*0.1, height*0.6, width*0.4, height*0.2);

  fill(0);
  for(var i = 0;i<SPF;i++)
  {

    var n = random(-1., 1.);
    var f = filt.tick(n);

    rect((x/(FFTSIZE-1))*width*0.4+width*0.1, map(n, -1., 1., height*0.4, height*0.2), 1, 1);
    rect((x/(FFTSIZE-1))*width*0.4+width*0.1, map(f, -1., 1., height*0.8, height*0.6), 1, 1);

    isig[x] = n;
    osig[x] = f;

    x++;

  }

}

function drawFFTandClear()
{
  ifft.forward(multiplyArray(isig, win));
  offt.forward(multiplyArray(osig, win));

  background(255);
  fill(0);
  textSize(18);
  text("p5.Filt()", 40, 40);
  text("input:", width*0.1, height*0.15);
  text("output:", width*0.1, height*0.55);
  text("peak: " + ifft.getBandFrequency(ifft.peakBand).toFixed(4) + "Hz at " + ifft.peak.toFixed(4), width*0.6, height*0.15);
  text("peak: " + offt.getBandFrequency(offt.peakBand).toFixed(4) + "Hz at " + offt.peak.toFixed(4), width*0.6, height*0.55);

  fill(240);
  rect(width*0.6, height*0.2, width*0.35, height*0.2);
  rect(width*0.6, height*0.6, width*0.35, height*0.2);

  noFill();
  beginShape();
  for(var i in ifft.spectrum)
  {
    var xs = map(i, 0, ifft.spectrum.length-1, width*0.6, width*0.95);
    var ys = map(sqrt(ifft.spectrum[i]), 0, sqrt(ifft.peak), height*0.4, height*0.2);
    vertex(xs, ys);
  }
  endShape();

  beginShape();
  for(var i in offt.spectrum)
  {
    var xs = map(i, 0, offt.spectrum.length-1, width*0.6, width*0.95);
    var ys = map(sqrt(offt.spectrum[i]), 0, sqrt(offt.peak), height*0.8, height*0.6);
    vertex(xs, ys);
  }
  endShape();

  // var inv = Array.from(offt.inverse(offt.real, offt.imag));
  // console.log(inv);
  // fplot(Array.from(inv));

}

function typeMenu()
{
  filt.setType(sel.value());
}

function fsliderChanged()
{
  filt.setFreq(fslider.value());
}

function qsliderChanged()
{
  filt.setQ(qslider.value());
}

function gsliderChanged()
{
  filt.setGain(gslider.value());
}
