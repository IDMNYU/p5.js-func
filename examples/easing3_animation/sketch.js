// p5.func examples - easing3_animation
// I<3DM rld

var ease = new p5.Ease();
var styles = ease.listAlgos();
var curstyle;
var speed = 0.02;
var t = 0.;
var doclear;

var x, y, tx, ty, x1, y1, px, py;

var osc, rev;

var tb; // textbox

function setup()
{
  createCanvas(800, 600);
  background(255);
  fill(0);

  curstyle = random(styles);

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

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(width*0.1, height*0.1);
  tb.size(500, 500);

}

function draw()
{
  background(255);

  var q = ease[curstyle](t);
  x1 = map(q, 0., 1., x, tx);
  y1 = map(q, 0., 1., y, ty);
  noFill();
  stroke(255, 0, 0);
  ellipse(tx, ty, 30, 30);
  fill(0);
  noStroke();
  ellipse(x1, y1, 15, 15);

  var hs = '';
  hs+= 'p5.Ease(): ' + curstyle + '<br><br>';
  hs+= 'click around.';

  tb.html(hs);

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
  curstyle = random(styles);
  x = px;
  y = py;
  tx = mouseX;
  ty = mouseY;
  t = 0.;
}
