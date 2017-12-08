// p5.func examples - easing4_fillArray
// I<3DM rld

var ease = new p5.Ease();
var styles = ease.listAlgos();
var curstyle;
var speed = 0.02;
var t = 0.;
var doclear;
var tab;

function setup()
{
  createCanvas(800, 600);

  curstyle = pickrand(styles);

  doclear = true;

  textSize(18);

}

function draw()
{
  background(255);
  stroke(255, 0, 0);
  noFill();
  rect(width*0.25, height*0.2, width*0.5, height*0.5);

  var npoints = floor(constrain(mouseX/4, 2, width/4))
  tab = ease.fillArray(curstyle, npoints);

  noStroke();
  fill(0);
  text(curstyle + ": " + npoints + " points", width*0.1, height*0.1);

  stroke(0, 0, 255);
  fill(0, 32);

  beginShape();
  for(var i = 0;i<tab.length;i++)
  {
    var x = i/(tab.length-1)*width*0.5+width*0.25;
    var y = map(tab[i], 0., 1., height*0.7, height*0.2);
    ellipse(x, y, 5, 5);
    vertex(x, y);
  }
  endShape();
}

function keyTyped()
{
  curstyle = pickrand(styles);
  tab = ease.fillArray(curstyle, 512);
  doclear = true;
}
