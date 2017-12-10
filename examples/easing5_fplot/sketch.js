// p5.func examples - easing5_fplot
// I<3DM rld

var ease = new p5.Ease();

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
  hs+= "p5.Ease()<br>";
  hs+= "Check console for output.";

  tb.html(hs);

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
