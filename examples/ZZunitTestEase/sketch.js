// <3 rld

var ease = new p5.Ease();

function setup()
{
  createCanvas(1280, 720);
  background(255);
  fill(0);

  textSize(32);

  text("Unit Test for p5.Ease()", 40, 40);
  text("Check console for output", 40, 80);

  noLoop();

  var l = ease.listAlgos();
  for(var j in l)
  {
    var q = ease.fillArray(l[j], 80);
    console.log('%c'+l[j] + ' : ', "font-size:24px;");
    fplot(q, "color: blue; font-size:9px;");
  }

  // var q = ease.fillArray('generalizedLinearMap', 80);
  // console.log(q);
  // fplot(q);

}

function draw()
{
}
