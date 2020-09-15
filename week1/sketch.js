let classifier;
let video;
let resultsP;
let plants = [];
let mainResult;

function preload(){
  classifier = ml5.imageClassifier('MobileNet')
  video = createCapture(VIDEO);
  video.size(150, 100)
  //imageMode(CORNER);
  video.position(0,0)
}

function setup() {
  console.log(classifier);
  resultsP = createP('classify image...')
  classifier.classify(video, gotResults);
  createCanvas(600,500);
  background(0);
}

function gotResults(err, results){
  console.log(results);
  resultsP.html(results[0].label + ' ' + results[0].confidence)
  classifier.classify(video, gotResults)
  mainResult = results[0].label;
  //console.log(mainResult)
}
function draw() {
  //console.log(mainResult);
  background(133, 180, 214);
  for (let i = 0; i < plants.length; i++){
    plants[i].display();
    plants[i].move();
  };
  fill (79, 156, 96);
  noStroke();
  rect(0, 440, 600, 160);
}

function mousePressed(){
  plants.push(new Seed());
}

class Seed{
  
  constructor(){
    this.x = mouseX;
    this.y = mouseY;
        
    this.radius = 5;
    this.r = random(255);
    this.g = random(255);
    this.b = random(255);
    this.state = 0;
    this.height = random(100,400);
    this.stem = 440;
    this.coreRad = 1;
    this.width = 0;
    this.petalHeight = 0;
    this.angle = 0;
  }
  
  display(){
     if (this.state == 0){
       fill(0);
       ellipse(this.x, this.y, this.radius, this.radius);
     }
        
    if (this.state == 1){
      fill(0)
      ellipse(this.x, this.y, this.radius, this.radius);
    }
    if (this.state == 2){
      fill(0);
      ellipse(this.x, this.y, this.radius, this.radius);
    }
    if (this.state == 3){
      fill(0);
      ellipse(this.x, this.y, this.radius, this.radius);
      stroke(0);
      line(this.x, this.y, this.x, this.stem);
      noStroke();
      fill(this.r, this.g, this.b);
      ellipse(this.x, this.stem, this.coreRad, this.coreRad);
    }
    if (this.state ==4){
      fill(0);
      ellipse(this.x, this.y, this.radius, this.radius);
      stroke(0);
      line(this.x, this.y, this.x, this.stem);
      noStroke();
      fill(this.r, this.g, this.b);
      ellipse(this.x, this.stem, this.coreRad, this.coreRad);
      rectMode(CENTER);
      push()
      translate(this.x, this.stem);
      rotate(radians(this.angle));
      fill(this.r, this.g, this.b, 50);
      rect(0, 0, this.petalHeight, this.width)
      rect(0, 0, this.width, this.petalHeight)
      pop()
      rectMode(CORNER);
    }
  }
  
  move(){
    if (this.state == 0){
      if (this.y < 440){
        this.y++;
      }
      if (this.y >= 440){
        this.state = 1;
      }
    }
    //if (mainResult == "spotlight, spot"){  
      if (this.state == 1){
          if (this.radius < 30){
            this.radius += .2
          }
          if (this.radius >= 30){
            this.state = 2;
          }
      }
        
      if (this.state == 2){
          stroke(2);
          line(this.x, this.y, this.x, this.stem)
          if (this.stem > this.height){
            if (mainResult == 'spotlight, spot'){
              this.stem -= 1;
            }
          }
          else{
            this.state = 3;
          }
      }
        
      if (this.state == 3){
          if (this.coreRad < 40){
            if (mainResult == 'spotlight, spot'){
              this.coreRad += .5;
            }
          }
          else{
            this.state = 4;
          }
      }
        
      if (this.state == 4){
          if (this.petalHeight < 40){
            if (mainResult == 'spotlight, spot'){
              this.petalHeight++
            }
          }
          if (this.width < 100){
            this.width++
          }
        if (mainResult == 'spotlight, spot'){
          this.angle++
        }
      }
    }
  //}
}