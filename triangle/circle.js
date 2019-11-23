var canvas = document.querySelector("canvas");

/**
 * GLOBAL VARIABLES
 */

// Class to hold the (x, y) coordinate value of a point
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// ユーザーがクリックした３点の位置（Point classで表現）を保持する配列
let clickPoints = [];

// Set canvas size
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 512;

// Set attributes of <canvas> in the HTML file
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
const COLORS = {
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

// HTMLの五心それぞれについての色見本部分のstyle属性を設定
[
  { id: "sampleIncenter", color: COLORS.INCENTER },
  { id: "sampleCircumcenter", color: COLORS.CIRCUMCENTER },
  { id: "sampleExcenter", color: COLORS.EXCENTER_LINE },
  { id: "sampleOrthocenter", color: COLORS.ORTHOCENTER },
  { id: "sampleCentroid", color: COLORS.CENTROID }
].forEach(attr => {
  var elem = document.getElementById(attr.id);
  elem.style.color = attr.color;
  elem.style.backgroundColor = attr.color;
  elem.style.borderRadius = "50%";
  elem.style.marginRight = "5px";
});

/**
 * FUNCTIONS
 */

//　三角形の三点の座標を受け取り、描画する。主関数。
function draw(vertices, content = "all") {
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

  // 頂点の描画
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(vertices[i].x, vertices[i].y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = COLORS.TRIANGLE_EDGE;
    ctx.fill();
  }

  // 三角形の描画
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  ctx.lineTo(vertices[1].x, vertices[1].y);
  ctx.lineTo(vertices[2].x, vertices[2].y);
  ctx.strokeStyle = COLORS.TRIANGLE_EDGE;
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = COLORS.TRIANGLE_FILL;
  ctx.fill();

  // Get parameters based on the 3 vertices (various centers, radius, etc.)
  let params = calcParams(vertices);

  // Conditional rendering
  // "content"のキーワードによって、指定された円だけを描写するのか、あるいは全てを表示するかを切り替える
  // prettier-ignore
  if (content == "incenter" || content == "all")
    drawIncenter(params, vertices, ctx);
  if (content == "circumcenter" || content == "all")
    drawCircumcenter(params, vertices, ctx);
  if (content == "centroid" || content == "all")
    drawCentroid(params, vertices, ctx);
  if (content == "excenter" || content == "all")
    drawExcenter(params, vertices, ctx);
  if (content == "orthocenter" || content == "all")
    drawOrthocenter(params, vertices, ctx);

  // オイラー線は常に表示する
  drawEulerLine(ctx, vertices, params);
}

/**
 * 三角形の三点座標を基に、五心に関する全変数を計算
 *
 * @param {Object[]} vertices 3つの頂点（Point object）の座標
 * @return {Object} 五心の中心座標、円の半径などの変数
 */
function calcParams(vertices) {
  // 式の表記が長ったらしくなるのを防ぐため、各頂点座標を短い中間変数で表現
  var x1, x2, x3, y1, y2, y3;

  x1 = vertices[0].x;
  y1 = vertices[0].y;
  x2 = vertices[1].x;
  y2 = vertices[1].y;
  x3 = vertices[2].x;
  y3 = vertices[2].y;

  // ３辺の長さを算出 (Pythagorean theorem)
  var c = Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 1 / 2);
  var a = Math.pow(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2), 1 / 2);
  var b = Math.pow(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2), 1 / 2);
  document.getElementById("a").value = a;
  document.getElementById("b").value = b;
  document.getElementById("c").value = c;

  // 三角形の面積を算出 (Heron's formula)
  var s = (a + b + c) / 2;
  var S = Math.pow(s * (s - a) * (s - b) * (s - c), 1 / 2);

  document.getElementById("s").value = s;
  document.getElementById("S").value = S;

  // 内接円の半径を計算
  var r = (2 * S) / (a + b + c);
  document.getElementById("r").value = r;

  // 外接円の半径を計算
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
  // 辺の長さから角度を計算
  var thetaA = Math.acos(
    ((x2 - x1) * (x3 - x1) + (y2 - y1) * (y3 - y1)) / (b * c)
  );
  var thetaB = Math.acos(
    ((x3 - x2) * (x1 - x2) + (y3 - y2) * (y1 - y2)) / (c * a)
  );
  var thetaC = Math.acos(
    ((x1 - x3) * (x2 - x3) + (y1 - y3) * (y2 - y3)) / (a * b)
  );

  // 垂心の位置を計算
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

  // Excenter 1
  excenter.a = new Point(
    (b * x2 + c * x3 - a * x1) / (b + c - a),
    (b * y2 + c * y3 - a * y1) / (b + c - a)
  );
  excenter.a.radius = S / (s - a);
  document.getElementById("x0ia").value = excenter.a.x;
  document.getElementById("y0ia").value = excenter.a.y;
  document.getElementById("ra").value = excenter.a.radius;

  // Excenter 2
  excenter.b = new Point(
    (-b * x2 + c * x3 + a * x1) / (-b + c + a),
    (-b * y2 + c * y3 + a * y1) / (-b + c + a)
  );
  excenter.b.radius = S / (s - b);
  document.getElementById("x0ib").value = excenter.b.x;
  document.getElementById("y0ib").value = excenter.b.y;
  document.getElementById("rb").value = excenter.b.radius;

  // Excenter 3
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
   * @return {Object[]} ２つの交点のPoint Object
   */
  function getEdgePoints(vertex1, vertex2) {
    // 長方形のCanvas領域を横切る直線は必ず２つの交点を持つので
    // ２つのPoint objectがこれに格納される
    let edgePoints = [];

    if (typeof vertex1.x === "undefined" || typeof vertex2.x === "undefined") {
      alert("内部エラー：二点の座標が正しく入力されていません");
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

    // 交点が各エッジ上にあるときはedgePoints配列に追加する（つまり、２つ追加されるはず）
    // エッジの線分ではなくその延長線上にあるときは追加しない
    // prettier-ignore
    if (y1 >= 0 && y1 <= CANVAS_HEIGHT)
      edgePoints.push(new Point(0, y1)); // Canvas左端との交点
    // prettier-ignore
    if (y2 >= 0 && y2 <= CANVAS_HEIGHT)
      edgePoints.push(new Point(CANVAS_WIDTH, y2)); // Canvas右端との交点
    // prettier-ignore
    if (x1 >= 0 && x1 <= CANVAS_WIDTH) 
      edgePoints.push(new Point(x1, 0)); // Canvas上端との交点
    // prettier-ignore
    if (x2 >= 0 && x2 <= CANVAS_WIDTH)
      edgePoints.push(new Point(x2, CANVAS_HEIGHT)); // Canvas下端との交点

    return edgePoints;
  }

  // ３つの辺の各延長線とCanvasエッジとの交点座標（全部で６点）を格納する変数
  let edgePoints = {};

  // 各辺がCanvas領域端と交わる点を計算
  // ただし三点が全て揃って渡されていない場合には計算しない
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

// 内心関係の描画
function drawIncenter(params, vertices, ctx) {
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

// 外心関係の描画
function drawCircumcenter(params, vertices, ctx) {
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

// 垂心関係の描画
function drawOrthocenter(params, vertices, ctx) {
  // Draw Perpendicular lines
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(params.orthocenter.x, params.orthocenter.y);
    ctx.lineTo(vertices[i].x, vertices[i].y);
    ctx.strokeStyle = COLORS.ORTHOCENTER;
    ctx.stroke();
  }

  // Draw the orthocenter
  ctx.beginPath();
  ctx.arc(params.orthocenter.x, params.orthocenter.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.ORTHOCENTER;
  ctx.fill();
}

// 重心関係の描画
function drawCentroid(params, vertices, ctx) {
  // bisector lines
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(vertices[i].x, vertices[i].y);
    ctx.lineTo(params.centroid.x, params.centroid.y);
    ctx.strokeStyle = COLORS.CENTROID;
    ctx.stroke();
  }

  // center
  ctx.beginPath();
  ctx.arc(params.centroid.x, params.centroid.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.CENTROID;
  ctx.fill();
}

/**
 * 傍心関係の描画
 *
 * @param {*} params
 * @param {*} vertices
 * @param {*} ctx Canvas Context
 */
function drawExcenter(params, vertices, ctx) {
  // 同じものを３回ずつ書くのは非効率なので、文字列の配列を使って反復する
  ["a", "b", "c"].forEach((key, index) => {
    // 傍心円の描画
    ctx.beginPath();
    ctx.arc(
      params.excenter[key].x,
      params.excenter[key].y,
      params.excenter[key].radius,
      0,
      2 * Math.PI
    );
    ctx.strokeStyle = COLORS.EXCENTER;
    ctx.stroke();

    // 傍心の中心点の描画
    ctx.beginPath();
    // prettier-ignore
    ctx.arc(
      params.excenter[key].x,
      params.excenter[key].y,
      2,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = COLORS.EXCENTER;
    ctx.fill();

    // 頂点と傍心を結ぶ線の描画
    ctx.beginPath();
    ctx.moveTo(params.excenter[key].x, params.excenter[key].y);
    ctx.lineTo(vertices[index].x, vertices[index].y);
    ctx.strokeStyle = COLORS.EXCENTER_LINE;
    ctx.stroke();
  });

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

    ["a", "b", "c"].forEach(key => {
      ctx.beginPath();
      ctx.moveTo(params.edgePoints[key][0].x, params.edgePoints[key][0].y);
      ctx.lineTo(params.edgePoints[key][1].x, params.edgePoints[key][1].y);
      ctx.strokeStyle = COLORS.EXCENTER_LINE;
      ctx.stroke();
    });

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
function drawEulerLine(ctx, vertices, params) {
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
  let x = e.clientX - canvas.offsetLeft;
  let y = e.clientY - canvas.offsetTop;

  /**
   * 描画関数に渡すPoint Objectの配列
   * clickPoints[]は要素が３つない場合があるのに対して、
   * vertices[]は常に３つの要素を持ち、２点目３点目が未定の場合はundefinedで埋まっているようにする
   */
  let vertices = [];

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

  vertices.push(new Point(x1, y1));
  vertices.push(new Point(x2, y2));
  vertices.push(new Point(x3, y3));

  // 点を随時描画する。３点揃った時は、五心全てが描画される
  draw(vertices);

  // 3つの点がクリックされたら、用済みなので履歴をクリアし将来のクリックに備える
  if (clickPoints.length == 3) clickPoints = [];
}

/**
 *  直角三角形 Right triangleの自動生成
 */
function generateRightTriangle() {
  let vertices = [];

  // ２点は固定、残る１点の高さのみランダム
  // prettier-ignore
  vertices.push(
    new Point(
      CANVAS_WIDTH / 4,
      CANVAS_HEIGHT / 3));
  // prettier-ignore
  vertices.push(
    new Point(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 3));
  vertices.push(
    new Point(
      CANVAS_WIDTH / 4,
      CANVAS_HEIGHT / 3 + (Math.random() * CANVAS_HEIGHT) / 2
    )
  );

  document.getElementById("x1").value = vertices[0].x;
  document.getElementById("y1").value = vertices[0].y;
  document.getElementById("x2").value = vertices[1].x;
  document.getElementById("y2").value = vertices[1].y;
  document.getElementById("x3").value = vertices[2].x;
  document.getElementById("y3").value = vertices[2].y;

  draw(vertices);
}

// 正三角形 Equilateral triangleの生成
function generateEquilateralTriangle() {
  let vertices = [];

  // prettier-ignore
  vertices.push(
    new Point(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 4));
  vertices.push(
    new Point(
      CANVAS_WIDTH / 2 + 50,
      CANVAS_HEIGHT / 4 + 50 * Math.pow(3, 1 / 2)
    )
  );
  vertices.push(
    new Point(
      CANVAS_WIDTH / 2 - 50,
      CANVAS_HEIGHT / 4 + 50 * Math.pow(3, 1 / 2)
    )
  );

  document.getElementById("x1").value = vertices[0].x;
  document.getElementById("y1").value = vertices[0].y;
  document.getElementById("x2").value = vertices[1].x;
  document.getElementById("y2").value = vertices[1].y;
  document.getElementById("x3").value = vertices[2].x;
  document.getElementById("y3").value = vertices[2].y;

  draw(vertices);
}

/**
 * 形状がランダムな三角形の自動生成
 */
function generateRandomTriangle() {
  // 3つの頂点座標を配列として保持する中間変数
  let vertices = [];

  // 3つの頂点座標をランダムに生成
  for (let i = 0; i < 3; i++) {
    vertices.push(
      new Point(
        // 頂点の位置がカンバスの端に行きすぎない範囲とする
        CANVAS_WIDTH / 4 + (Math.random() * CANVAS_WIDTH) / 2,
        CANVAS_HEIGHT / 4 + (Math.random() * CANVAS_HEIGHT) / 2
      )
    );
  }

  document.getElementById("x1").value = vertices[0].x;
  document.getElementById("y1").value = vertices[0].y;
  document.getElementById("x2").value = vertices[1].x;
  document.getElementById("y2").value = vertices[1].y;
  document.getElementById("x3").value = vertices[2].x;
  document.getElementById("y3").value = vertices[2].y;

  draw(vertices);
}

/**
 * 五心のうち指定されたものだけを描画する
 *
 * @param {string} content "incenter", "excenter"のような、描画したい五心の指定（省略可）
 */
function renderCircle(content) {
  let vertices = [];

  // HTMLの入力欄から三角形頂点の座標を取得
  vertices.push(
    new Point(
      Number(document.getElementById("x1").value),
      Number(document.getElementById("y1").value)
    )
  );
  vertices.push(
    new Point(
      Number(document.getElementById("x2").value),
      Number(document.getElementById("y2").value)
    )
  );
  vertices.push(
    new Point(
      Number(document.getElementById("x3").value),
      Number(document.getElementById("y3").value)
    )
  );

  draw(vertices, content);
}

// Canvasへのクリックイベントに対するリスナー
canvas.addEventListener("click", freeClick, false);
