// <3 rld


var x;

var f;


function setup()
{
  createCanvas(800, 600);
  frameRate(60);
  background(255);
  fill(0);

  f = new p5.Filt(60);

  f.set('bandreject', 2, 1);

}

function draw()
{
  background(255);
    x = random(0, width);
    ellipse(x, height*(1/3), 15, 15);
    y = f.tick(x);
    ellipse(y, height*(2/3), 15, 15);
}
