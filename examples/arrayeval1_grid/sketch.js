// p5.func examples - arrayeval1_grid
// I<3DM rld

var e = new p5.ArrayEval();
var w = 40;
var h = 30;
var wstep, hstep;
var t; // array


var s = [];

// some equations
s[0] = 'sin(su*PI)*sv';
s[1] = '(random()>0.5)*2.-1';
s[2] = 'sin(su*5.)*cos(sv*3.)*-1.';
s[3] = 'tan(su*TWO_PI + sv*PI)';
s[4] = 'dist(0, 0, su, sv)*2.-1.';

var current = 0;

function setup()
{
  createCanvas(1280, 720);
  t = e.eval2d(s[current], w, h);

  wstep = width/w*0.75;
  hstep = height/h;

  textSize(18);
}

function draw()
{
  background(255);
  fill(0);
  noStroke();

  text('var e = new p5.ArrayEval();', 20, 20);
  text('var s = \'' + s[current] + '\';', 20, 50);
  text('var t = e.eval2d(s, 40, 30);', 20, 80)

  stroke(0, 0, 255);
  scale(0.5);
  translate(width/4, height/4);
  for(var i in t)
  {
    for(var j in t[i])
    {
      fill(map(t[i][j], -1., 1., 0, 255));
      ellipse(i*wstep+(wstep/2), j*hstep+(hstep/2), wstep, hstep);
    }
  }
}


function keyTyped()
{
  current = (current+1)%s.length;
  t = e.eval2d(s[current], w, h);
}
