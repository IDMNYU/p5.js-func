// p5.func examples - filter1_smooth
// I<3DM rld

var f;

var osc1, osc2;

var tb; // textbox

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

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(width*0.1, height*0.1);
  tb.size(500, 500);

  f = new p5.Filt()
  f.set('lowpass', 3, 0.7);

}

function draw()
{
  background(255);
  fill(0);
  noStroke();
  textAlign(LEFT);

  var p = random();
  var q = f.tick(p);

  var hs = '';
  hs+= 'var f = new p5.Filt();<br>';
  hs+= 'f.set(\'lowpass\', 3, 0.7);<br>';
  hs+= 'var p = random();<br>';
  hs+= 'var q = f.tick(p);<br>';
  hs+= '<br><br><br><br>p: ' + p.toFixed(2) + '<br>';
  hs+= '<br><br><br>q: ' + q.toFixed(2);

  tb.html(hs);

  noFill();
  stroke(255, 0, 0);
  line(width*0.2, height*0.3, width*0.8, height*0.3);
  line(width*0.2, height*0.4, width*0.8, height*0.4);

  fill(0);
  noStroke();
  ellipse(p*width*0.6+width*0.2, height*0.3, 15, 15);
  ellipse(q*width*0.6+width*0.2, height*0.4, 15, 15);

  pan1 = map(p, 0., 1., -0.9, 0.9);
  pan2 = constrain(map(q, 0., 1., -0.9, 0.9), -1., 1.);
  osc1.pan(pan1, 0.1);
  osc2.pan(pan2, 0.1);

}
