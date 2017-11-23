// <3 rld

var filt;
var x;

function setup()
{
  createCanvas(1280, 720);
  background(255);
  fill(0);

  textSize(18);
  text("Unit Test for p5.Filt()", 40, 40);

  filt = new p5.Filt();
  filt.set("LPF", 5, 1, 0);
  x = width*0.2;

}

function draw()
{

  var n = random(-1., 1.);
  var f = filt.tick(n);

  text("input:", width*0.2, height*0.15);
  ellipse(x, map(n, -1., 1., height*0.4, height*0.2), 5, 5);
  text("output:", width*0.2, height*0.55);
  ellipse(x, map(f, -1., 1., height*0.8, height*0.6), 5, 5);

  x++;

  if(x>width*0.8) {
    x = width*0.2;
    background(255);
    text("Unit Test for p5.Filt()", 40, 40);
  }

}
