// theremin
// <3 rld

var p = 0.;
var gen = new p5.Gen();
var speed = 0.005;
var numharms = 16;
var tabsize = 2048;
var harmonics = [1., 0.3, 0.3, 0.,
                0., 0., 0., 0.,
                0., 0., 0., 0.,
                0., 0., 0., 0.];

var buf = new Tone.Buffer();
var bufplayer;
var si; // sampling increment

var testArr;
var t = new Tone.Frequency();

var within = false;


function setup()
{
  createCanvas(800, 600);
  doclear = 1;

  initBufferSource();

}

function draw()
{
  //  background(0);
  background(0);
  noStroke();
  fill(192, 0, 0, 128);
  rect(width*0.25, height*0.2, width*0.5, height*0.5);
  fill(255);

  var q = gen.harmonics(p, harmonics);
  var str = "";
  for(var i in harmonics) str+=harmonics[i].toFixed(2) + " ";
  text(str, width*0.1, height*0.1);
  text("wavetable:", width*0.1, height*0.45);
  text("draw harmonics here:", width*0.1, height*0.85);
  var x1 = map(p, 0., 1., width*0.25, width*0.75);
  var y1 = map(q, -1., 1., height*0.7, height*0.2);
  ellipse(x1, y1, 10, 10);
  var base = floor(map(q, -1., 1., 40, 90));
  bufplayer.playbackRate.value = si*t.midiToFrequency(base);

  noFill();
  stroke(255, 0, 0);

  rect(width*0.25, height*0.75, width*0.5, height*0.25-10);

  var colstep = width*0.5/numharms;
  for(var i = 0;i<numharms;i++)
  {
    i%2 ? fill(192, 192, 0, 128) : fill(255, 0, 0, 128);
    var x = i*colstep+width*0.25;
    var y = map(harmonics[i], 0., 1., height-15, height*0.75);
    rect(x, y, colstep, 5);
  }

  p=(p+speed)%1.;
}

function drawBar(_x, _y)
{
  var i = imap(_x, width*0.25, width*0.75, 0, numharms);
  var j = constrain(map(_y, height*0.75, height-15, 1., 0.), 0., 1.);
  harmonics[i] = j;
}

function initBufferSource()
{
  testArr = gen.fillFloat32Array("harmonics", tabsize, harmonics);
  buf.fromArray(testArr);
  si = buf.length/Tone.context.sampleRate; // sampling increment
  bufplayer = new Tone.BufferSource(buf).toMaster().start();
  bufplayer.loop = true;
  bufplayer.playbackRate.value = si*440;
}

function mousePressed()
{
  if(mouseX>width*.25&&mouseX<width*.75&&mouseY>height*0.75&&mouseY<height-15)
  {
    within = true;
    drawBar(mouseX, mouseY);
  }
  else
  {
    within = false;
  }
}

function mouseDragged()
{
  if(within)
  {
    drawBar(mouseX, mouseY);
  }
}

function mouseReleased()
{
  if(within)
  {
    bufplayer.dispose(); // out with the old...
    initBufferSource(); // ...in with the new.
  }
}
