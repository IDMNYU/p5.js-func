// theremin
// <3 rld

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


  curstyle = styles[floor(random(styles.length))];

  doclear = true;

}

function draw()
{
  background(0);
  stroke(255, 0, 0);
  noFill();
  rect(width*0.25, height*0.25, width*0.5, height*0.5);

  var npoints = floor(constrain(mouseX/4, 2, width/4))
  tab = ease.fillArray(curstyle, npoints);

  noStroke();
  fill(255);
  text(curstyle + ": " + npoints + " points", width*0.1, height*0.1);

  stroke(0, 0, 255);
  fill(255, 64);

  beginShape();
  for(var i = 0;i<tab.length;i++)
  {
    var x = i/(tab.length-1)*width*0.5+width*0.25;
    var y = map(tab[i], 0., 1., height*0.75, height*0.25);
    ellipse(x, y, 5, 5);
    vertex(x, y);
  }
  endShape();

}

function keyTyped()
{
  curstyle = styles[floor(random(styles.length))];
  tab = ease.fillArray(curstyle, 512);
  doclear = true;
}
