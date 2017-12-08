// p5.func examples - gen2_fplot
// I<3DM rld

var gen = new p5.Gen();

function setup()
{
  createCanvas(1280, 720);
  background(255);
  fill(0);

  textSize(18);

  text("p5.Gen()", 40, 40);
  text("Check console for output", 40, 80);

  noLoop();

  var q = gen.fillArray('window', 80, 'slidinghann-poisson', [0.5, 0.9]);
  console.log(q);
  fplot(q);

}

function draw()
{
}
