// <3 rld

var gen = new p5.Gen();

function setup()
{
  createCanvas(1280, 720);
  background(255);
  fill(0);

  textSize(32);

  text("Unit Test for p5.Gen()", 40, 40);
  text("Check console for output", 40, 80);

  noLoop();

  var q = gen.fillArray('window', 80, 'squircular', [0.5, 2]);
  console.log(q);
  fplot(q);

}

function draw()
{
}
