(function(){

	//mmからpointに変換するための値

	//2.834645;
	//var mm=2.834645;
	var mm = 1;


	//色
	var lineColor = new RGBColor();
	lineColor.red	= 255;
	lineColor.green	= 0;
	lineColor.blue	= 0;

	//塗り色
	var fillColor = new RGBColor();
	fillColor.red	= 255;
	fillColor.green	= 255;
	fillColor.blue	= 0;

/*
	//矩形オブジェクトを生成
	var rect = app.activeDocument.pathItems.rectangle(25*mm,0*mm,20*mm,10*mm);
	rect.strokeColor= lineColor;
	rect.fillColor	= fillColor;
*/

/*
	//角丸矩形オブジェクトを生成
	var circle = app.activeDocument.pathItems.roundedRectangle (10*mm,0*mm,20*mm,10*mm,3*mm,3*mm);
	circle.strokeColor	= lineColor;
	circle.fillColor	= fillColor;
*/

	var www=(1024-768);

    var x01=Math.random()*www;
    var y01=Math.random()*www;
    var x02=Math.random()*www;
    var y02=Math.random()*www;
    var x03=Math.random()*www;
    var y03=Math.random()*www;



/*
//直角三角形
    var x01=0;
    var y01=0;
    var x02=0+300;
    var y02=0;
    var x03=0+0;
    var y03=0+400;
*/
/*

//正三角形
    var x01=200;
    var y01=200;
    var x02=200+100;
    var y02=200;
    var x03=200+50;
    var y03=200-50*Math.pow(3,1/2);
*/



    var a=Math.pow(Math.pow(x02-x03,2)+Math.pow(y02-y03,2),1/2);
    var b=Math.pow(Math.pow(x03-x01,2)+Math.pow(y03-y01,2),1/2);
    var c=Math.pow(Math.pow(x01-x02,2)+Math.pow(y01-y02,2),1/2);


    var s=(a+b+c)/2;
    var S=Math.pow((s*(s-a)*(s-b)*(s-c)),1/2);
    //Math.pow(s*s,1/2);
	var r=(2*S)/(a+b+c);
	var R=(a*b*c)/(4*r*s);
//内心
	var x00=(a*x01+b*x02+c*x03)/(a+b+c);
	var y00=(a*y01+b*y02+c*y03)/(a+b+c);
//外心
	var x0O=(a*a*(b*b+c*c-a*a)*x01+b*b*(c*c+a*a-b*b)*x02+c*c*(a*a+b*b-c*c)*x03)/(16*S*S);
	var y0O=(a*a*(b*b+c*c-a*a)*y01+b*b*(c*c+a*a-b*b)*y02+c*c*(a*a+b*b-c*c)*y03)/(16*S*S);
//重心
	var x0g=(x01+x02+x03)/3;
	var y0g=(y01+y02+y03)/3;

//垂心
	var thetaA=Math.acos(((x02-x01)*(x03-x01)+(y02-y01)*(y03-y01))/(b*c));
	var thetaB=Math.acos(((x03-x02)*(x01-x02)+(y03-y02)*(y01-y02))/(c*a));
	var thetaC=Math.acos(((x01-x03)*(x02-x03)+(y01-y03)*(y02-y03))/(a*b));

	var x0h=(Math.tan(thetaA)*x01+Math.tan(thetaB)*x02+Math.tan(thetaC)*x03)/(Math.tan(thetaA)+Math.tan(thetaB)+Math.tan(thetaC));
	var y0h=(Math.tan(thetaA)*y01+Math.tan(thetaB)*y02+Math.tan(thetaC)*y03)/(Math.tan(thetaA)+Math.tan(thetaB)+Math.tan(thetaC));


	//線オブジェクトを生成
	var line = app.activeDocument.pathItems.add();
	//塗りつぶしなし
	line.filled = false;
	line.closed = true;
	//線の色設定
	line.strokeColor = lineColor;
	//座標を設定
	line.setEntirePath ([[x01,y01],[x02,y02],[x03,y03]]);
	//線オブジェクトの名前を設定（レイヤーウィンドウに表示される名前）
	line.name = "ランダム三角形";


	//丸オブジェクトを生成
	var circle = app.activeDocument.pathItems.ellipse (
	((1*y00)+(1*r)),(x00-(1*r)),2*r,(2*r)
	//100,100,50,50
	);

	circle.strokeColor	= lineColor;

	var circle = app.activeDocument.pathItems.ellipse (
	((1*y0O)+(1*R)),(x0O-(1*R)),2*R,(2*R)
	//100,100,50,50
	);//始点y,x,r,r

	circle.strokeColor	= lineColor;
	//circle.fillColor	= fillColor;

	var area = app.activeDocument.pathItems.rectangle( 0*mm, 0*mm, 100*mm, 100.11*mm );
	var text = app.activeDocument.textFrames.areaText ( area );
text.contents = x00+","+y00+","+r+","+R+","+x0h+","+y0h+",";

//線オブジェクトを生成
	var line = app.activeDocument.pathItems.add();
	//塗りつぶしなし
	line.filled = true;
	line.closed = true;
	//線の色設定
	line.strokeColor = lineColor;
	//座標を設定
	line.setEntirePath ([[x00,y00],[x0O,y0O]]);
	//線オブジェクトの名前を設定（レイヤーウィンドウに表示される名前）
	line.name = "iO線";

	line.setEntirePath ([[x00,y00],[x0O,y0O],[x0g,y0g]]);
	line.closed = true;
	line.filled = false;
	line.strokeColor = lineColor;
	//線オブジェクトの名前を設定（レイヤーウィンドウに表示される名前）
	line.name = "iOg線";

var line = app.activeDocument.pathItems.add();
	line.closed = true;
	line.setEntirePath ([[x01,y01],[x0g,y0g],[x02,y02]]);
line.name = "重心線";
line.strokeColor = lineColor;
var line = app.activeDocument.pathItems.add();
	line.closed = true;
	line.setEntirePath ([[x02,y02],[x0g,y0g],[x03,y03]]);
line.name = "重心線";
line.strokeColor = lineColor;
var line = app.activeDocument.pathItems.add();
	line.closed = true;

	line.setEntirePath ([[x03,y03],[x0g,y0g],[x01,y01]]);
line.name = "重心線";
line.strokeColor = lineColor;

var line = app.activeDocument.pathItems.add();
	line.closed = true;
	line.setEntirePath ([[x0O,y0O],[x0g,y0g],[x0h,y0h]]);
line.name = "オイラー線";
line.strokeColor = lineColor;
	redraw();

	//alert();
})();