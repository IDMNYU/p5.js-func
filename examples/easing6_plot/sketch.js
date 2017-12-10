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

var b_tab;
var b_algo;
var b_np = 256;

var c_tab;
var c_algo;
var c_np = 384;

var d_tab;
var d_algo;
var d_np = 512;

var e_tab;
var e_algo;
var e_np = 768;

var f_tab;
var f_algo;
var f_np = 1024;

var w_u, h_u, sc;

function setup()
{
  createCanvas(1280, 720);

  w_u = width*0.75;
  h_u = height*0.8;
  sc = 0.4;

  a_algo = pickrand(styles);
  b_algo = pickrand(styles);
  c_algo = pickrand(styles);
  d_algo = pickrand(styles);
  e_algo = pickrand(styles);
  f_algo = pickrand(styles);

}

function draw()
{
  background(255);

  fill(0);
  noStroke();

  textSize(18);
  text('var e = new p5.Ease();', width/2, height*0.05);

  scale(sc);

  //1
  a_tab = e.fillArray(a_algo, 1024);
  translate(0, 0);
  drawTab(a_tab, a_algo, a_np);
  if(frameCount%120==0) a_algo = pickrand(styles);

  //2
  b_tab = e.fillArray(b_algo, b_np);
  translate(w_u, 0);
  drawTab(b_tab, b_algo, b_np);
  if(frameCount%120==0) b_algo = pickrand(styles);

  //3
  c_tab = e.fillArray(c_algo, c_np);
  translate(-w_u, h_u);
  drawTab(c_tab, c_algo, c_np);
  if(frameCount%120==0) c_algo = pickrand(styles);

  //4
  d_tab = e.fillArray(d_algo, d_np);
  translate(w_u, 0);
  drawTab(d_tab, d_algo, d_np);
  if(frameCount%120==0) d_algo = pickrand(styles);

  //5
  e_tab = e.fillArray(e_algo, e_np);
  translate(w_u, 0);
  drawTab(e_tab, e_algo, e_np);
  if(frameCount%120==0) e_algo = pickrand(styles);

  //6
  f_tab = e.fillArray(f_algo, f_np);
  translate(0, -h_u);
  drawTab(f_tab, f_algo, f_np);
  if(frameCount%120==0) f_algo = pickrand(styles);

  a_np = 1+(a_np+1) % 1024;
  b_np = 1+(b_np+1) % 1024;
  c_np = 1+(c_np+1) % 1024;
  d_np = 1+(d_np+1) % 1024;
  e_np = 1+(e_np+1) % 1024;
  f_np = 1+(f_np+1) % 1024;
}

function drawTab(_tab, _algo, _np)
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
  textAlign(CENTER);
  textSize(32);
  text(ss, width*0.5, height*0.82);

  textAlign(RIGHT);
  textSize(24);
  var ma = max(_tab);
  var mi = min(_tab);
  text('0', width*0.23, height*0.75);
  text(_algo, width*0.23, height*0.5);
  text('1', width*0.23, height*0.25);

}
