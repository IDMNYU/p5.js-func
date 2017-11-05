// fun
// <3 rld

var estr;
var e = new p5.ArrayEval();
var w = 40;
var h = 30;
var wstep, hstep;
var p; // array


// some equations
//estr = 'sin(su*PI)*sv';
//estr = '(random()>0.5)*2.-1';
estr = 'sin(su*5.)*cos(sv*3.)*-1.';
//estr = 'tan(su*TWO_PI + sv*PI)';
//estr = 'dist(0, 0, su, sv)*2.-1.';

function setup()
{
  createCanvas(800, 600);
  p = e.eval2d(estr, w, h);

  wstep = width/w;
  hstep = height/h;

  textSize(24);

}

function draw()
{
  background(0);
  stroke(0, 0, 255);

  for(var i in p)
  {
    for(var j in p[i])
    {
      fill(map(p[i][j], -1., 1., 0, 255));
      ellipse(i*wstep+(wstep/2), j*hstep+(hstep/2), wstep, hstep);
    }
  }

  var tw = textWidth(estr)*1.01;
  fill(255);
  rect(17, 27-18, tw, 24);
  fill(0);
  text(estr, 20, 30);


}


function keyTyped()
{
}
