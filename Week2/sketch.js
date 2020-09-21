let classifier;

//needs more training. F and Am are too similar and its strugglin
let modelURL = 'https://teachablemachine.withgoogle.com/models/cc_wj2xvr/';

let resultsDiv;
let resultID;

var d = new Date();
var current = d.getTime();
var initial = d.getTime();

//Vehicles and Flowfield
//Vehicles:
let notes = [];
//Flowfield
let flowfield

function preload(){
  classifier = ml5.soundClassifier(modelURL + 'model.json');
}

function setup() {
  //make Canvas
  createCanvas(640, 520);
  
  //make flowfield
  flowfield = new Flowfield(30);
  
  //Results under the canvas
  resultsDiv = createElement('h1', '...');
  
  //classify audio - Do not need to add an argument, because ml5.js will take it from your mic by default
  classifyAudio();
}

function draw() {
  background(51,80);
  
  //flowfield.display();
  flowfield.rotate();
  
  current = new Date().getTime();
  if ((current-initial) > 250){
    initial = new Date().getTime();
    let n = new Note(random(width), random(height), resultID);
    notes.push(n);
  }
  
  for (let i = 0; i < notes.length; i++){
    notes[i].flow(flowfield);
    notes[i].run();
    notes[i].separation();
    //if opacity == zero, remove from array
    if (notes[i].opacity <= 0){
      notes.splice(i, 1);
    }
  }
}


//Classifier Functions
function classifyAudio(){
  classifier.classify(gotResult);
  //classifyAudio();
};

function gotResult(err, results){
  if (err) console.log(err);
  if (results){
    console.log(results);
    resultsDiv.html('I hear ' + results[0].label);
    resultID = results[0].label;
    console.log(resultID);
    return resultID;
  };
};

class Note{
  
  constructor(x,y, resultID){
    this.pos = createVector(x,y);
    this.prev = createVector(x,y);
    this.vel = createVector(random(-0.5, 0.5),random(-0.5, 0.5));
    this.acc = createVector();
    this.maxSpeed = 2.5;
    this.maxForce = .4;
    this.r = 5;
    this.color = color(0);
    this.opacity = 255;
    if (resultID == 'Am'){
      this.color = color(255,255,176, 255);
    }
    else if (resultID == 'G'){
      this.color = color(154,206,223, 255);
    }
    else if (resultID == 'F'){
      this.color = color(193,179,215, 255);
    }
    else if (resultID == 'C'){
      this.color = color(251,182,209, 255);
    }
    else if (resultID == 'E7'){
      this.color = color(253,202,162, 255);
    }
  }
  
  applyForce(force){
    this.acc.add(force)
  }
  
  flow(f){
    //What vector force is at this point?
    let desired = f.lookup(this.pos);
    //scale it up to the maxSpeed
    desired.mult(this.maxSpeed);
    //Steering is the desired - the current velocity
    let steering = p5.Vector.sub(desired, this.vel);
    //limit to the max force
    steering.limit(this.maxForce);
    this.applyForce(steering)
  }
    
  update(){
    //normal updating
    this.vel.add(this.acc);
    //limit speed tho
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0,0);
  }
    
  display(){
    strokeWeight(1.5)
    noFill()
    this.color = color(map(this.color._array[0], 0, 1, 0, 255), map(this.color._array[1], 0, 1, 0, 255), map(this.color._array[2], 0, 1, 0, 255), this.opacity); 
    stroke(this.color);
    ellipse(this.pos.x, this.pos.y, 10, 10);
    this.opacity-=0.5;
  }
    
  wrapping(){
    //wraps the particles around the field
    if (this.pos.x < -this.r){
        this.pos.x = width+this.r;
    } 
    if (this.pos.y < -this.r){
        this.pos.y = height+this.r;
    } 
    if (this.pos.x > width+this.r){
        this.pos.x = -this.r;
    } 
    if (this.pos.y > height+this.r){
        this.pos.y = -this.r;
    }
  }
    
  separation(){
    //Separation Behavior
    let desiredSeparation = 3;
    let sum = createVector(0,0);
    let count = 0;
        
    //for every point in this array, check if theyre too close
    for (let i = 0; i < notes.length; i++){
        let d = p5.Vector.dist(this.pos, notes[i].pos);
        //if distance is too great
        if ((d > 0) && (d < desiredSeparation)){
          //calculate a vector pointing away from the neighbor
          let diff = p5.Vector.sub(this.pos, notes[i].pos);
          diff.normalize();
          diff.div(d); //weight by distance
          sum.add(diff);
          count++ //keep track of how many
        }
    }
        
      //average, Divide by count
      if (count > 0){
        sum.div(count);
        //scale the bector to max speed
        sum.normalize();
        sum.mult(this.maxSpeed);
        //Reynolds steering = desired - velocity
        let steer = p5.Vector.sub(sum, this.vel);
        steer.limit(this.maxforce);
        this.applyForce(steer);
      }
    }
    
    //run
    run(){
      this.update();
      this.wrapping();
      this.display();
    }
}

class Flowfield{
  
  constructor(r){
    //size of each cell in flowfield
    this.resolution = r;
    this.cols = width / this.resolution;
    this.rows = height / this.resolution;
    
    this.field = this.make2Darray(this.cols);
    
    this.init();
  }
  
  make2Darray(n){
    //pass function n columns
    let array = [];
    
    //for i in number of columns, create an empty array. This gives us 2 dimensions (arrays are 1D).
    for (let i = 0; i < n; i++){
      array[i] = []
    }
    
    return array
  }
  
  init(){
    noiseSeed(Math.floor(random(1000)));
    let xoff = 0;
    //for i in columns, and then j in rows, create a vector that along cos and sin of a perlin theta
    for (let i = 0; i < this.cols; i++){
      let yoff = 0;
      for (let j = 0; j < this.rows; j++){
        let theta = map(noise(xoff,yoff), 0, 1, 0, TWO_PI);
        this.field[i][j] = createVector(cos(theta), sin(theta));
        yoff += 0.1;
      }
      xoff += 0.1
    }
  }
  
  display(){
    //for i in columns, and j in rows, draw the vector that is in [i][j]
    //console.log('running');
    for (let i = 0; i < this.cols; i++){
      for (let j = 0; j < this.rows; j++){
        this.drawVector(this.field[i][j], i * this.resolution, j * this.resolution,this.resolution - 2);
      }
    }
  }
  
  rotate(){
    //for every vector in col row, rotate .005
    for (let i = 0; i < this.cols; i++){
      for (let j = 0; j < this.rows; j++){
        this.field[i][j].rotate(0.005);
      }
    }
  }
  
  lookup(lookup){
    //identify a specific vector
    let column = Math.floor(constrain(lookup.x / this.resolution, 0, this.cols - 1));
    let row = Math.floor(constrain(lookup.y / this.resolution, 0, this.rows - 1));
    return this.field[column][row].copy();
  }
  
  drawVector(v,x,y,scayl){
    //draw a line as the vector
    push();
    let arrowsize = 4;
    translate(x,y);
    stroke(255, 80);
    rotate(v.heading());
    let len = v.mag() * scayl;
    line(0,0,len,0);
    pop();
  }
}