// p5.func examples - easing6_plot
// I<3DM rld

var e = new p5.Ease();
var t = 0.;
var doclear;

var styles = e.listAlgos();
var curstyle;

var a_tab;
var a_algo;
var a_np = 128;
var a_div;

var b_tab;
var b_algo;
var b_np = 256;
var b_div;

var c_tab;
var c_algo;
var c_np = 384;
var c_div;

var d_tab;
var d_algo;
var d_np = 512;
var d_div;

var e_tab;
var e_algo;
var e_np = 768;
var e_div;

var f_tab;
var f_algo;
var f_np = 1024;
var e_div;

var w_u, h_u, sc;

var tb; // textbox

function setup()
{
  createCanvas(1280, 720);

  w_u = width*0.75;
  h_u = height*0.8;
  sc = 0.4;

  a_algo = random(styles);
  b_algo = random(styles);
  c_algo = random(styles);
  d_algo = random(styles);
  e_algo = random(styles);
  f_algo = random(styles);

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(0, 20);
  tb.size(width, 50);
  tb.html('<center>var e = new p5.Ease();</center>')

  a_div = createDiv('');
  a_div.style("font-family", "Courier");
  a_div.style("font-size", "9px");
  a_div.position(width*0.1, height*sc/2+80);
  a_div.size(500, 100);

  b_div = createDiv('');
  b_div.style("font-family", "Courier");
  b_div.style("font-size", "9px");
  b_div.position(width*0.4, height*sc/2+80);
  b_div.size(500, 100);

  c_div = createDiv('');
  c_div.style("font-family", "Courier");
  c_div.style("font-size", "9px");
  c_div.position(width*0.1, height*sc+165);
  c_div.size(500, 100);

  d_div = createDiv('');
  d_div.style("font-family", "Courier");
  d_div.style("font-size", "9px");
  d_div.position(width*0.4, height*sc+165);
  d_div.size(500, 100);

  e_div = createDiv('');
  e_div.style("font-family", "Courier");
  e_div.style("font-size", "9px");
  e_div.position(width*0.7, height*sc+165);
  e_div.size(500, 100);

  f_div = createDiv('');
  f_div.style("font-family", "Courier");
  f_div.style("font-size", "9px");
  f_div.position(width*0.7, height*sc/2+80);
  f_div.size(500, 100);

}

function draw()
{
  background(255);

  fill(0);
  noStroke();

  scale(sc);

  var ss;

  //1
  a_tab = e.fillArray(a_algo, 1024);
  translate(0, 0);
  drawTab(a_tab, a_algo, a_np, a_div);
  if(frameCount%120==0) a_algo = random(styles);

  //2
  b_tab = e.fillArray(b_algo, b_np);
  translate(w_u, 0);
  drawTab(b_tab, b_algo, b_np, b_div);
  if(frameCount%120==0) b_algo = random(styles);

  //3
  c_tab = e.fillArray(c_algo, c_np);
  translate(-w_u, h_u);
  drawTab(c_tab, c_algo, c_np, c_div);
  if(frameCount%120==0) c_algo = random(styles);

  //4
  d_tab = e.fillArray(d_algo, d_np);
  translate(w_u, 0);
  drawTab(d_tab, d_algo, d_np, d_div);
  if(frameCount%120==0) d_algo = random(styles);

  //5
  e_tab = e.fillArray(e_algo, e_np);
  translate(w_u, 0);
  drawTab(e_tab, e_algo, e_np, e_div);
  if(frameCount%120==0) e_algo = random(styles);

  //6
  f_tab = e.fillArray(f_algo, f_np);
  translate(0, -h_u);
  drawTab(f_tab, f_algo, f_np, f_div);
  if(frameCount%120==0) f_algo = random(styles);

  a_np = 1+(a_np+1) % 1024;
  b_np = 1+(b_np+1) % 1024;
  c_np = 1+(c_np+1) % 1024;
  d_np = 1+(d_np+1) % 1024;
  e_np = 1+(e_np+1) % 1024;
  f_np = 1+(f_np+1) % 1024;
}

function drawTab(_tab, _algo, _np, _div)
{
  // box
  stroke(0, 0, 0);
  noFill();
  rect(width*0.25, height*0.25, width*0.5, height*0.5);

  stroke(87, 6, 140);
  fill(226, 225, 221);

  // curve
  beginShape();
  for(var i = 0;i<_tab.length;i++)
  {
    var x = i/(_tab.length-1)*width*0.5+width*0.25;
    var y = map(_tab[i], 0, 1, height*0.75, height*0.25);
    ellipse(x, y, 5, 5);
    vertex(x, y);
  }
  endShape();

  // labels
  noStroke();
  fill(0);

  var ss = 'e.fillArray(\''+_algo + '\', ' + _np + ');';
  _div.html(ss);

  textAlign(RIGHT);
  textSize(24);
  var ma = max(_tab);
  var mi = min(_tab);
  text('0', width*0.23, height*0.75);
  text('1', width*0.23, height*0.25);

}
