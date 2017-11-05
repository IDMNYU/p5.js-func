// theremin
// <3 rld

var ease = new p5.Ease();
var styles = ease.listAlgos();
var curstyle;
var speed = 0.02;
var t = 0.;
var doclear;

var x, y, tx, ty, x1, y1, px, py;

var osc, rev;



function setup()
{
  createCanvas(800, 600);
  background(0);
  fill(255);

  curstyle = styles[floor(random(styles.length))];

  x = width/2;
  y = height/2;
  tx = width/2;
  ty = height/2;
  px = width/2;
  py = height/2;

  osc = new p5.Oscillator();
  osc.setType('sawtooth');
  osc.freq(440.);
  osc.amp(0.3);
  osc.start();

  rev = new p5.Reverb();
  rev.process(osc, 3, 10);


}

function draw()
{
  background(0);

  var q = ease[curstyle](t);
  x1 = map(q, 0., 1., x, tx);
  y1 = map(q, 0., 1., y, ty);
  noFill();
  stroke(255, 0, 0);
  ellipse(tx, ty, 30, 30);
  fill(255);
  noStroke();
  ellipse(x1, y1, 15, 15);

  text(curstyle, width*0.1, height*0.1);

  var f = constrain(dist(x1, y1, px, py)*100., 0, 20000);
  var a = constrain(dist(x1, y1, px, py), 0, 0.3);
  osc.freq(f);
  osc.amp(a);

  px = x1;
  py = y1;

  t+=speed;
  if(t>1.) {
    t=1.;
    x = tx;
    y = ty;
  }
}

function mousePressed()
{
  curstyle = styles[floor(random(styles.length))];
  x = px;
  y = py;
  tx = mouseX;
  ty = mouseY;
  t = 0.;
}
