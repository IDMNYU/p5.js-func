// p5.func examples - easing5_fplot
// I<3DM rld

var ease = new p5.Ease();

function setup()
{
  createCanvas(800, 600);
  background(255);
  fill(0);

  textSize(18);

  text("p5.Ease()", 40, 40);
  text("Check console for output", 40, 80);

  noLoop();

  var l = ease.listAlgos();
  for(var j in l)
  {
    var q = ease.fillArray(l[j], 80);
    console.log('%c'+l[j] + ' : ', "font-size:24px;");
    fplot(q, "color: blue; font-size:9px;");
  }

}

function draw()
{
}
