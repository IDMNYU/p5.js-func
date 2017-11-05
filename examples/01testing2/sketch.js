// theremin
// <3 rld

var p = 0.;
var ease = new p5.Ease();
var styles = ease.listAlgos();
var curstyle;
var speed = 0.01;
var doclear;
var osc, filt;


function setup()
{
  createCanvas(800, 600);
  doclear = 1;

  curstyle = styles[floor(random(styles.length))];

  filt = new p5.LowPass();
  filt.res(20);
  filt.freq(800);

  osc = new p5.Oscillator();
  osc.setType('square');
  osc.freq(440.);
  osc.amp(0.3);
  osc.disconnect();
  osc.connect(filt);
  osc.start();

}

function draw()
{
  //  background(0);
  if(doclear)
  {
    curstyle = styles[floor(random(styles.length))];
    background(0);
    fill(64);
    rect(width*0.25, height*0.25, width*0.5, height*0.5);
    fill(255);
    doclear = 0;
  }
  var q = ease[curstyle](p);
  text(curstyle, width*0.1, height*0.1);
  ellipse(p*width*0.5+width*0.25, height-(q*height*0.5+height*0.25), 10, 10);
  var base = floor(map(p, 0., 1., 40, 90));
  var wah = map(q, 0., 1., 40, 90);
  osc.freq(midiToFreq(base));
  filt.freq(midiToFreq(wah)*4.);

  if(p+speed>1.) doclear=1;
  p=(p+speed)%1.;
}
