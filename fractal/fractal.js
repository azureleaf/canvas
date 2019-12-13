let drawingCanvas = document.getElementById("drawingCanvas");
let ctx = drawingCanvas.getContext("2d");
const BRANCH_DEPTH = 13; // 枝分かれの深さ

// 色情報をRGBで管理するクラス
class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  // 格納しているRGB値をJS仕様の文字列表現として返す
  stringify() {
    return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
  }
}

drawTree(ctx, BRANCH_DEPTH, 400, 700, 150, 90);

/**
 * 枝を１区間分描画する関数
 * 再帰的に呼び出すことで、樹形を作り出す
 *
 * @param {Object} ctx Canvas Context
 * @param {number} n 再帰の残り回数。つまり末端までの枝分かれ回数。再帰ごとに減らす
 * @param {number} x0 枝の始点位置のx座標
 * @param {number} y0 枝の始点位置のy座標
 * @param {number} l 枝の長さ。再帰ごとに短くする
 * @param {number} theta  枝の回転の大きさ。再帰ごとに水平に近づく
 */
function drawTree(ctx, n, x0, y0, l, theta) {
  // 再帰の終了条件
  if (n < 0) return;

  // 根幹部と末端部の色指定
  var color1 = new Color(0, 180, 0); // グラデーションの終了色
  var color2 = new Color(255, 255, 255); // グラデーションの開始色
  var lineColor = getGradationColor(
    n,
    BRANCH_DEPTH,
    color1,
    color2
  ).stringify();

  // 線分の終点座標（sin, cosの定義から計算）
  let x1 = Math.round(x0 + Math.cos((theta * Math.PI) / 180) * l);
  let y1 = Math.round(y0 - Math.sin((theta * Math.PI) / 180) * l);

  // 枝分かれ１回あたりの角度変化量
  // 枝分かれの角度を変えていくことで、だんだん広がっていくような形状にする
  let deltaTheta = 15 + Math.random() * 20;

  ctx.beginPath();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = n / 3; // 末端ほど枝を細くする
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.closePath();
  ctx.stroke();

  setTimeout(() => {
    // 枝左側の再帰描画
    drawTree(
      ctx,
      n - 1,
      x1,
      y1,
      l * (0.7 + Math.random() * 0.1),
      theta - deltaTheta
    );

    // 枝右側の再帰描画
    drawTree(
      ctx,
      n - 1,
      x1,
      y1,
      l * (0.7 + Math.random() * 0.2),
      theta + deltaTheta
    );
  }, 300);
}

/**
 * ２色の間の色のRGB値を計算する関数
 *
 * @param {number} currStep
 *  二色の間を複数段階に分けたとき、今その何段目の色を表示するのか指定
 *  0が開始色、totalStep + 1が終了色になる
 * @param {number} totalStep 二色の間を全部で何段階に分けるのか指定
 * @param {Color} colorStart グラデーション開始の色
 * @param {Color} colorEnd グラデーション終了の色
 * @return {Color} 計算された中間色
 */
function getGradationColor(currStep, totalStep, colorStart, colorEnd) {
  return new Color(
    Math.round(
      colorStart.r - (currStep * (colorStart.r - colorEnd.r)) / totalStep
    ),
    Math.round(
      colorStart.g - (currStep * (colorStart.g - colorEnd.g)) / totalStep
    ),
    Math.round(
      colorStart.b - (currStep * (colorStart.b - colorEnd.b)) / totalStep
    )
  );
}
