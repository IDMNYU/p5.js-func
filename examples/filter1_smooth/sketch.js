// p5.func examples - filter1_smooth
// I<3DM rld

var f;

var osc1, osc2;

function setup()
{
  createCanvas(800, 600);
  fill(255);

  osc1 = new p5.Oscillator();
  osc1.setType('sine');
  osc1.freq(500.);
  osc1.amp(0.3);
  osc1.start();
  osc2 = new p5.Oscillator();
  osc2.setType('triangle');
  osc2.freq(300.);
  osc2.amp(0.3);
  osc2.start();

  textSize(18);

  f = new p5.Filt()
  f.set('lowpass', 3, 0.7);

}

function draw()
{
  background(255);
  fill(0);
  noStroke();
  textAlign(LEFT);

  var p = random(0, 1);
  var q = f.tick(p);

  var ss = 'var f = new p5.Filt();';
  text(ss, width*0.1, height*0.1);
  var ss = 'f.set(\'lowpass\', 3, 0.7);';
  text(ss, width*0.1, height*0.15);
  var ss = 'var p = '+p.toFixed(2)+';';
  text(ss, width*0.1, height*0.2);
  var ss = 'var q = f.tick(p);';
  text(ss, width*0.1, height*0.25);

  noFill();
  stroke(255, 0, 0);
  line(width*0.2, height*0.3, width*0.8, height*0.3);
  line(width*0.2, height*0.4, width*0.8, height*0.4);

  fill(0);
  noStroke();
  text("p: " + p.toFixed(2), width*0.1, height*0.3);
  ellipse(p*width*0.6+width*0.2, height*0.3, 15, 15);
  text("q: " + q.toFixed(2), width*0.1, height*0.4);
  ellipse(q*width*0.6+width*0.2, height*0.4, 15, 15);

  pan1 = map(p, 0., 1., -0.9, 0.9);
  pan2 = constrain(map(q, 0., 1., -0.9, 0.9), -1., 1.);
  osc1.pan(pan1, 0.1);
  osc2.pan(pan2, 0.1);

}
