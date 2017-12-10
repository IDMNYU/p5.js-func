// p5.func examples - gen2_fplot
// I<3DM rld

var gen = new p5.Gen();

var tb; // textbox

function setup()
{
  createCanvas(800, 600);
  background(255);
  fill(0);

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(width*0.1, height*0.1);
  tb.size(500, 500);

  var hs = '';
  hs+= "p5.Gen()<br>";
  hs+= "Check console for output.";

  tb.html(hs);

  noLoop();

  var q = gen.fillArray('window', 80, 'slidinghann-poisson', [0.5, 0.9]);
  console.log(q);
  fplot(q);

}

function draw()
{
}
