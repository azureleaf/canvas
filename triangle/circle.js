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

class CanvasSize {
  constructor() {
    this.borderWidth = 3;
    this.marginLeft = 14;
    this.marginRight = 8;
    this.marginTop = 14;
  }
  get width() {
    // When the window size is under Bootstrap "md" breakpoint width,
    // set the canvas size to 100% of the inner width of the window
    const numCols = window.innerWidth >= 768 ? 2 : 1;
    return (
      // Note that "innerWidth" includes scroll bar, therefore it's not used here
      document.body.clientWidth / numCols -
      this.marginLeft -
      this.marginRight -
      this.borderWidth * 2
    );
  }
  get height() {
    return window.innerHeight - this.marginTop * 2 - this.borderWidth * 2;
  }
}

let canvasSize = new CanvasSize();
// eslint-disable-next-line no-unused-vars
const updateCanvasSize = () => {
  canvasSize = new CanvasSize();
};

console.log(window.innerWidth);
console.log(document.body.clientWidth);

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
  EULER_LINE: "black",
};

const CENTER_TYPES = [
  "Incenter",
  "Circumcenter",
  "Centroid",
  "Orthocenter",
  "Excenter",
];

// Init DOMs
initDOM();

/**
 * HTML DOMを設定する
 */
function initDOM() {
  // Create DOM elements for checkboxes

  // Create DOM elements for calculated params of the triangle
  const circles = [
    {
      centerLabel: "",
      items: [
        { label: "辺ABの長さ：", id: "c" },
        { label: "辺BCの長さ：", id: "a" },
        { label: "辺CAの長さ：", id: "b" },
        { label: "面積：", id: "S" },
      ],
    },
    {
      centerLabel: "内心Ｉ",
      color: COLORS.INCENTER,
      items: [
        { label: "ｘ：", id: "x0i" },
        { label: "ｙ：", id: "y0i" },
        { label: "内接円の半径 r：", id: "r" },
      ],
    },
    {
      centerLabel: "外心Ｏ",
      color: COLORS.CIRCUMCENTER,
      items: [
        { label: "ｘ：", id: "x0O" },
        { label: "ｙ：", id: "y0O" },
        { label: "外接円の半径 R：", id: "R" },
      ],
    },
    {
      centerLabel: "重心Ｇ",
      color: COLORS.CENTROID,
      items: [
        { label: "ｘ：", id: "x0g" },
        { label: "ｙ：", id: "y0g" },
      ],
    },
    {
      centerLabel: "垂心Ｈ",
      color: COLORS.ORTHOCENTER,
      items: [
        { label: "ｘ：", id: "x0h" },
        { label: "ｙ：", id: "y0h" },
      ],
    },
    {
      centerLabel: "傍心ａ",
      color: COLORS.EXCENTER,
      items: [
        { label: "ｘ：", id: "x0ia" },
        { label: "ｙ：", id: "y0ia" },
        { label: "傍心円Ａの半径 ra：", id: "ra" },
      ],
    },
    {
      centerLabel: "傍心ｂ",
      color: COLORS.EXCENTER,
      items: [
        { label: "ｘ：", id: "x0ib" },
        { label: "ｙ：", id: "y0ib" },
        { label: "傍心円Ｂの半径 rb：", id: "rb" },
      ],
    },
    {
      centerLabel: "傍心ｃ",
      color: COLORS.EXCENTER,
      items: [
        { label: "ｘ：", id: "x0ic" },
        { label: "ｙ：", id: "y0ic" },
        { label: "傍心円Ｃの半径 rc：", id: "rc" },
      ],
    },
  ];

  circles.forEach((circle) => {
    let row = document.createElement("div");
    row.setAttribute("class", "form-inline");

    // Column for color sample
    if ("color" in circle) {
      let sampleCol = document.createElement("div");
      sampleCol.innerText = "●";
      sampleCol.style.color = circle.color;
      row.appendChild(sampleCol);
    }

    // Column for the label of the triangle center
    let centerLabelCol = document.createElement("div");
    let centerLabel = document.createElement("label");
    centerLabel.innerText = circle.centerLabel;
    centerLabelCol.appendChild(centerLabel);
    row.appendChild(centerLabelCol);

    // Columns for the x, y, r
    circle.items.forEach((item) => {
      let itemLabel = document.createElement("label");
      itemLabel.innerText = item.label;
      itemLabel.setAttribute("for", item.id);
      itemLabel.setAttribute("class", "ml-2");
      row.appendChild(itemLabel);

      let input = document.createElement("input");
      [
        ["type", "text"],
        ["id", item.id],
        ["placeholder", item.id],
        ["size", "4"],
        ["class", "form-control"],
        ["disabled", "true"],
      ].forEach((attr) => {
        input.setAttribute(attr[0], attr[1]);
      });
      row.appendChild(input);
    });

    document.getElementById("props").appendChild(row);
  });
}

/**
 * 三角形の三点の座標を受け取り、描画する。
 *
 * @param {Point[]} vertices ３つの頂点の座標のオブジェクト（Point Class）
 */
function draw(vertices) {
  if (typeof canvas.getContext === "undefined") {
    return;
  }
  var ctx = canvas.getContext("2d");

  // Configure canvas size & resolution
  // devicePixelRatioのWeb APIはほとんどのブラウザでサポートされている
  // この設定をしないと、canvasを拡大縮小したときにレイアウトが崩れる
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvasSize.width * dpr;
  canvas.height = canvasSize.height * dpr;

  ctx.scale(dpr, dpr);
  canvas.style.width = canvasSize.width + "px";
  canvas.style.height = canvasSize.height + "px";
  canvas.style.marginTop = canvasSize.marginTop + "px";
  canvas.style.marginLeft = canvasSize.marginLeft + "px";
  canvas.style.marginRight = canvasSize.marginRight + "px";
  canvas.style.borderWidth = canvasSize.borderWidth + "px";

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

  // 頂点の描画
  vertices.forEach((vertex, index) => {
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = COLORS.TRIANGLE_EDGE;
    ctx.fill();

    // 頂点ラベル
    ctx.font = "bold 20px serif";
    ctx.fillStyle = COLORS.TRIANGLE_EDGE;
    ctx.textAlign = "center";
    ctx.fillText(["A", "B", "C"][index], vertex.x, vertex.y - 10);
  });

  // Get parameters based on the 3 vertices (various centers, radius, etc.)
  let params = calcParams(vertices);

  // 五心のうちどれを描画すべきか、チェックボックスの状態を取得
  let targets = [];
  CENTER_TYPES.forEach((centerType) => {
    if (document.getElementById(`show${centerType}`).checked) {
      targets.push(centerType.toLocaleLowerCase());
    }
  });

  // 円の描画
  // "centerType"のキーワードによって、指定された円だけを描写するのか、あるいは全てを表示するかを切り替える
  // prettier-ignore
  if (targets.includes("incenter")) drawIncenter(params, vertices, ctx);
  if (targets.includes("circumcenter")) drawCircumcenter(params, vertices, ctx);
  if (targets.includes("centroid")) drawCentroid(params, vertices, ctx);
  if (targets.includes("excenter")) drawExcenter(params, vertices, ctx);
  if (targets.includes("orthocenter")) drawOrthocenter(params, vertices, ctx);

  // オイラー線は常に表示する
  drawEulerLine(params, vertices, ctx);

  // 三角形の延長線は常に表示する
  drawExtededSide(params, vertices, ctx);
}

/**
 * 三角形の三点座標を基に、五心に関する全変数を計算
 *
 * @param {Point[]} vertices 3つの頂点座標（Point object）の配列
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
  document.getElementById("a").value = Math.round(a);
  document.getElementById("b").value = Math.round(b);
  document.getElementById("c").value = Math.round(c);

  // 三角形の面積を算出 (Heron's formula)
  let s = (a + b + c) / 2;
  let S = Math.pow(s * (s - a) * (s - b) * (s - c), 1 / 2);

  document.getElementById("S").value = Math.round(S);

  // 内接円の半径を計算
  let r = (2 * S) / (a + b + c);
  document.getElementById("r").value = Math.round(r);

  // 外接円の半径を計算
  let R = (a * b * c) / (4 * r * s);
  document.getElementById("R").value = Math.round(R);

  /**
   * 内心 Incenter の位置計算
   */

  let incenter = new Point(
    (a * x1 + b * x2 + c * x3) / (a + b + c),
    (a * y1 + b * y2 + c * y3) / (a + b + c)
  );

  document.getElementById("x0i").value = Math.round(incenter.x);
  document.getElementById("y0i").value = Math.round(incenter.y);

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

  document.getElementById("x0O").value = Math.round(circumcenter.x);
  document.getElementById("y0O").value = Math.round(circumcenter.y);

  /**
   * 重心 Centroid の位置計算
   */
  let centroid = new Point((x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3);

  document.getElementById("x0g").value = Math.round(centroid.x);
  document.getElementById("y0g").value = Math.round(centroid.y);

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

  document.getElementById("x0h").value = Math.round(orthocenter.x);
  document.getElementById("y0h").value = Math.round(orthocenter.y);

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

  // Excenter 2
  excenter.b = new Point(
    (-b * x2 + c * x3 + a * x1) / (-b + c + a),
    (-b * y2 + c * y3 + a * y1) / (-b + c + a)
  );
  excenter.b.radius = S / (s - b);

  // Excenter 3
  excenter.c = new Point(
    (b * x2 - c * x3 + a * x1) / (b - c + a),
    (b * y2 - c * y3 + a * y1) / (b - c + a)
  );
  excenter.c.radius = S / (s - c);

  // 傍心の数値データを表示
  ["a", "b", "c"].map((edge) => {
    document.getElementById("x0i" + edge).value = Math.round(excenter[edge].x);
    document.getElementById("y0i" + edge).value = Math.round(excenter[edge].y);
    document.getElementById("r" + edge).value = Math.round(
      excenter[edge].radius
    );
  });

  // ３つの辺の各延長線とCanvasエッジとの交点座標（全部で６点）を格納する変数
  let edgePoints = {};

  // 各辺の延長線がCanvas領域端と交わる点を計算
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

  // 各辺の中点を計算
  let midpoints = {};
  midpoints.a = new Point((x2 + x3) / 2, (y2 + y3) / 2);
  midpoints.b = new Point((x3 + x1) / 2, (y3 + y1) / 2);
  midpoints.c = new Point((x1 + x2) / 2, (y1 + y2) / 2);

  // 頂点から各辺に下ろした垂線の交点を計算
  let altitudes = {};
  altitudes.a = new Point(
    x2 + ((x3 - x2) * c * Math.cos(thetaB)) / a,
    y2 + ((y3 - y2) * c * Math.cos(thetaB)) / a
  );
  altitudes.b = new Point(
    x3 + ((x1 - x3) * a * Math.cos(thetaC)) / b,
    y3 + ((y1 - y3) * a * Math.cos(thetaC)) / b
  );
  altitudes.c = new Point(
    x1 + ((x2 - x1) * b * Math.cos(thetaA)) / c,
    y1 + ((y2 - y1) * b * Math.cos(thetaA)) / c
  );

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
    edgePoints: edgePoints,
    midpoints: midpoints,
    altitudes: altitudes,
  };
}

/**
 * 三角形各辺の延長線がCanvasエッジと交わる点の座標を計算
 * @param {Point} vertex1 頂点座標
 * @param {Point} vertex2 頂点座標
 * @return {Point[]} 直線と枠線の交点となる２つの点
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
      (canvasSize.width - vertex1.x) +
    vertex1.y;

  // y=0の時のx座標
  let x1 =
    ((vertex1.x - vertex2.x) * (0 - vertex1.y)) / (vertex1.y - vertex2.y) +
    vertex1.x;

  // 直線がcanvas下端（の延長線上）に達した時のy座標
  let x2 =
    ((vertex1.x - vertex2.x) * (canvasSize.height - vertex1.y)) /
      (vertex1.y - vertex2.y) +
    vertex1.x;

  // 交点が各エッジ上にあるときはedgePoints配列に追加する
  // エッジの線分ではなくその延長線上にあるときは追加しないので、２つpushされるはず
  // prettier-ignore
  if (y1 >= 0 && y1 <= canvasSize.height)
      edgePoints.push(new Point(0, y1)); // Canvas左端との交点
  // prettier-ignore
  if (y2 >= 0 && y2 <= canvasSize.height)
      edgePoints.push(new Point(canvasSize.width, y2)); // Canvas右端との交点
  // prettier-ignore
  if (x1 >= 0 && x1 <= canvasSize.width) 
      edgePoints.push(new Point(x1, 0)); // Canvas上端との交点
  // prettier-ignore
  if (x2 >= 0 && x2 <= canvasSize.width)
      edgePoints.push(new Point(x2, canvasSize.height)); // Canvas下端との交点

  return edgePoints;
}

/**
 * 内心関係の描画
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Point[]} vertices 3つの頂点の座標
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
  ctx.arc(params.incenter.x, params.incenter.y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.INCENTER;
  ctx.fill();

  // use dash line
  ctx.setLineDash([2, 2]);

  // Guide line from Vertices to Incenter
  vertices.forEach((vertex) => {
    ctx.beginPath();
    ctx.moveTo(params.incenter.x, params.incenter.y);
    ctx.lineTo(vertex.x, vertex.y);
    ctx.strokeStyle = COLORS.INCENTER;
    ctx.stroke();
  });

  // use solid line from this on
  ctx.setLineDash([]);
}

/**
 * 外心関係の描画
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Point[]} vertices 3つの頂点（Point object）の座標
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
  ctx.arc(params.circumcenter.x, params.circumcenter.y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.CIRCUMCENTER;
  ctx.fill();

  // 破線にする
  ctx.setLineDash([2, 2]);

  // vertical bisectors
  ["a", "b", "c"].forEach((edgeKey) => {
    ctx.beginPath();
    ctx.moveTo(params.circumcenter.x, params.circumcenter.y);
    ctx.lineTo(params.midpoints[edgeKey].x, params.midpoints[edgeKey].y);
    ctx.strokeStyle = COLORS.CIRCUMCENTER;
    ctx.stroke();
  });

  // 実線に戻す
  ctx.setLineDash([]);
}

/**
 * 垂心関係の描画
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Point[]} vertices 3つの頂点の座標
 * @param {Object} ctx
 */
function drawOrthocenter(params, vertices, ctx) {
  // 垂線の描画。垂心が三角形の内部の場合・外部の場合の双方がある
  // このため、「垂心-頂点の線分」と「垂線の足-頂点の線分」のどちらが長くなるか
  // は一定でないため両者を描画する
  ["a", "b", "c"].forEach((edgeKey, index) => {
    // line from vertex to orthocenter
    ctx.beginPath();
    ctx.moveTo(params.orthocenter.x, params.orthocenter.y);
    ctx.lineTo(vertices[index].x, vertices[index].y);
    ctx.strokeStyle = COLORS.ORTHOCENTER;
    ctx.stroke();

    // line from vertex to altitude intersection point
    ctx.beginPath();
    ctx.moveTo(params.altitudes[edgeKey].x, params.altitudes[edgeKey].y);
    ctx.lineTo(vertices[index].x, vertices[index].y);
    ctx.strokeStyle = COLORS.ORTHOCENTER;
    ctx.stroke();
  });

  // orthocenter
  ctx.beginPath();
  ctx.arc(params.orthocenter.x, params.orthocenter.y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.ORTHOCENTER;
  ctx.fill();
}

/**
 * 重心関係の描画
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Point[]} vertices 3つの頂点（Point object）の座標
 * @param {Object} ctx
 */
function drawCentroid(params, vertices, ctx) {
  // use dash line
  ctx.setLineDash([2, 2]);

  // bisector lines
  ["a", "b", "c"].forEach((edgeKey, index) => {
    ctx.beginPath();
    ctx.moveTo(vertices[index].x, vertices[index].y);
    ctx.lineTo(params.midpoints[edgeKey].x, params.midpoints[edgeKey].y);
    ctx.strokeStyle = COLORS.CENTROID;
    ctx.stroke();
  });

  // use solid line
  ctx.setLineDash([]);

  // centroid
  ctx.beginPath();
  ctx.arc(params.centroid.x, params.centroid.y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.CENTROID;
  ctx.fill();
}

/**
 * 傍心関係の描画
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Point[]} vertices 3つの頂点の座標
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
      3,
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
    { from: "c", to: "a" },
  ].forEach((direction) => {
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
}

/**
 * 五心の変数を受け取り、それに則ってオイラー線を描写
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Point[]} vertices 3つの頂点（Point object）の座標
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
 * 三角形の三辺の延長線を表示する
 *
 * @param {Object} params 五心の座標、内接円外接円の半径など変数
 * @param {Point[]} vertices 3つの頂点の座標
 * @param {Object} ctx
 */
function drawExtededSide(params, vertices, ctx) {
  // 破線にする
  ctx.setLineDash([2, 2]);

  // 外心-垂心の結合線
  // 傍心円の接線を描画
  // 三角形が完成し、その各辺の延長線位置が判明しているときのみ描画
  if (
    typeof params.edgePoints.a !== "undefined" &&
    typeof params.edgePoints.b !== "undefined" &&
    typeof params.edgePoints.c !== "undefined"
  ) {
    // 3つの辺の延長線を描画
    ["a", "b", "c"].forEach((edgeKey) => {
      ctx.beginPath();
      ctx.moveTo(
        params.edgePoints[edgeKey][0].x,
        params.edgePoints[edgeKey][0].y
      );
      ctx.lineTo(
        params.edgePoints[edgeKey][1].x,
        params.edgePoints[edgeKey][1].y
      );
      ctx.strokeStyle = COLORS.TRIANGLE_EDGE;
      ctx.stroke();
    });
  }

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
          Math.round(canvasSize.width / 4),
          Math.round(canvasSize.height / 3)
      ));
      // prettier-ignore
      vertices.push(
        new Point(
          Math.round(canvasSize.width / 2),
          Math.round(canvasSize.height / 3)
      ));
      vertices.push(
        new Point(
          Math.round(canvasSize.width / 4),
          Math.round(
            canvasSize.height / 3 + (Math.random() * canvasSize.height) / 2
          )
        )
      );
      break;

    // 正三角形
    case "equilateral":
      // prettier-ignore
      vertices.push(
        new Point(
          Math.round(canvasSize.width / 2),
          Math.round(canvasSize.height / 4)));
      vertices.push(
        new Point(
          Math.round(canvasSize.width / 2 + 50),
          Math.round(canvasSize.height / 4 + 50 * Math.pow(3, 1 / 2))
        )
      );
      vertices.push(
        new Point(
          Math.round(canvasSize.width / 2 - 50),
          Math.round(canvasSize.height / 4 + 50 * Math.pow(3, 1 / 2))
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
            Math.round(
              canvasSize.width / 4 + (Math.random() * canvasSize.width) / 2
            ),
            Math.round(
              canvasSize.height / 4 + (Math.random() * canvasSize.height) / 2
            )
          )
        );
      }
      break;

    // ユーザーからの自由三点クリックによる三角形
    case "clicks":
      // console.debug(
      //   "click pos x:",
      //   event.clientX,
      //   ", offset:",
      //   canvas.offsetLeft
      // );
      // console.debug("click pos y:", event.clientY, "offset:", canvas.offsetTop);

      clickPoints.push(
        // prettier-ignore
        new Point(
          event.clientX - canvas.offsetLeft,
          event.clientY - canvas.offsetTop + window.scrollY)
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
 * 現在の三角形の座標表示欄の値を元に描画
 */
// eslint-disable-next-line no-unused-vars
function drawByFormValues() {
  // HTMLの入力欄から三角形頂点の座標を取得
  let vertices = [];
  [
    { x: "x1", y: "y1" },
    { x: "x2", y: "y2" },
    { x: "x3", y: "y3" },
  ].forEach((point) => {
    vertices.push(
      new Point(
        Number(document.getElementById(point.x).value),
        Number(document.getElementById(point.y).value)
      )
    );
  });

  draw(vertices);
}

// Add event listeners to the check boxes of circle display
CENTER_TYPES.forEach((centerType) => {
  document
    .getElementById(`show${centerType}`)
    .addEventListener("change", drawByFormValues);
});

// Add event listeners to the vertices input
["x1", "x2", "x3", "y1", "y2", "y3"].forEach((coord) => {
  document.getElementById(coord).addEventListener("change", function () {
    drawByFormValues();
  });
});

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
canvas.addEventListener(
  "click",
  (event) => setVertices("clicks", event),
  false
);
