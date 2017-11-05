// theremin
// <3 rld

var p = 0.;
var gen = new p5.Gen();
var speed = 0.005;
var numharms = 16;
var tabsize = 2048;
var waveargs = [];

var buf = new Tone.Buffer();
var bufplayer;
var si; // sampling increment

var testArr;
var t = new Tone.Frequency();



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
  fill(0, 0, 192, 128);
  rect(width*0.25, height*0.2, width*0.5, height*0.5);
  fill(255);

  var q = gen.triples(p, waveargs);
  var str = "";
  for(var i in waveargs) str+=waveargs[i].toFixed(2) + " ";
  text(str, width*0.1, height*0.1);
  text("wavetable:", width*0.1, height*0.45);
  text("draw harmonics here:", width*0.1, height*0.85);
  var x1 = map(p, 0., 1., width*0.25, width*0.75);
  var y1 = map(q, -1., 1., height*0.7, height*0.2);
  ellipse(x1, y1, 10, 10);
  var base = floor(map(q, -1., 1., 40, 90));
  bufplayer.playbackRate.value = si*t.midiToFrequency(base);

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
//  waveargs = [1., 1., 0, 1.2, 0.8, 90];
  waveargs = [];
  for(var i = 0;i<10;i++)
  {
    var h = min(random(1., 10.),random(1., 10.)); // weight low
    var a = random(0., 1.);
    var p = random(360.);
    waveargs.push(h);
    waveargs.push(a/5.);
    waveargs.push(p);
  }
  testArr = gen.fillFloat32Array("triples", tabsize, waveargs);
  buf.fromArray(testArr);
  si = buf.length/Tone.context.sampleRate; // sampling increment
  bufplayer = new Tone.BufferSource(buf).toMaster().start();
  bufplayer.loop = true;
  bufplayer.playbackRate.value = si*440;
}


function keyTyped()
{
  bufplayer.dispose(); // out with the old...
  initBufferSource(); // ...in with the new.
  p = 0.; // reset phase on master cycle

}
