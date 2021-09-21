// sketch 1 on canvas 1 for web camera view


//GET Serial

let serialValue = 0;

if ("serial" in navigator) {
  console.log("serial available");
}

// const port = await navigator.serial.requestPort();

const connectButton = document.getElementById("getPortBtn");
connectButton.addEventListener('click', async () => {
  try {

    const port = await navigator.serial.requestPort();
    await port.open({
      baudRate: 115200 /* pick your baud rate */
    });


    while (port.readable) {

      class LineBreakTransformer {
        constructor() {
          this.container = '';
        }

        transform(chunk, controller) {
          this.container += chunk;
          const lines = this.container.split('\r\n');
          this.container = lines.pop();
          lines.forEach(line => controller.enqueue(line));
        }

        flush(controller) {
          controller.enqueue(this.container);
        }
      }


      const lineReader = port.readable
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new TransformStream(new LineBreakTransformer()))
        .getReader();

      try {
        while (true) {
          const {
            value,
            done
          } = await lineReader.read();
          if (done) {
            // |reader| has been canceled.
            break;
          }
          serialValue = Number(value);








        }
      } catch (error) {
        console.log("there is an error");
      } finally {
        lineReader.releaseLock();
      }



      //   const reader = port.readable.getReader();
      //   try {
      //     while (true) {
      //       const {
      //         value,
      //         done
      //       } = await reader.read();
      //       if (done) {
      //         // |reader| has been canceled.
      //         break;
      //       }
      //       console.log(value);
      //     }
      // } catch (error) {
      //   console.log("there is an error");
      // } finally {
      //   reader.releaseLock();
      // }
    }




  } catch (error) {
    console.log("serial port permission denied");
  }
});




console.log(serialValue);





const CamViewSketch = (sketch1) => {
  let capture;
  let globalStep = 0;
  let posesD = [];
  let minPoseConfidence = 0.01;
  let n = 1000;
  let x = [];
  let y = [];
  let dx = [];
  let dy = [];
  let latestData = 0;

  sketch1.setup = () => {
    sketch1.createCanvas(1024, 768);
    capture = sketch1.createCapture(sketch1.VIDEO);
    capture.size(1024, 768);
    capture.hide();


    // Create a new poseNet method
    const poseNet = ml5.poseNet(capture, modelLoaded);
    poseNet.on('pose', gotPoses);

    // Listen to new 'pose' events


  }



  function modelLoaded() {
    console.log('Model Loaded!');
  }

  function gotPoses(results) {
    // console.log(results);
    // posesD = results;

    for (let t = 0; t < results.length; t++) {
      posesD[t] = results[t].pose;
    }
  }




  function drawBody(pose,value) {
    let yFrequency = 900 - 400*value/2000;  // is the period, not really the frequency
    let yAmp = 10;
    let yNoiseAmp =  40*value/2000;
    let ddy = 0;
    let dEar2Ear = 0;
    let dWrist2Elbow = 0;
    let dShoulder2Shoulder = 0;
    let dHip2Knee = 0;

    // sketch1.ellipse(pose.nose.x, pose.nose.y, 30);

    //confidence level for specific joints
    // if (pose.nose.confidence >= minPoseConfidence && pose.rightAnkle.confidence >= minPoseConfidence) {
    dEar2Ear = sketch1.dist(pose.rightEar.x, pose.rightEar.y, pose.leftEar.x, pose.leftEar.y);
    dWrist2Elbow = sketch1.dist(pose.rightWrist.x, pose.rightWrist.y, pose.rightElbow.x, pose.rightElbow.y);
    dShoulder2Shoulder = sketch1.dist(pose.rightShoulder.x, pose.rightShoulder.y, pose.leftShoulder.x, pose.leftShoulder.y);
    dHip2Knee = sketch1.dist(pose.rightHip.x, pose.rightHip.y, pose.leftHip.x, pose.leftHip.y);



    for (let t = 0; t < n; t++) {

      // drawing of the head
      x[1] = sketch1.map(t, 0, n, pose.nose.x, 0.5 * (pose.leftShoulder.x + pose.rightShoulder.x)) + sketch1.cos(t * 0.05) * 0.5 * dEar2Ear * sketch1.map(t, 0, n, 1, 0.9);
      y[1] = sketch1.sin(t * 0.05) * 20 + sketch1.map(t, 0, n, pose.nose.y - 0.6 * dEar2Ear, pose.nose.y + 0.6 * dEar2Ear);
      dx[1] = x[1];
      ddy = sketch1.sin(t * globalStep / (sketch1.map(t, 0, n, 0.05, 10) * yFrequency)) * yAmp * sketch1.noise(yNoiseAmp * t);
      dy[1] = y[1] + ddy;
      sketch1.ellipse(dx[1], dy[1], 2, 2);




      // drawing of the torso
      x[2] = sketch1.map(t, 0, n, 0.5 * (pose.leftShoulder.x + pose.rightShoulder.x), 0.5 * (pose.leftHip.x + pose.rightHip.x)) + sketch1.cos(t * 0.05) * 0.5 * dShoulder2Shoulder * sketch1.map(t, 0, n, 1, 0.9);
      y[2] = sketch1.sin(t * 0.05) * 20 + sketch1.map(t, 0, n, 0.5 * (pose.leftShoulder.y + pose.rightShoulder.y), 0.5 * (pose.leftHip.y + pose.rightHip.y));
      dx[2] = x[2];
      ddy = sketch1.sin(t * globalStep / (sketch1.map(t, 0, n, 0.05, 10) * yFrequency)) * yAmp * sketch1.noise(yNoiseAmp * t);
      dy[2] = y[2] + ddy;
      sketch1.ellipse(dx[2], dy[2], 2, 2);

      //
      //
      // x[21] = sketch1.map(t, 0, n, pose.nose.x, pose.rightAnkle.x) + sketch1.cos(t * 0.05) * 60 * sketch1.map(t, 0, n, 1, 0.5);
      // y[21] = sketch1.sin(t * 0.05) * 20 + sketch1.map(t, 0, n, pose.nose.y, pose.rightAnkle.y);
      // dx[21] = x[21];
      // ddy = sketch1.sin(t * globalStep / (sketch1.map(t, 0, n, 0.05, 10) * yFrequency)) * yAmp * sketch1.noise(yNoiseAmp * t);
      // dy[21] = y[21] + ddy;
      // sketch1.ellipse(dx[21], dy[21], 1, 1);



    }
    // }
  }


  sketch1.draw = () => {
    sketch1.translate(1024, 0);
    sketch1.scale(-1, 1);
    sketch1.background(0);
    sketch1.stroke(255);
    sketch1.fill(255);



    // sketch1.image(capture, 0, 0, 1024, 768);

    globalStep++;

    // testAnimation();







    //the number of bodies to track
    for (let i = 0; i < Math.min(1, posesD.length); i++) {
      if (posesD[i].score >= minPoseConfidence) {
        drawBody(posesD[i],serialValue);
      }
    }
  }

}
let p5CamView = new p5(CamViewSketch, document.getElementById('webCamView'));



// sketch 2 on canvas 2 for EMG signal vis


const EMGVisSketch = (sketch2) => {
  var latestData = 0;
  var xPos = 0;
  sketch2.setup = () => {
    sketch2.createCanvas(1024, 768);
    sketch2.colorMode(sketch2.RGB, 255, 255, 255, 1);



  }



  function graphData(newData) {
    // map the range of the input to the window height:
    var yPos = sketch2.map(newData, 0, 4096, 0, 360);
    // draw the line in a pretty color:

    // sensor 1 green
    sketch2.stroke(74, 252, 208);
    sketch2.strokeWeight(2);
    sketch2.point(xPos, 360 - yPos);

    sketch2.stroke(74, 252, 208, 0.1);
    sketch2.line(xPos, 360, xPos, 360 - yPos);




    //sensor 2 blue green
    sketch2.stroke(35, 214, 253);
    sketch2.strokeWeight(2);
    sketch2.point(xPos, 360 - yPos - Math.random() * 50);

    sketch2.stroke(35, 214, 253, 0.1);
    sketch2.line(xPos, 360, xPos, 360 - yPos - Math.random() * 50);




    // at the edge of the screen, go back to the beginning:
    if (xPos >= 1024) {
      xPos = 0;
      // clear the screen by resetting the background:
      sketch2.background(255, 255, 255);
    } else {
      // increment the horizontal position for the next reading:
      xPos++;
    }
  }

  sketch2.draw = () => {
    graphData(serialValue);

  }


  // sketch2.draw = () => {
  //   sketch2.background(250, 182, 24);
  //   graphData(serialValue);
  //
  // }

};

let p5EMGVis = new p5(EMGVisSketch, document.getElementById('EMGProcessingVis'));




const sensorValueSketch = (sketch3) => {
  sketch3.setup = () => {
    sketch3.createCanvas(360, 320);
  }

  sketch3.draw = () => {

    sketch3.background(0);
    sketch3.stroke(255);
    sketch3.fill(255);

    sketch3.textSize(12);
    sketch3.text("sensor1: "+serialValue, 20, 20);
  }
}


let p5SensorValueDisplay = new p5(sensorValueSketch, document.getElementById('sensorValueDisplay'));
