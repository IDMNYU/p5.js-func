// theremin
// <3 rld

var p = 0.;
var ease = new p5.Ease();
var styles = ease.listAlgos();
var curstyle;
var speed = 0.01;

var osc1, osc2;

function setup()
{
  createCanvas(1280, 720);
  background(0);
  fill(255);

  curstyle = styles[floor(random(styles.length))];

  osc1 = new p5.Oscillator();
  osc1.setType('sine');
  osc1.freq(500.);
  osc1.amp(0.15);
  osc1.start();
  osc2 = new p5.Oscillator();
  osc2.setType('triangle');
  osc2.freq(300.);
  osc2.amp(0.15);
  osc2.start();

  textSize(32);

}

function draw()
{
  background(255);
  fill(0);
  textAlign(LEFT);

  var q = ease[curstyle](p);

  var ss = 'var e = new p5.Ease();';
  text(ss, width*0.3, height*0.1);
  var ss = 'var p = '+p.toFixed(2)+';';
  text(ss, width*0.3, height*0.15);
  var ss = 'var q = e.'+curstyle+'(p);';
  text(ss, width*0.3, height*0.2);

  textAlign(LEFT);
  text("p: " + p.toFixed(2), width*0.1, height*0.3);
  ellipse(p*width*0.6+width*0.2, height*0.4, 15, 15);
  text("q: " + q.toFixed(2), width*0.1, height*0.5);
  ellipse(q*width*0.6+width*0.2, height*0.6, 15, 15);

  pan1 = map(p, 0., 1., -0.9, 0.9);
  pan2 = constrain(map(q, 0., 1., -0.9, 0.9), -1., 1.);
  osc1.pan(pan1);
  osc2.pan(pan2);

  if(p+speed>1.) curstyle = styles[floor(random(styles.length))];
  p=(p+speed)%1.;
}
