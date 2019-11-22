var canvas = document.querySelector("canvas");

/**
 * GLOBAL VARIABLES
 */

// Hold the (x, y) coordinate value of a point
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// ユーザーがクリックした位置を保持する配列（最大で３要素入る）
let clickPoints = [];

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 512;

// Set Canvas attribute in the HTML file
document
  .getElementsByTagName("canvas")[0]
  .setAttribute(
    "style",
    "width:" +
      CANVAS_WIDTH +
      "px; height:" +
      CANVAS_HEIGHT +
      "px;" +
      "border-style: solid; \
       border-width: 4px; \
       border-color:#ffcccc"
  );

// Colors for paths
COLORS = {
  TRIANGLE_EDGE: "black",
  TRIANGLE_FILL: "gainsboro",
  EXCENTER: "purple",
  EXCENTER_LINE: "plum",
  ORTHOCENTER: "orange",
  INCENTER: "green",
  CENTROID: "blue",
  CIRCUMCENTER: "deepskyblue",
  EULER_LINE: "orangered"
};

/**
 * FUNCTIONS
 */

//　三角形の三点の座標を受け取り、描画する。主関数。
function draw(x1, y1, x2, y2, x3, y3, content = "all") {
  if (typeof canvas.getContext === "undefined") {
    return;
  }
  var ctx = canvas.getContext("2d");

  // Configure canvas size & resolution
  const dpr = window.devicePixelRatio || 1; // This Web API is supported by most browser
  canvas.width = CANVAS_WIDTH * dpr;
  canvas.height = CANVAS_HEIGHT * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = CANVAS_WIDTH + "px";
  canvas.style.height = CANVAS_HEIGHT + "px";

  // 三角形の描画
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.strokeStyle = COLORS.TRIANGLE_EDGE;
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = COLORS.TRIANGLE_FILL;
  ctx.fill();

  // 頂点の描画
  ctx.beginPath();
  ctx.arc(x1, y1, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.TRIANGLE_EDGE;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x2, y2, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.TRIANGLE_EDGE;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x3, y3, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.TRIANGLE_EDGE;
  ctx.fill();

  // Get parameters based on the 3 vertices (various centers, radius, etc.)
  let params = calcParams(x1, y1, x2, y2, x3, y3);

  // Conditional rendering
  // "content"のキーワードによって、指定された円だけを描写するのか、あるいは全てを表示するかを切り替える
  // prettier-ignore
  if (content == "incenter" || content == "all")
    drawIncenter(params, ctx);
  if (content == "circumcenter" || content == "all")
    drawCircumcenter(params, ctx);
  if (content == "centroid" || content == "all")
    drawCentroid(params, x1, y1, x2, y2, x3, y3, ctx);
  if (content == "excenter" || content == "all")
    drawExcenter(params, x1, y1, x2, y2, x3, y3, ctx);
  if (content == "orthocenter" || content == "all")
    drawOrthocenter(params, x1, y1, x2, y2, x3, y3, ctx);

  // オイラー線は常に表示する
  drawEulerLine(ctx, params);
}

/**
 * 三角形の三点座標を受け取り、それを基に五心に関する全変数を計算
 *
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @param {Number} x3
 * @param {Number} y3
 * @return {object} 五心の中心座標、円の半径などの変数
 */
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

  /**
   * 内心 Incenter の位置計算
   */

  var incenter = new Point(
    (a * x1 + b * x2 + c * x3) / (a + b + c),
    (a * y1 + b * y2 + c * y3) / (a + b + c)
  );

  document.getElementById("x0i").value = incenter.x;
  document.getElementById("y0i").value = incenter.y;

  /**
   * 外心 Circumcenter の位置計算
   */
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

  /**
   * 重心 Centroid の位置計算
   */
  var centroid = new Point((x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3);

  document.getElementById("x0g").value = centroid.x;
  document.getElementById("y0g").value = centroid.y;

  /**
   * 垂心 Orthocenter の位置計算
   */
  // ３つの角度を辺長から計算
  var thetaA = Math.acos(
    ((x2 - x1) * (x3 - x1) + (y2 - y1) * (y3 - y1)) / (b * c)
  );
  var thetaB = Math.acos(
    ((x3 - x2) * (x1 - x2) + (y3 - y2) * (y1 - y2)) / (c * a)
  );
  var thetaC = Math.acos(
    ((x1 - x3) * (x2 - x3) + (y1 - y3) * (y2 - y3)) / (a * b)
  );

  // 幾何関係から垂心の位置を計算
  var orthocenter = new Point(
    (Math.tan(thetaA) * x1 + Math.tan(thetaB) * x2 + Math.tan(thetaC) * x3) /
      (Math.tan(thetaA) + Math.tan(thetaB) + Math.tan(thetaC)),
    (Math.tan(thetaA) * y1 + Math.tan(thetaB) * y2 + Math.tan(thetaC) * y3) /
      (Math.tan(thetaA) + Math.tan(thetaB) + Math.tan(thetaC))
  );

  document.getElementById("x0h").value = orthocenter.x;
  document.getElementById("y0h").value = orthocenter.y;

  /**
   * 傍心 Excenter の位置計算
   */

  // 3つの傍心のPoint objectを格納する変数
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

  /**
   * 三角形各辺の延長線がCanvasエッジと交わる点の座標を計算
   * @param {Object} vertex1 頂点のPoint object
   * @param {Object} vertex2 頂点のPoint object
   * @return {Object} ２つの交点のPoint Object
   */
  function getEdgePoints(vertex1, vertex2) {
    // 長方形のCanvas領域を横切る直線は必ず２つの交点を持つので
    // ２つのPoint objectがこれに格納される
    let edgePoints = [];

    if (typeof vertex1.x === "undefined" || typeof vertex2.x === "undefined") {
      console.log("二点の座標が正しく入力されていません");
      return null;
    }

    // x=0の時のy座標
    let y1 =
      ((vertex1.y - vertex2.y) / (vertex1.x - vertex2.x)) * (0 - vertex1.x) +
      vertex1.y;

    // 直線がcanvas右端（の延長線上）に達した時のy座標
    let y2 =
      ((vertex1.y - vertex2.y) / (vertex1.x - vertex2.x)) *
        (CANVAS_WIDTH - vertex1.x) +
      vertex1.y;

    // y=0の時のx座標
    let x1 =
      ((vertex1.x - vertex2.x) * (0 - vertex1.y)) / (vertex1.y - vertex2.y) +
      vertex1.x;

    // 直線がcanvas下端（の延長線上）に達した時のy座標
    let x2 =
      ((vertex1.x - vertex2.x) * (CANVAS_HEIGHT - vertex1.y)) /
        (vertex1.y - vertex2.y) +
      vertex1.x;

    // prettier-ignore
    if (y1 >= 0 && y1 <= CANVAS_HEIGHT)
      edgePoints.push(new Point(0, y1)); // Canvas左端との交点
    if (y2 >= 0 && y2 <= CANVAS_HEIGHT)
      edgePoints.push(new Point(CANVAS_WIDTH, y2)); // Canvas右端との交点
    if (x1 >= 0 && x1 <= CANVAS_WIDTH) edgePoints.push(new Point(x1, 0)); // Canvas上端との交点
    if (x2 >= 0 && x2 <= CANVAS_WIDTH)
      edgePoints.push(new Point(x2, CANVAS_HEIGHT)); // Canvas下端との交点

    return edgePoints;
  }

  let edgePoints = {};
  // 各辺がCanvas領域端と交わる点を計算
  if (
    typeof x1 !== "undefined" &&
    typeof x2 !== "undefined" &&
    typeof x3 !== "undefined"
  ) {
    edgePoints.a = getEdgePoints(new Point(x2, y2), new Point(x3, y3));
    edgePoints.b = getEdgePoints(new Point(x1, y1), new Point(x3, y3));
    edgePoints.c = getEdgePoints(new Point(x1, y1), new Point(x2, y2));
  }

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
    c: c,
    edgePoints: edgePoints
  };
}

// 内心の変数を受け取り、それに則って描写
function drawIncenter(params, ctx) {
  // cicle
  ctx.beginPath();
  ctx.arc(params.incenter.x, params.incenter.y, params.r, 0, 2 * Math.PI);
  ctx.strokeStyle = COLORS.INCENTER;
  ctx.stroke();

  // center
  ctx.beginPath();
  ctx.arc(params.incenter.x, params.incenter.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.INCENTER;
  ctx.fill();
}

// 外心の変数を受け取り、それに則って描写
function drawCircumcenter(params, ctx) {
  // circle
  ctx.beginPath();
  ctx.arc(
    params.circumcenter.x,
    params.circumcenter.y,
    params.R,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = COLORS.CIRCUMCENTER;
  ctx.stroke();

  // center
  ctx.beginPath();
  ctx.arc(params.circumcenter.x, params.circumcenter.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.CIRCUMCENTER;
  ctx.fill();
}

// 垂心の変数を受け取り、それに則って描写
function drawOrthocenter(params, x1, y1, x2, y2, x3, y3, ctx) {
  // perpendicular line 1
  ctx.beginPath();
  ctx.moveTo(params.orthocenter.x, params.orthocenter.y);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = COLORS.ORTHOCENTER;
  ctx.stroke();

  // perpendicular line 2
  ctx.beginPath();
  ctx.moveTo(params.orthocenter.x, params.orthocenter.y);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = COLORS.ORTHOCENTER;
  ctx.stroke();

  // perpendicular line 3
  ctx.beginPath();
  ctx.moveTo(params.orthocenter.x, params.orthocenter.y);
  ctx.lineTo(x3, y3);
  ctx.strokeStyle = COLORS.ORTHOCENTER;
  ctx.stroke();

  // center
  ctx.beginPath();
  ctx.arc(params.orthocenter.x, params.orthocenter.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.ORTHOCENTER;
  ctx.fill();
}

// 重心の変数を受け取り、それに則って描写
function drawCentroid(params, x1, y1, x2, y2, x3, y3, ctx) {
  // bisector line 1
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(params.centroid.x, params.centroid.y);
  ctx.strokeStyle = COLORS.CENTROID;
  ctx.stroke();

  // bisector line 2
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(params.centroid.x, params.centroid.y);
  ctx.strokeStyle = COLORS.CENTROID;
  ctx.stroke();

  // bisector line 3
  ctx.beginPath();
  ctx.moveTo(x3, y3);
  ctx.lineTo(params.centroid.x, params.centroid.y);
  ctx.strokeStyle = COLORS.CENTROID;
  ctx.stroke();

  // center
  ctx.beginPath();
  ctx.arc(params.centroid.x, params.centroid.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.CENTROID;
  ctx.fill();
}

/**
 * 傍心の変数を受け取り、それに則って描画
 *
 * @param {*} params
 * @param {*} x1
 * @param {*} y1
 * @param {*} x2
 * @param {*} y2
 * @param {*} x3
 * @param {*} y3
 * @param {*} ctx
 */
function drawExcenter(params, x1, y1, x2, y2, x3, y3, ctx) {
  // circle A
  ctx.beginPath();
  ctx.arc(
    params.excenter.a.x,
    params.excenter.a.y,
    params.excenter.a.radius,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = COLORS.EXCENTER;
  ctx.stroke();

  // circle B
  ctx.beginPath();
  ctx.arc(
    params.excenter.b.x,
    params.excenter.b.y,
    params.excenter.b.radius,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = COLORS.EXCENTER;
  ctx.stroke();

  // circle C
  ctx.beginPath();
  ctx.arc(
    params.excenter.c.x,
    params.excenter.c.y,
    params.excenter.c.radius,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = COLORS.EXCENTER;
  ctx.stroke();

  // Line from vertex 1 to Excenter A
  ctx.beginPath();
  ctx.moveTo(params.excenter.a.x, params.excenter.a.y);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = COLORS.EXCENTER_LINE;
  ctx.stroke();

  // Line from vertex 2 to Excenter B
  ctx.beginPath();
  ctx.moveTo(params.excenter.b.x, params.excenter.b.y);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = COLORS.EXCENTER_LINE;
  ctx.stroke();

  // Line from vertex 3 to Excenter C
  ctx.beginPath();
  ctx.moveTo(params.excenter.c.x, params.excenter.c.y);
  ctx.lineTo(x3, y3);
  ctx.strokeStyle = COLORS.EXCENTER_LINE;
  ctx.stroke();

  // Excenter A
  ctx.beginPath();
  ctx.arc(params.excenter.a.x, params.excenter.a.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.EXCENTER;
  ctx.fill();

  // Excenter B
  ctx.beginPath();
  ctx.arc(params.excenter.b.x, params.excenter.b.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.EXCENTER;
  ctx.fill();

  // Excenter C
  ctx.beginPath();
  ctx.arc(params.excenter.c.x, params.excenter.c.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.EXCENTER;
  ctx.fill();

  // Line from Excenter A to Excenter B
  ctx.beginPath();
  ctx.moveTo(params.excenter.a.x, params.excenter.a.y);
  ctx.lineTo(params.excenter.b.x, params.excenter.b.y);
  ctx.strokeStyle = COLORS.EXCENTER_LINE;
  ctx.stroke();

  // Line from Excenter B to Excenter C
  ctx.beginPath();
  ctx.moveTo(params.excenter.b.x, params.excenter.b.y);
  ctx.lineTo(params.excenter.c.x, params.excenter.c.y);
  ctx.strokeStyle = COLORS.EXCENTER_LINE;
  ctx.stroke();

  // Line from Excenter C to Excenter A
  ctx.beginPath();
  ctx.moveTo(params.excenter.c.x, params.excenter.c.y);
  ctx.lineTo(params.excenter.a.x, params.excenter.a.y);
  ctx.strokeStyle = COLORS.EXCENTER_LINE;
  ctx.stroke();

  // 傍心円の接線を描画
  // 三角形が完成し、その各辺の延長線位置が判明しているときのみ描画
  if (
    typeof params.edgePoints.a !== "undefined" &&
    typeof params.edgePoints.b !== "undefined" &&
    typeof params.edgePoints.c !== "undefined"
  ) {
    // 破線にする
    ctx.setLineDash([1, 2]);

    ctx.beginPath();
    ctx.moveTo(params.edgePoints.a[0].x, params.edgePoints.a[0].y);
    ctx.lineTo(params.edgePoints.a[1].x, params.edgePoints.a[1].y);
    ctx.strokeStyle = COLORS.EXCENTER_LINE;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(params.edgePoints.b[0].x, params.edgePoints.b[0].y);
    ctx.lineTo(params.edgePoints.b[1].x, params.edgePoints.b[1].y);
    ctx.strokeStyle = COLORS.EXCENTER_LINE;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(params.edgePoints.c[0].x, params.edgePoints.c[0].y);
    ctx.lineTo(params.edgePoints.c[1].x, params.edgePoints.c[1].y);
    ctx.strokeStyle = COLORS.EXCENTER_LINE;
    ctx.stroke();

    // これ以降の線のスタイルを実線に戻す
    ctx.setLineDash([]);
  }
}

/**
 * 五心の変数を受け取り、それに則ってオイラー線を描写
 *
 * @param {*} ctx Canvas Context
 * @param {*} params 五心の各座標などの計算結果
 */
function drawEulerLine(ctx, params) {
  // 外心-垂心の結合線
  ctx.beginPath();
  ctx.moveTo(params.orthocenter.x, params.orthocenter.y);
  ctx.lineTo(params.circumcenter.x, params.circumcenter.y);
  ctx.strokeStyle = COLORS.EULER_LINE;
  ctx.stroke();

  // 重心-外心の結合線
  ctx.beginPath();
  ctx.moveTo(params.circumcenter.x, params.circumcenter.y);
  ctx.lineTo(params.centroid.x, params.centroid.y);
  ctx.strokeStyle = COLORS.EULER_LINE;
  ctx.stroke();

  // 重心-垂心の結合線
  ctx.beginPath();
  ctx.moveTo(params.centroid.x, params.centroid.y);
  ctx.lineTo(params.orthocenter.x, params.orthocenter.y);
  ctx.strokeStyle = COLORS.EULER_LINE;
  ctx.stroke();
}

/**
 * ユーザのクリックによる任意の三角形指定のハンドラ
 * クリック毎に呼ばれる
 * @param {*} e Click event
 */
function freeClick(e) {
  var x = e.clientX - canvas.offsetLeft;
  var y = e.clientY - canvas.offsetTop;
  clickPoints.push(new Point(x, y));

  // clickPoints配列に３頂点分揃っていない時は
  // 単に無視して何も代入しないよう条件分岐
  if (clickPoints[0]) {
    var x1 = clickPoints[0].x;
    var y1 = clickPoints[0].y;
  }

  if (clickPoints[1]) {
    var x2 = clickPoints[1].x;
    var y2 = clickPoints[1].y;
  }

  if (clickPoints[2]) {
    var x3 = clickPoints[2].x;
    var y3 = clickPoints[2].y;
  }

  // 二点目以降がまだ指定されていない時は、座標値はundefinedとなる
  document.getElementById("x1").value = x1;
  document.getElementById("y1").value = y1;
  document.getElementById("x2").value = x2;
  document.getElementById("y2").value = y2;
  document.getElementById("x3").value = x3;
  document.getElementById("y3").value = y3;

  // 点を随時描画する。３点揃った時は、五心全てが描画される
  draw(x1, y1, x2, y2, x3, y3);

  // 3つの点がクリックされたら、用済みなので履歴をクリアし将来のクリックに備える
  if (clickPoints.length == 3) clickPoints = [];
}

/**
 *  直角三角形 Right triangleの自動生成
 */
function generateRightTriangle() {
  let x1, y1, x2, y2, x3, y3;

  // ２点は固定、残る１点の高さのみランダム
  x1 = CANVAS_WIDTH / 4;
  y1 = CANVAS_HEIGHT / 3;
  x2 = CANVAS_WIDTH / 2;
  y2 = CANVAS_HEIGHT / 3;
  x3 = CANVAS_WIDTH / 4;
  y3 = CANVAS_HEIGHT / 3 + (Math.random() * CANVAS_HEIGHT) / 2;

  // 生成値をinput formに表示
  document.getElementById("x1").value = x1;
  document.getElementById("y1").value = y1;
  document.getElementById("x2").value = x2;
  document.getElementById("y2").value = y2;
  document.getElementById("x3").value = x3;
  document.getElementById("y3").value = y3;

  draw(x1, y1, x2, y2, x3, y3);
}

// 正三角形 Equilateral triangleの生成
function generateEquilateralTriangle() {
  x1 = CANVAS_WIDTH / 2;
  y1 = CANVAS_HEIGHT / 4;
  x2 = CANVAS_WIDTH / 2 + 50;
  y2 = CANVAS_HEIGHT / 4 + 50 * Math.pow(3, 1 / 2);
  x3 = CANVAS_WIDTH / 2 - 50;
  y3 = CANVAS_HEIGHT / 4 + 50 * Math.pow(3, 1 / 2);

  document.getElementById("x1").value = x1;
  document.getElementById("y1").value = y1;
  document.getElementById("x2").value = x2;
  document.getElementById("y2").value = y2;
  document.getElementById("x3").value = x3;
  document.getElementById("y3").value = y3;

  draw(x1, y1, x2, y2, x3, y3);
}

/**
 * 形状がランダムな三角形の自動生成
 */
function generateRandomTriangle() {
  let x1, y1, x2, y2, x3, y3;

  // 頂点の位置がカンバスの端に行きすぎない範囲でランダムに位置決定
  x1 = CANVAS_WIDTH / 4 + (Math.random() * CANVAS_WIDTH) / 2;
  y1 = CANVAS_HEIGHT / 4 + (Math.random() * CANVAS_HEIGHT) / 2;
  x2 = CANVAS_WIDTH / 4 + (Math.random() * CANVAS_WIDTH) / 2;
  y2 = CANVAS_HEIGHT / 4 + (Math.random() * CANVAS_HEIGHT) / 2;
  x3 = CANVAS_WIDTH / 4 + (Math.random() * CANVAS_WIDTH) / 2;
  y3 = CANVAS_HEIGHT / 4 + (Math.random() * CANVAS_HEIGHT) / 2;

  // 生成値をinput formに表示
  document.getElementById("x1").value = x1;
  document.getElementById("y1").value = y1;
  document.getElementById("x2").value = x2;
  document.getElementById("y2").value = y2;
  document.getElementById("x3").value = x3;
  document.getElementById("y3").value = y3;

  draw(x1, y1, x2, y2, x3, y3);
}

/**
 * 五心のうち指定されたものだけを描写する
 * 三角形頂点の座標はHTMLの入力欄から取得する
 * @param {string} content "incenter", "excenter"のような五心の指定（省略可）
 */
function renderCircle(content) {
  let x1 = Number(document.getElementById("x1").value);
  let y1 = Number(document.getElementById("y1").value);
  let x2 = Number(document.getElementById("x2").value);
  let y2 = Number(document.getElementById("y2").value);
  let x3 = Number(document.getElementById("x3").value);
  let y3 = Number(document.getElementById("y3").value);

  draw(x1, y1, x2, y2, x3, y3, content);
}

// Canvasへのクリックイベントに対するリスナー
canvas.addEventListener("click", freeClick, false);
