function setup(){
//1st 描画領域のセットアップ

  createCanvas(600,200);
  background(0);
  noStroke();
  fill(255);

//2nd ellipse
// const size=5;

// ellipse(50,50,size,size);
// ellipse(100,50,size,size);
// ellipse(150,50,size,size);
//
// ellipse(50,100,size,size);
// ellipse(100,100,size,size);
// ellipse(150,100,size,size);
//
// ellipse(50,150,size,size);
// ellipse(100,150,size,size);
// ellipse(150,150,size,size);

//3rd for loop
// for (let x=50; x<=150; x+=50){
//   ellipse(x,50,size,size);
// }
// for (let x=50; x<=150; x+=50){
//   ellipse(x,100,size,size);
// }
// for (let x=50; x<=150; x+=50){
//   ellipse(x,150,size,size);
//}

  // for (let y=50; y<=150; y+=50){
  //   for (let x=50; x<=150; x+=50){
  //   ellipse(x,y,size,size);
  //   }
  // }
// //5th grid
// const step=20;
//   for (let y=0; y<=height; y+=step){
//     for (let x=0; x<=width; x+=step){
//     ellipse(x,y,size,size);
//     }
//   }

// //6th 乱数
// const step=20;
//   for (let y=0; y<=height; y+=step){
//     for (let x=0; x<=width; x+=step){
//     //const size=random(0,15);
//     let size;
//     if(random()<0.95){
//       size=random(0,10);
//     }else{
//       size=step;
//     }
//     ellipse(x,y,size,size);
//     }
//   }

// //7th RGBcolor
// const step=20;
//   for (let y=0; y<=height; y+=step){
//     for (let x=0; x<=width; x+=step){
//     const size=random(0,15);
//     // fill(random(255));
//     // fill(random(255),random(255),random(255));
//     // fill(random(200),random(255),random(100));
//     const r=random(255);
//     const g=random(r);
//     const b=random(g);
//     fill(r,g,b);
//     ellipse(x,y,size,size);
//     }
//   }

// //8th HSB color
// const step=20;
// colorMode(HSB,360,100,100);
//
//   for (let y=0; y<=height; y+=step){
//     for (let x=0; x<=width; x+=step){
//     const size=random(0,15);
//         const h=random(200,320);
//         const s=100;
//         // const b=100;
//         const b=size*5;
//     fill(h,s,b);
//     ellipse(x,y,size,size);
//     }
//   }

// //9th move
// colorMode(HSB,360,100,100,255);
// }
// function draw(){
//     background(0,20);
// const step=20;
// const size=5;
//
//   for (let y=0; y<=height; y+=step){
//     for (let x=0; x<=width; x+=step){
//     ellipse(x,y,size,size);
//     }
//   }
//   ellipse(mouseX,mouseY,20,20);

  //10th mouse
  colorMode(HSB,360,100,100,255);
  }
  function draw(){
      background(0);
  const step=20;

    for (let y=0; y<=height; y+=step){
      for (let x=0; x<=width; x+=step){
        const d=dist(x,y,mouseX,mouseY);
        // const size=d/10;
        const size=map(sin(d*0.05),-1,1,0,10);
        fill(map(sin(d*0.05),-1,1,60,320),100,100);
      ellipse(x,y,size,size);
      }
    }



}
