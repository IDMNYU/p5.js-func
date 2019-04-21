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

var tb, tn, tf, tpn, tpf, tg1, tg2, tg3, tg4; // textboxes

function setup()
{
  createCanvas(800, 600);
  frameRate(FR);
  background(255);
  fill(0);

  textSize(12);

  filt = new p5.Filt(FS);
  filt.set("LPF", 125, 5, 0);
  x = 0;

  ifft = new p5.FastFourierTransform(FFTSIZE, FS);
  offt = new p5.FastFourierTransform(FFTSIZE, FS);

  gen = new p5.Gen();
  win = gen.fillArray('window', FFTSIZE, 'hanning');

  // p5.dom menu:
  sel = createSelect();
  sel.position(150, 70-12);
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
  fslider.position(300, 70-12);
  fslider.changed(fsliderChanged);

  qslider = createSlider(0.1, 30, 5, 0.01);
  qslider.position(450, 70-12);
  qslider.changed(qsliderChanged);

  gslider = createSlider(-32., 32., 0., 0.01);
  gslider.position(600, 70-12);
  gslider.changed(gsliderChanged);

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(width/2, height/2 - 24);
  tb.size(500, 500);

  tn = createDiv('');
  tn.style("font-family", "Courier");
  tn.style("font-size", "12px");
  tn.position(width*0.1, height*0.18 - 12);
  tn.size(500, 100);

  tf = createDiv('');
  tf.style("font-family", "Courier");
  tf.style("font-size", "12px");
  tf.position(width*0.1, height*0.58 - 12);
  tf.size(500, 100);

  tpn = createDiv('');
  tpn.style("font-family", "Courier");
  tpn.style("font-size", "12px");
  tpn.position(width*0.6, height*0.18 - 12);
  tpn.size(500, 100);

  tpf = createDiv('');
  tpf.style("font-family", "Courier");
  tpf.style("font-size", "12px");
  tpf.position(width*0.6, height*0.58 - 12);
  tpf.size(500, 100);

  tg1 = createDiv('');
  tg1.style("font-family", "Courier");
  tg1.style("font-size", "12px");
  tg1.position(150, 40);
  tg1.size(500, 20);
  tg2 = createDiv('');
  tg2.style("font-family", "Courier");
  tg2.style("font-size", "12px");
  tg2.position(300, 40);
  tg2.size(500, 20);
  tg3 = createDiv('');
  tg3.style("font-family", "Courier");
  tg3.style("font-size", "12px");
  tg3.position(450, 40);
  tg3.size(500, 20);
  tg4 = createDiv('');
  tg4.style("font-family", "Courier");
  tg4.style("font-size", "12px");
  tg4.position(600, 40);
  tg4.size(500, 20);

  tg1.html('type: ' + filt.type);
  tg2.html('frequency: ' + filt.f0);
  tg3.html('Q: ' + filt.Q);
  tg4.html('gain: ' + filt.dB);
}

function draw()
{
  if(x>FFTSIZE-1) {
    drawFFTandClear();
    x = 0;
  }

  // params:
  fill(0);

  var hs = '';
  hs += 'p5.Filt()<br>';
  hs += 'filt.set(\"' + filt.type + '\", ' + filt.f0 + ', ' + filt.Q + ', ' + filt.dB + ');';
  tb.html(hs);

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

  tn.html("var n = random(-1., 1.);");
  tf.html("var f = filt.tick(n);");
  tpn.html("peak: " + ifft.getBandFrequency(ifft.peakBand).toFixed(4) + "Hz at " + ifft.peak.toFixed(4));
  tpf.html("peak: " + offt.getBandFrequency(offt.peakBand).toFixed(4) + "Hz at " + offt.peak.toFixed(4));

  fill(240);
  rect(width*0.6, height*0.2, width*0.35, height*0.2);
  rect(width*0.6, height*0.6, width*0.35, height*0.2);

  noFill();
  beginShape();
  for(var i in ifft.magnitude)
  {
    var xs = map(i, 0, ifft.magnitude.length-1, width*0.6, width*0.95);
    var ys = map(sqrt(ifft.magnitude[i]), 0, sqrt(ifft.peak), height*0.4, height*0.2);
    vertex(xs, ys);
  }
  endShape();

  beginShape();
  for(var i in offt.magnitude)
  {
    var xs = map(i, 0, offt.magnitude.length-1, width*0.6, width*0.95);
    var ys = map(sqrt(offt.magnitude[i]), 0, sqrt(offt.peak), height*0.8, height*0.6);
    vertex(xs, ys);
  }
  endShape();

}

function typeMenu()
{
  filt.setType(sel.value());
  tg1.html('type: ' + filt.type);
}

function fsliderChanged()
{
  filt.setFreq(fslider.value());
  tg2.html('frequency: ' + filt.f0);
}

function qsliderChanged()
{
  filt.setQ(qslider.value());
  tg3.html('Q: ' + filt.Q);
}

function gsliderChanged()
{
  filt.setGain(gslider.value());
  tg4.html('gain: ' + filt.dB);
}
