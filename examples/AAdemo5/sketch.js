// fun
// <3 rld

var e = new p5.ArrayEval();
var w = 40;
var h = 30;
var wstep, hstep;
var p; // array


var estr = [];

// some equations
estr[0] = 'sin(su*PI)*sv';
estr[1] = '(random()>0.5)*2.-1';
estr[2] = 'sin(su*5.)*cos(sv*3.)*-1.';
estr[3] = 'tan(su*TWO_PI + sv*PI)';
estr[4] = 'dist(0, 0, su, sv)*2.-1.';

var current = 0;

function setup()
{
  createCanvas(1280, 720);
  p = e.eval2d(estr[current], w, h);

  wstep = width/w*0.75;
  hstep = height/h;

  textSize(24);

}

function draw()
{
  background(255);
  fill(0);
  stroke(0, 0, 255);

  text('var e = new p5.ArrayEval();', 20, 20);
  text('var s = \'' + estr[current] + '\';', 20, 50);
  text('var t = e.eval2d(s, 40, 30);', 20, 80)

  scale(2/3);
  translate(width/4, height/4);
  for(var i in p)
  {
    for(var j in p[i])
    {
      fill(map(p[i][j], -1., 1., 0, 255));
      ellipse(i*wstep+(wstep/2), j*hstep+(hstep/2), wstep, hstep);
    }
  }



}


function keyTyped()
{
  current = (current+1)%estr.length;
  p = e.eval2d(estr[current], w, h);
}
