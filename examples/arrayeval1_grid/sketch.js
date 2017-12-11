// p5.func examples - arrayeval1_grid
// I<3DM rld

var e = new p5.ArrayEval();
var w = 40;
var h = 30;
var wstep, hstep;
var t; // array

var tb; // textbox

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
  createCanvas(800, 600);
  t = e.eval2d(s[current], w, h);

  wstep = 1280/w*0.75;
  hstep = 720/h;

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(20, 20);
  tb.size(500, 500);

  noLoop();

}

function draw()
{
  background(255);
  fill(0);
  noStroke();

  var hs = '';
  hs+= 'var e = new p5.ArrayEval();<br>';
  hs+= 'var s = \'' + s[current] + '\';<br>';
  hs+= 'var t = e.eval2d(s, 40, 30);<br>';
  hs+= 'press any key to switch equations.<br>';

  tb.html(hs);

  stroke(0, 0, 255);
  scale(0.5);
  translate(320, 180);
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
  redraw();
}
