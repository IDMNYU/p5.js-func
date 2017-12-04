// fun
// <3 rld

var e = new p5.ArrayEval();
var l = 2000;
var wstep, hstep;
var p; // array
var z = 100; // zoom factor in pixels

var estr = [];

// some equations from paul bourke
estr[0] = [ '-Math.sinh(2*su*HALF_PI) / (cos(2*4*su*HALF_PI) - Math.cosh(2*su*HALF_PI))',
            'sin(2*4*su*HALF_PI) / (cos(2*4*su*HALF_PI) - Math.cosh(2*su*HALF_PI))'
          ]; // http://paulbourke.net/geometry/cothspiral/
estr[1] = [ '9*0.25*cos(u*TWO_PI) + 0.25*cos(9*u*TWO_PI)',
            '9*0.25*sin(u*TWO_PI) + 0.25*sin(9*u*TWO_PI)'
          ]; // http://paulbourke.net/geometry/hypocycloid/
estr[2] = [ 'cos(u*PI*24.) * (exp(cos(u*PI*24.)) - 2 * cos(4 * u*PI*24.) - pow(sin(u*PI*24. / 12),5.0))',
            'sin(u*PI*24.) * (exp(cos(u*PI*24.)) - 2 * cos(4 * u*PI*24.) - pow(sin(u*PI*24. / 12),5.0))'
          ]; // http://paulbourke.net/geometry/butterfly/
estr[3] = [ '2*cos(u*TWO_PI)+cos((3-1)*u*TWO_PI)',
            '2*sin(u*TWO_PI)+sin((3-1)*u*TWO_PI)'
          ]; // http://paulbourke.net/geometry/cardioid/
estr[4] = [ '(5.*(1. + sin(11. * u*21.*PI / 5.)) - \
            4. *\
            sin4(17. * u*21.*PI / 3.) *\
            sin8(2. * cos(3. * u*21.*PI) - 28. * u*21.*PI)) *\
            cos(u*21.*PI)*0.3',
            '(5.*(1. + sin(11. * u*21.*PI / 5.)) - \
            4. *\
            sin4(17. * u*21.*PI / 3.) *\
            sin8(2. * cos(3. * u*21.*PI) - 28. * u*21.*PI)) *\
            sin(u*21.*PI)*0.3'
          ]; // http://paulbourke.net/geometry/chrysanthemum/

var current = 0;

function setup()
{
  createCanvas(1280, 720);

  textSize(12);

  noLoop();

  doit();
}

function draw()
{

}

function doit()
{
  p = e.eval(estr[current], l);

  resetMatrix();
  background(255);

  stroke(128, 128, 255);
  noFill();
  translate(width/2, height/2); // put 0, 0 at center
  beginShape();
  for(var i = 0;i<p.length;i++)
  {
    vertex(p[i][0]*z-z/2, p[i][1]*z-z/2);
    ellipse(p[i][0]*z-z/2, p[i][1]*z-z/2, 5, 5);
  }
  endShape();

  resetMatrix();
  fill(0);
  noStroke();
  text('var e = new p5.ArrayEval();', 20, 20);
  text('var s = \'' + estr[current] + '\';', 20, 50);
  text('var t = e.eval(s, ' + l + ');', 20, 80)

  current = (current+1)%estr.length;
}


function keyTyped()
{
  doit();
}


// sin4 function
sin4 = function(_x) {
  return(sin(_x)*sin(_x)*sin(_x)*sin(_x));
}

// sin8 function
sin8 = function(_x) {
  return(sin(_x)*sin(_x)*sin(_x)*sin(_x)*sin(_x)*sin(_x)*sin(_x)*sin(_x));
}
