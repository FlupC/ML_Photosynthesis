let faceAPI;
let video;
let detections;
let num = 0;

//by default, all options are true
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
};

function setup() {
  var cnv = createCanvas(360, 270);
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  cnv.position(x, y);
  //frameRate(30);
  if (displayWidth < 800) {
    video = createCapture({
      audio: false,
      video: {
        facingMode: {
          exact: "environment"
        }
      }
    });
  } else {
    video = createCapture(VIDEO);
  }
  video.size(width, height);
  video.hide();
  faceAPI = ml5.faceApi(video, detectionOptions, modelReady);
}

function modelReady() {
  console.log("ready!");
  console.log(faceAPI);
  faceAPI.detect(gotResults);
}

function gotResults(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  detections = result;

  //background(0);
  image(video, 0, 0, width, height);
  fill(255)
  noStroke()
  let r = 40
  ellipse(width-r, height-r, r, r);
  noFill();
  stroke(120);
  ellipse(width-r, height-r, r-5, r-5)
  console.log(width-r, height-r, mouseX, mouseY);
  if (dist(mouseX, mouseY, width-r,height-r) < r){
    console.log('hi');
    if (mouseIsPressed){
      savePhoto();
    }
  }
  // button = createButton('Save Photo');
  // button.position(width, height);
  // button.mousePressed(savePhoto);
  if (detections) {
    if (detections.length > 0) {
      //drawBox(detections);
      drawLandmarks(detections);
    }
  }
  faceAPI.detect(gotResults);
}

function drawLandmarks(detections) {
  noFill();
  stroke(161, 95, 251);
  strokeWeight(2);
  for (let i = 0; i < detections.length; i++) {
    const mouth = detections[i].parts.mouth;
    const nose = detections[i].parts.nose;
    const leftEye = detections[i].parts.leftEye;
    const rightEye = detections[i].parts.rightEye;
    const rightEyeBrow = detections[i].parts.rightEyeBrow;
    const leftEyeBrow = detections[i].parts.leftEyeBrow;

    drawPart(mouth, true);
    drawPart(nose, false);
    drawPart(leftEye, true);
    drawPart(leftEyeBrow, false);
    drawPart(rightEye, true);
    drawPart(rightEyeBrow, false);
  }
}

function drawPart(feature, closed) {
  beginShape();
  for (let i = 0; i < feature.length; i += 1) {
    const x = feature[i]._x;
    const y = feature[i]._y;
    vertex(x, y);
  }

  if (closed === true) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

function savePhoto() {
  save("faceFound" + num + ".png");
  num++
  return false
}