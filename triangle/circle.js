var canvas = document.querySelector("canvas");

// Hold the (x, y) coordinate value of a point
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/* Global variables*/
let clickLoc = {
  x: [],
  y: []
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 512;

//　三角形の三点の座標を受け取り、描画する。主関数。
function draw(x1, y1, x2, y2, x3, y3, content = "all") {
  if (typeof canvas.getContext === "undefined") {
    return;
  }
  var ctx = canvas.getContext("2d");

  // Config canvas size & resolution
  const dpr = window.devicePixelRatio || 1; // This Web API is supported by most browser
  canvas.width = CANVAS_WIDTH * dpr;
  canvas.height = CANVAS_HEIGHT * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = CANVAS_WIDTH + "px";
  canvas.style.height = CANVAS_HEIGHT + "px";

  // 三角形描画
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.strokeStyle = "black";
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgb(240, 240, 240";
  ctx.fill();

  // 頂点の描画
  ctx.beginPath();
  ctx.arc(x1, y1, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x2, y2, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x3, y3, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();

  // Get parameters based on the 3 vertices (various centers, radius, etc.)
  let params = calcParams(x1, y1, x2, y2, x3, y3);

  // Conditional rendering
  // "content"のキーワードによって、指定された円だけを描写するのか、あるいは全てを表示するかを切り替える
  if (content == "centroid" || content == "all") {
    drawCentroid(
      params.centroid,
      params.r,
      params.R,
      params.S,
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      ctx
    );
  }

  if (content == "circumcenter" || content == "all") {
    drawCircumcenter(
      params.circumcenter,
      params.r,
      params.R,
      params.S,
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      ctx
    );
  }
  if (content == "excenter" || content == "all") {
    drawExcenter(
      params.excenter,
      params.r,
      params.R,
      params.S,
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      ctx
    );
  }
  if (content == "orthocenter" || content == "all") {
    drawOrthocenter(
      params.orthocenter,
      params.r,
      params.R,
      params.S,
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      ctx
    );
  }
  if (content == "incenter" || content == "all") {
    drawIncenter(
      params.incenter,
      params.r,
      params.R,
      params.S,
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      ctx
    );
  }

  // オイラー線は常に表示する
  if (true) {
    drawEulerLine(
      ctx,
      params.circumcenter,
      params.centroid,
      params.orthocenter
    );
  }
}

// 三角形の三点座標を受け取り、五心とそれに関する全ての変数を計算し返す
function calcParams(x1, y1, x2, y2, x3, y3) {
  // ３辺の長さ (Pythagorean theorem)
  var c = Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 1 / 2);
  var a = Math.pow(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2), 1 / 2);
  var b = Math.pow(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2), 1 / 2);
  document.getElementById("a").value = a;
  document.getElementById("b").value = b;
  document.getElementById("c").value = c;

  // 三角形の面積 (Heron's formula)
  var s = (a + b + c) / 2;
  var S = Math.pow(s * (s - a) * (s - b) * (s - c), 1 / 2);

  document.getElementById("s").value = s;
  document.getElementById("S").value = S;

  // 内接円の半径
  var r = (2 * S) / (a + b + c);
  document.getElementById("r").value = r;

  // 外接円の半径
  var R = (a * b * c) / (4 * r * s);
  document.getElementById("R").value = R;

  // 内心 Incenter の位置計算
  var incenter = new Point(
    (a * x1 + b * x2 + c * x3) / (a + b + c),
    (a * y1 + b * y2 + c * y3) / (a + b + c)
  );

  document.getElementById("x0i").value = incenter.x;
  document.getElementById("y0i").value = incenter.y;

  // 外心 Circumcenter の位置計算
  var circumcenter = new Point(
    (a * a * (b * b + c * c - a * a) * x1 +
      b * b * (c * c + a * a - b * b) * x2 +
      c * c * (a * a + b * b - c * c) * x3) /
      (16 * S * S),
    (a * a * (b * b + c * c - a * a) * y1 +
      b * b * (c * c + a * a - b * b) * y2 +
      c * c * (a * a + b * b - c * c) * y3) /
      (16 * S * S)
  );

  document.getElementById("x0O").value = circumcenter.x;
  document.getElementById("y0O").value = circumcenter.y;

  // 重心 Centroid の位置計算
  var centroid = new Point((x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3);

  document.getElementById("x0g").value = centroid.x;
  document.getElementById("y0g").value = centroid.y;

  // 垂心 Orthocenter の位置計算
  var thetaA = Math.acos(
    ((x2 - x1) * (x3 - x1) + (y2 - y1) * (y3 - y1)) / (b * c)
  );
  var thetaB = Math.acos(
    ((x3 - x2) * (x1 - x2) + (y3 - y2) * (y1 - y2)) / (c * a)
  );
  var thetaC = Math.acos(
    ((x1 - x3) * (x2 - x3) + (y1 - y3) * (y2 - y3)) / (a * b)
  );

  var orthocenter = new Point(
    (Math.tan(thetaA) * x1 + Math.tan(thetaB) * x2 + Math.tan(thetaC) * x3) /
      (Math.tan(thetaA) + Math.tan(thetaB) + Math.tan(thetaC)),
    (Math.tan(thetaA) * y1 + Math.tan(thetaB) * y2 + Math.tan(thetaC) * y3) /
      (Math.tan(thetaA) + Math.tan(thetaB) + Math.tan(thetaC))
  );

  document.getElementById("x0h").value = orthocenter.x;
  document.getElementById("y0h").value = orthocenter.y;

  // 傍心 Excenter の位置計算
  var excenter = {};
  excenter.a = new Point(
    (b * x2 + c * x3 - a * x1) / (b + c - a),
    (b * y2 + c * y3 - a * y1) / (b + c - a)
  );
  excenter.a.radius = S / (s - a);

  document.getElementById("x0ia").value = excenter.a.x;
  document.getElementById("y0ia").value = excenter.a.y;
  document.getElementById("ra").value = excenter.a.radius;

  excenter.b = new Point(
    (-b * x2 + c * x3 + a * x1) / (-b + c + a),
    (-b * y2 + c * y3 + a * y1) / (-b + c + a)
  );
  excenter.b.radius = S / (s - b);

  document.getElementById("x0ib").value = excenter.b.x;
  document.getElementById("y0ib").value = excenter.b.y;
  document.getElementById("rb").value = excenter.b.radius;

  excenter.c = new Point(
    (b * x2 - c * x3 + a * x1) / (b - c + a),
    (b * y2 - c * y3 + a * y1) / (b - c + a)
  );
  excenter.c.radius = S / (s - c);

  document.getElementById("x0ic").value = excenter.c.x;
  document.getElementById("y0ic").value = excenter.c.y;
  document.getElementById("rc").value = excenter.c.radius;

  // 全ての計算結果をオブジェクトとして返却
  return {
    excenter: excenter,
    incenter: incenter,
    orthocenter: orthocenter,
    circumcenter: circumcenter,
    centroid: centroid,
    S: S,
    r: r,
    R: R,
    a: a,
    b: b,
    c: c
  };
}

// 内心の変数を受け取り、それに則って描写
function drawIncenter(incenter, r, R, S, x1, y1, x2, y2, x3, y3, ctx) {
  // cicle
  ctx.beginPath();
  ctx.arc(incenter.x, incenter.y, r, 0, 2 * Math.PI);
  ctx.strokeStyle = "green";
  ctx.stroke();

  // center
  ctx.beginPath();
  ctx.arc(incenter.x, incenter.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "green";
  ctx.fill();
}

// 外心の変数を受け取り、それに則って描写
function drawCircumcenter(circumcenter, r, R, S, x1, y1, x2, y2, x3, y3, ctx) {
  // circle
  ctx.beginPath();
  ctx.arc(circumcenter.x, circumcenter.y, R, 0, 2 * Math.PI);
  ctx.strokeStyle = "skyblue";
  ctx.stroke();

  // center
  ctx.beginPath();
  ctx.arc(circumcenter.x, circumcenter.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "skyblue";
  ctx.fill();
}

// 垂心の変数を受け取り、それに則って描写
function drawOrthocenter(orthocenter, r, R, S, x1, y1, x2, y2, x3, y3, ctx) {
  // perpendicular line 1
  ctx.beginPath();
  ctx.moveTo(orthocenter.x, orthocenter.y);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = "orange";
  ctx.stroke();

  // perpendicular line 2
  ctx.beginPath();
  ctx.moveTo(orthocenter.x, orthocenter.y);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = "orange";
  ctx.stroke();

  // perpendicular line 3
  ctx.beginPath();
  ctx.moveTo(orthocenter.x, orthocenter.y);
  ctx.lineTo(x3, y3);
  ctx.strokeStyle = "orange";
  ctx.stroke();

  // center
  ctx.beginPath();
  ctx.arc(orthocenter.x, orthocenter.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "orange";
  ctx.fill();
}

// 重心の変数を受け取り、それに則って描写
function drawCentroid(centroid, r, R, S, x1, y1, x2, y2, x3, y3, ctx) {
  // bisector line 1
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(centroid.x, centroid.y);
  ctx.strokeStyle = "blue";
  ctx.stroke();

  // bisector line 2
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(centroid.x, centroid.y);
  ctx.strokeStyle = "blue";
  ctx.stroke();

  // bisector line 3
  ctx.beginPath();
  ctx.moveTo(x3, y3);
  ctx.lineTo(centroid.x, centroid.y);
  ctx.strokeStyle = "blue";
  ctx.stroke();

  // center
  ctx.beginPath();
  ctx.arc(centroid.x, centroid.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();
}

// 傍心の変数を受け取り、それに則って描写
function drawExcenter(excenter, r, R, S, x1, y1, x2, y2, x3, y3, ctx) {
  // circle 1
  ctx.beginPath();
  ctx.arc(excenter.a.x, excenter.a.y, excenter.a.radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "purple";
  ctx.stroke();

  // circle 2
  ctx.beginPath();
  ctx.arc(excenter.b.x, excenter.b.y, excenter.b.radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "purple";
  ctx.stroke();

  // circle 3
  ctx.beginPath();
  ctx.arc(excenter.c.x, excenter.c.y, excenter.c.radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "purple";
  ctx.stroke();

  // vertex to excenter line 1
  ctx.beginPath();
  ctx.moveTo(excenter.a.x, excenter.a.y);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = "plum";
  ctx.stroke();

  // vertex to excenter line 2
  ctx.beginPath();
  ctx.moveTo(excenter.b.x, excenter.b.y);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = "plum";
  ctx.stroke();

  // vertex to excenter line 3
  ctx.beginPath();
  ctx.moveTo(excenter.c.x, excenter.c.y);
  ctx.lineTo(x3, y3);
  ctx.strokeStyle = "plum";
  ctx.stroke();

  // center 1
  ctx.beginPath();
  ctx.arc(excenter.a.x, excenter.a.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "purple";
  ctx.fill();

  // center 2
  ctx.beginPath();
  ctx.arc(excenter.b.x, excenter.b.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "purple";
  ctx.fill();

  // center 3
  ctx.beginPath();
  ctx.arc(excenter.c.x, excenter.c.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "purple";
  ctx.fill();
}

// 五心の変数を受け取り、それに則ってオイラー線を描写
function drawEulerLine(ctx, circumcenter, centroid, orthocenter) {
  // 外心-垂心の結合線
  ctx.beginPath();
  ctx.moveTo(orthocenter.x, orthocenter.y);
  ctx.lineTo(circumcenter.x, circumcenter.y);
  ctx.strokeStyle = "red";
  ctx.stroke();

  // 重心-外心の結合線
  ctx.beginPath();
  ctx.moveTo(circumcenter.x, circumcenter.y);
  ctx.lineTo(centroid.x, centroid.y);
  ctx.strokeStyle = "red";
  ctx.stroke();

  // 重心-垂心の結合線
  ctx.beginPath();
  ctx.moveTo(centroid.x, centroid.y);
  ctx.lineTo(orthocenter.x, orthocenter.y);
  ctx.strokeStyle = "red";
  ctx.stroke();
}

// Handle the free triangle input by user
function freeClick(e) {
  var x = e.clientX - canvas.offsetLeft;
  var y = e.clientY - canvas.offsetTop;
  clickLoc.x.push(x);
  clickLoc.y.push(y);

  var x1 = clickLoc.x[0];
  var y1 = clickLoc.y[0];
  var x2 = clickLoc.x[1];
  var y2 = clickLoc.y[1];
  var x3 = clickLoc.x[2];
  var y3 = clickLoc.y[2];

  document.getElementById("x1").value = x1;
  document.getElementById("y1").value = y1;
  document.getElementById("x2").value = x2;
  document.getElementById("y2").value = y2;
  document.getElementById("x3").value = x3;
  document.getElementById("y3").value = y3;

  draw(x1, y1, x2, y2, x3, y3);

  // Empty the click history when clicked 3 times
  // so that it can accept future input
  if (clickLoc.x.length == 3) {
    clickLoc.x = [];
    clickLoc.y = [];
  }
}

// Draw 直角三角形 Right triangle
function generateRightTriangle() {
  var ran = Math.random() * (1024 - 256);

  x1 = ran;
  y1 = ran;
  x2 = ran + 300;
  y2 = ran;
  x3 = ran;
  y3 = ran + 400;

  document.getElementById("x1").value = x1;
  document.getElementById("y1").value = y1;
  document.getElementById("x2").value = x2;
  document.getElementById("y2").value = y2;
  document.getElementById("x3").value = x3;
  document.getElementById("y3").value = y3;

  draw(x1, y1, x2, y2, x3, y3);
}

// Draw 正三角形 Equilateral triangle
function generateEquilateralTriangle() {
  x1 = 200;
  y1 = 200;
  x2 = 200 + 100;
  y2 = 200;
  x3 = 200 + 50;
  y3 = 200 - 50 * Math.pow(3, 1 / 2);

  document.getElementById("x1").value = x1;
  document.getElementById("y1").value = y1;
  document.getElementById("x2").value = x2;
  document.getElementById("y2").value = y2;
  document.getElementById("x3").value = x3;
  document.getElementById("y3").value = y3;

  draw(x1, y1, x2, y2, x3, y3);
}

// Draw random triangle
function generateRandomTriangle() {
  let www = 256;
  let x1, y1, x2, y2, x3, y3;
  x1 = Math.random() * www;
  y1 = Math.random() * www;
  x2 = Math.random() * www;
  y2 = Math.random() * www;
  x3 = Math.random() * www;
  y3 = Math.random() * www;

  document.getElementById("x1").value = x1;
  document.getElementById("y1").value = y1;
  document.getElementById("x2").value = x2;
  document.getElementById("y2").value = y2;
  document.getElementById("x3").value = x3;
  document.getElementById("y3").value = y3;

  draw(x1, y1, x2, y2, x3, y3);
}

// Render only one center (centroid, incenter, etc.)
function renderCircle(content) {
  let x1 = Number(document.getElementById("x1").value);
  let y1 = Number(document.getElementById("y1").value);
  let x2 = Number(document.getElementById("x2").value);
  let y2 = Number(document.getElementById("y2").value);
  let x3 = Number(document.getElementById("x3").value);
  let y3 = Number(document.getElementById("y3").value);

  draw(x1, y1, x2, y2, x3, y3, content);
}

canvas.addEventListener("click", freeClick, false);
