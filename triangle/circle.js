let canvas = document.querySelector("canvas");

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
const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 750;

// Colors for paths
const COLORS = {
  TRIANGLE_EDGE: "gray",
  TRIANGLE_FILL: "lightyellow",
  EXCENTER: "purple",
  EXCENTER_LINE: "plum",
  ORTHOCENTER: "orange",
  INCENTER: "green",
  CENTROID: "dodgerblue",
  CIRCUMCENTER: "orangered",
  EULER_LINE: "red"
};

setStyle();

/**
 * HTML DOMのstyle属性を設定する
 */
function setStyle() {
  // Set attributes of <canvas> in the DOM
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
       border-color:#cccccc"
    );

  document
    .getElementById("canvas_wrapper")
    .setAttribute("style", "width:" + CANVAS_WIDTH + "px; ");

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
}

/**
 * 三角形の三点の座標を受け取り、描画する。
 *
 * @param {Object[]} vertices ３つの頂点の座標のオブジェクト（Point Class）
 * @param {string} centerType "incenter", "excenter", "all"など描画する円の指定
 */
function draw(vertices, centerType = "all") {
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
  vertices.forEach(vertex => {
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = COLORS.TRIANGLE_EDGE;
    ctx.fill();
  });

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
  // "centerType"のキーワードによって、指定された円だけを描写するのか、あるいは全てを表示するかを切り替える
  // prettier-ignore
  if (centerType == "incenter" || centerType == "all")
    drawIncenter(params, vertices, ctx);
  if (centerType == "circumcenter" || centerType == "all")
    drawCircumcenter(params, vertices, ctx);
  if (centerType == "centroid" || centerType == "all")
    drawCentroid(params, vertices, ctx);
  if (centerType == "excenter" || centerType == "all")
    drawExcenter(params, vertices, ctx);
  if (centerType == "orthocenter" || centerType == "all")
    drawOrthocenter(params, vertices, ctx);

  // オイラー線は常に表示する
  drawEulerLine(params, vertices, ctx);
}

/**
 * 三角形の三点座標を基に、五心に関する全変数を計算
 *
 * @param {Object[]} vertices 3つの頂点座標（Point object）の配列
 * @return {Object} 五心の中心座標、円の半径などの変数
 */
function calcParams(vertices) {
  // 式の表記が長ったらしくなるのを防ぐため、各頂点座標を短い中間変数で表現
  let x1 = vertices[0].x;
  let y1 = vertices[0].y;
  let x2 = vertices[1].x;
  let y2 = vertices[1].y;
  let x3 = vertices[2].x;
  let y3 = vertices[2].y;

  // ３辺の長さを算出 (Pythagorean theorem)
  let c = Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 1 / 2);
  let a = Math.pow(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2), 1 / 2);
  let b = Math.pow(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2), 1 / 2);
  document.getElementById("a").value = a;
  document.getElementById("b").value = b;
  document.getElementById("c").value = c;

  // 三角形の面積を算出 (Heron's formula)
  let s = (a + b + c) / 2;
  let S = Math.pow(s * (s - a) * (s - b) * (s - c), 1 / 2);

  document.getElementById("s").value = s;
  document.getElementById("S").value = S;

  // 内接円の半径を計算
  let r = (2 * S) / (a + b + c);
  document.getElementById("r").value = r;

  // 外接円の半径を計算
  let R = (a * b * c) / (4 * r * s);
  document.getElementById("R").value = R;

  /**
   * 内心 Incenter の位置計算
   */

  let incenter = new Point(
    (a * x1 + b * x2 + c * x3) / (a + b + c),
    (a * y1 + b * y2 + c * y3) / (a + b + c)
  );

  document.getElementById("x0i").value = incenter.x;
  document.getElementById("y0i").value = incenter.y;

  /**
   * 外心 Circumcenter の位置計算
   */
  let circumcenter = new Point(
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
  let centroid = new Point((x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3);

  document.getElementById("x0g").value = centroid.x;
  document.getElementById("y0g").value = centroid.y;

  /**
   * 垂心 Orthocenter の位置計算
   */
  // 辺の長さから角度を計算
  let thetaA = Math.acos(
    ((x2 - x1) * (x3 - x1) + (y2 - y1) * (y3 - y1)) / (b * c)
  );
  let thetaB = Math.acos(
    ((x3 - x2) * (x1 - x2) + (y3 - y2) * (y1 - y2)) / (c * a)
  );
  let thetaC = Math.acos(
    ((x1 - x3) * (x2 - x3) + (y1 - y3) * (y2 - y3)) / (a * b)
  );

  // 垂心の位置を計算
  let orthocenter = new Point(
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
  let excenter = {};

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

    // 交点が各エッジ上にあるときはedgePoints配列に追加する
    // エッジの線分ではなくその延長線上にあるときは追加しないので、２つpushされるはず
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

/**
 * 三角形各辺の延長線がCanvasエッジと交わる点の座標を計算
 *
 * @param {Object} vertex1 頂点のPoint object
 * @param {Object} vertex2 頂点のPoint object
 * @return {Object[]|null} ２つの交点のPoint Object。エラー時はnull
 *
 */
function getEdgePoints(vertex1, vertex2) {
  // 長方形のCanvas領域を横切る直線は必ず２つの交点を持つので
  // ２つのPoint objectがこれに格納される
  let edgePoints = [];

  if (typeof vertex1.x === "undefined" || typeof vertex2.x === "undefined") {
    console.log("error: coordinates of 2 points are incorrect!");
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

/**
 * 内心関係の描画
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Object[]} vertices 3つの頂点（Point object）の座標
 * @param {Object} ctx
 */
function drawIncenter(params, vertices, ctx) {
  // Inscribed Circle
  ctx.beginPath();
  ctx.arc(params.incenter.x, params.incenter.y, params.r, 0, 2 * Math.PI);
  ctx.strokeStyle = COLORS.INCENTER;
  ctx.stroke();

  // Incenter
  ctx.beginPath();
  ctx.arc(params.incenter.x, params.incenter.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.INCENTER;
  ctx.fill();
}

/**
 * 外心関係の描画
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Object[]} vertices 3つの頂点（Point object）の座標
 * @param {Object} ctx
 */
function drawCircumcenter(params, vertices, ctx) {
  // Circumscribed circle
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

  // Circumcenter
  ctx.beginPath();
  ctx.arc(params.circumcenter.x, params.circumcenter.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.CIRCUMCENTER;
  ctx.fill();
}

/**
 * 垂心関係の描画
 *
 * @param {*} params
 * @param {*} vertices
 * @param {*} ctx
 */
function drawOrthocenter(params, vertices, ctx) {
  // altitude lines
  vertices.forEach(vertex => {
    ctx.beginPath();
    ctx.moveTo(params.orthocenter.x, params.orthocenter.y);
    ctx.lineTo(vertex.x, vertex.y);
    ctx.strokeStyle = COLORS.ORTHOCENTER;
    ctx.stroke();
  });
  // orthocenter
  ctx.beginPath();
  ctx.arc(params.orthocenter.x, params.orthocenter.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.ORTHOCENTER;
  ctx.fill();
}

/**
 * 重心関係の描画
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Object[]} vertices 3つの頂点（Point object）の座標
 * @param {Object} ctx
 */
function drawCentroid(params, vertices, ctx) {
  // bisector lines
  vertices.forEach(vertex => {
    ctx.beginPath();
    ctx.moveTo(vertex.x, vertex.y);
    ctx.lineTo(params.centroid.x, params.centroid.y);
    ctx.strokeStyle = COLORS.CENTROID;
    ctx.stroke();
  });

  // centroid
  ctx.beginPath();
  ctx.arc(params.centroid.x, params.centroid.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.CENTROID;
  ctx.fill();
}

/**
 * 傍心関係の描画
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Object[]} vertices 3つの頂点（Point object）の座標
 * @param {Object} ctx
 */
function drawExcenter(params, vertices, ctx) {
  ["a", "b", "c"].forEach((excenterKey, index) => {
    // 傍心円の描画
    ctx.beginPath();
    ctx.arc(
      params.excenter[excenterKey].x,
      params.excenter[excenterKey].y,
      params.excenter[excenterKey].radius,
      0,
      2 * Math.PI
    );
    ctx.strokeStyle = COLORS.EXCENTER;
    ctx.stroke();

    // excenter
    ctx.beginPath();
    // prettier-ignore
    ctx.arc(
      params.excenter[excenterKey].x,
      params.excenter[excenterKey].y,
      2,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = COLORS.EXCENTER;
    ctx.fill();

    // line from excenter to vertex
    ctx.beginPath();
    ctx.moveTo(params.excenter[excenterKey].x, params.excenter[excenterKey].y);
    ctx.lineTo(vertices[index].x, vertices[index].y);
    ctx.strokeStyle = COLORS.EXCENTER_LINE;
    ctx.stroke();
  });

  // connector lines among excenters
  [
    { from: "a", to: "b" },
    { from: "b", to: "c" },
    { from: "c", to: "a" }
  ].forEach(direction => {
    ctx.beginPath();
    ctx.moveTo(
      params.excenter[direction.from].x,
      params.excenter[direction.from].y
    );
    ctx.lineTo(
      params.excenter[direction.to].x,
      params.excenter[direction.to].y
    );
    ctx.strokeStyle = COLORS.EXCENTER_LINE;
    ctx.stroke();
  });

  // 傍心円の接線を描画
  // 三角形が完成し、その各辺の延長線位置が判明しているときのみ描画
  if (
    typeof params.edgePoints.a !== "undefined" &&
    typeof params.edgePoints.b !== "undefined" &&
    typeof params.edgePoints.c !== "undefined"
  ) {
    // 破線にする
    ctx.setLineDash([2, 2]);

    // 3つの辺の延長線を描画
    ["a", "b", "c"].forEach(edgeKey => {
      ctx.beginPath();
      ctx.moveTo(
        params.edgePoints[edgeKey][0].x,
        params.edgePoints[edgeKey][0].y
      );
      ctx.lineTo(
        params.edgePoints[edgeKey][1].x,
        params.edgePoints[edgeKey][1].y
      );
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
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Object[]} vertices 3つの頂点（Point object）の座標
 * @param {Object} ctx
 * */
function drawEulerLine(params, vertices, ctx) {
  // 破線にする
  ctx.setLineDash([2, 2]);

  // 外心-垂心の結合線
  ctx.beginPath();
  ctx.moveTo(params.orthocenter.x, params.orthocenter.y);
  ctx.lineTo(params.circumcenter.x, params.circumcenter.y);
  ctx.strokeStyle = COLORS.EULER_LINE;
  ctx.stroke();

  // これ以降の線のスタイルを実線に戻す
  ctx.setLineDash([]);
}

/**
 * 三角形の３つの頂点座標を生成し描画関数に渡す
 *
 * @param {string} triangleType 生成する三角形の種別
 * @param {Object} event クリックイベント。triangleTypeがclicksではない場合は空引数
 */
function setVertices(triangleType, event) {
  // 3つの頂点座標オブジェクト（Point Class）を収納する配列
  let vertices = [];

  // 指定された三角形の種別により、verticesの出力内容を変える
  switch (triangleType) {
    // 直角三角形
    case "right":
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
      break;

    // 正三角形
    case "equilateral":
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
      break;

    // ランダム形状の三角形
    case "random":
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
      break;

    // ユーザーからの自由三点クリックによる三角形
    case "clicks":
      clickPoints.push(
        // prettier-ignore
        new Point(
          event.clientX - canvas.offsetLeft,
          event.clientY - canvas.offsetTop)
      );
      // checkPoints配列をverticesにコピー
      // ただしclickPoints配列に３頂点分揃っていない時はundefinedで埋める
      for (let i = 0; i < 3; i++) {
        if (clickPoints[i]) {
          vertices.push(new Point(clickPoints[i].x, clickPoints[i].y));
        } else {
          vertices.push(new Point(undefined, undefined));
        }
      }

      // 3つの点がクリックされたら、用済みなので履歴をクリアし将来のクリックに備える
      if (clickPoints.length == 3) clickPoints = [];
      break;

    default:
      console.log("Error: Unknown triangle type assigned");
  }

  // DOMでの表示
  document.getElementById("x1").value = vertices[0].x;
  document.getElementById("y1").value = vertices[0].y;
  document.getElementById("x2").value = vertices[1].x;
  document.getElementById("y2").value = vertices[1].y;
  document.getElementById("x3").value = vertices[2].x;
  document.getElementById("y3").value = vertices[2].y;

  draw(vertices);
}

/**
 * 現在の三角形座標情報を維持したまま、五心のうち指定されたものだけを再描画する
 * HTML DOMのボタンから呼び出される
 *
 * @param {string} centerType "incenter", "excenter"のような、描画したい五心の指定（省略可）
 */
function redraw(centerType) {
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

  draw(vertices, centerType);
}

/**
 * 技術メモ：Canvasへのクリックイベントに対するリスナーの書き方３通り
 *
 * .addEventListener("click", myFunc, false)
 *    イベントハンドラに引数が必要ない場合。myFunc()と書くと動かなくなるので、括弧は書かない
 *    ここには書かなくても、イベントハンドラにはイベントが引数として自動で渡される。
 *    例：function myFunc(e){ console.log(e.clientX)} のようにイベントを利用できる
 *
 * .addEventListener("click", function() {myFunc(arg)}, false)
 *    イベントハンドラに引数が必要な場合。外側に引数なしの関数を書き、中に実体の関数を引数付きで書く
 *
 * .addEventListener("click", (event) => myFunc(arg, event), false)
 *    イベントハンドラに引数が必要で、なおかつイベントが第一引数では困るのでその引数の順序を変える場合
 */
canvas.addEventListener("click", event => setVertices("clicks", event), false);
