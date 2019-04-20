// p5.func examples - easing4_fillArray
// I<3DM rld

var ease = new p5.Ease();
var styles = ease.listAlgos();
var curstyle;
var speed = 0.02;
var t = 0.;
var tab;

var tb; // textbox

function setup()
{
  createCanvas(800, 600);

  curstyle = random(styles);

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(width*0.1, height*0.1);
  tb.size(500, 500);

}

function draw()
{
  background(255);
  stroke(255, 0, 0);
  noFill();
  rect(width*0.25, height*0.2, width*0.5, height*0.5);

  var npoints = floor(constrain(mouseX/4, 2, width/4))
  tab = ease.fillArray(curstyle, npoints);

  var hs = '';
  hs+= 'p5.Ease() array filling.<br>';
  hs+= curstyle + ': ' + npoints + ' points.<br>';
  hs+= 'mouseX = # points; &lt;space&gt; = new algorithm.';

  tb.html(hs);

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
  curstyle = random(styles);
  tab = ease.fillArray(curstyle, 512);
}
