// p5.func examples - easing2_wah
// I<3DM rld

var p = 0.;
var ease = new p5.Ease();
var styles = ease.listAlgos();
var curstyle;
var speed = 0.01;
var doclear;
var osc1, osc2, filt;

function setup()
{
  createCanvas(800, 600);
  doclear = 1;

  curstyle = pickrand(styles);

  filt = new p5.LowPass();
  filt.res(20);
  filt.freq(800);

  osc1 = new p5.Oscillator();
  osc1.setType('square');
  osc1.freq(110.);
  osc1.amp(0.3);
  osc1.disconnect();
  osc1.connect(filt);
  osc1.start();

  osc2 = new p5.Oscillator();
  osc2.setType('sawtooth');
  osc2.freq(112.);
  osc2.amp(0.3);
  osc2.disconnect();
  osc2.connect(filt);
  osc2.start();

  textSize(18);
}

function draw()
{
  if(doclear)
  {
    curstyle = pickrand(styles);
    background(255);
    noStroke();
    fill(215);
    rect(width*0.25, height*0.2, width*0.5, height*0.5);
    fill(0);
    text(curstyle, width*0.1, height*0.1);
    noFill();
    stroke(255, 0, 0);
    line(width*0.25, height*0.7, width*0.75, height*0.2);
    fill(0);
    noStroke();
    doclear = 0;
  }
  var q = ease[curstyle](p);
  ellipse(p*width*0.5+width*0.25, height-(q*height*0.5+height*0.3), 5, 5);
  var wah = map(q, 0., 1., 45, 122);
  filt.freq(midiToFreq(wah));

  if(p+speed>1.) doclear=1;
  p=(p+speed)%1.;
}
