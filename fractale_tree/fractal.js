let drawingCanvas = document.getElementById("drawingCanvas");
let ctx = drawingCanvas.getContext("2d");
const branchDepth = 12; // 枝分かれの深さ

// 色情報をRGBで保持するだけのクラス
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

drawTree(ctx, branchDepth, 400, 700, 150, 90);

/**
 * 再帰的に樹形を描画する関数
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
  var color1 = new Color(21, 171, 0); // グラデーションの開始色
  var color2 = new Color(255, 43, 0); // グラデーションの終了色
  var lineColor = getGradationColor(n, branchDepth, color1, color2).stringify();

  // 線分の終点座標（sin, cosの定義から計算）
  let x1 = Math.round(x0 + Math.cos((theta * Math.PI) / 180) * l);
  let y1 = Math.round(y0 - Math.sin((theta * Math.PI) / 180) * l);

  // 枝分かれ１回あたりの角度変化量
  // 枝分かれの角度を変えていくことで、だんだん広がっていくような形状にする
  let deltaTheta = 15;

  ctx.beginPath();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = n / 3; // 末端ほど枝を細くする
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.closePath();
  ctx.stroke();

  // 枝左側の再帰描画
  drawTree(ctx, n - 1, x1, y1, l * 0.8, theta - deltaTheta);

  // 枝右側の再帰描画
  drawTree(ctx, n - 1, x1, y1, l * 0.8, theta + deltaTheta);
}

/**
 * ２色の間の色のRGB値を計算する関数
 *
 * @param {number} currStep
 *  二色を段階ごとに分けたとき、今その何段目の色を表示するのか
 * @param {number} totalStep 二色を全部で何段階に分けるのか
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
