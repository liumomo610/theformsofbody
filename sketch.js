// sketch 1 on canvas 1 for web camera view

const CamViewSketch = (sketch1) => {
  let capture;
  let globalStep = 0;
  let posesD = [];
  let minPoseConfidence = 0.01;
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
    console.log(results);
    posesD = results;

    for (let t = 0; t < results.length; t++) {
      posesD[t] = results[t].pose;
    }
  }


  function drawBody(sketch1, pose) {
    sketch1.fill(255, 0, 0);
    //let xoff = 0;

    sketch1.ellipse(pose.nose.x, pose.nose.y, 30);
    sketch1.ellipse(pose.nose.x, pose.nose.y, 30);
    let n = 3000;
    let x = [];
    let y = [];
    let dx = [];
    let dy = [];
    for (let t = 0; t < n; t++) {

      //from nose to right ankle
      if (pose.nose.confidence >= minPoseConfidence && pose.rightAnkle.confidence >= minPoseConfidence) {
        x[0] = sketch1.cos(t * 0.05) * 60 * sketch1.map(t, 0, n, 1, 0.3) + sketch1.map(t, 0, n, pose.nose.x, pose.rightAnkle.x);
        y[0] = sketch1.sin(t * 0.05) * 20 + sketch1.map(t, 0, n, pose.nose.y, pose.rightAnkle.y);
        sketch1.fill(255);
        dx[0] = x[0] + sketch1.noise(0.05 * globalStep + sketch1.sin(0.05 * t)) * 30;
        dy[0] = y[0] + sketch1.noise(0.05 * globalStep + sketch1.sin(0.05 * t)) * 30;
        sketch1.ellipse(dx[0], dy[0], 1, 1);
      }

      if (pose.nose.confidence >= minPoseConfidence && pose.leftAnkle.confidence >= minPoseConfidence) {
        //from nose to left ankle
        x[1] = sketch1.cos(t * 0.05) * 60 * sketch1.map(t, 0, n, 1, 0.3) + sketch1.map(t, 0, n, pose.nose.x, pose.leftAnkle.x);
        y[1] = sketch1.sin(t * 0.05) * 20 + sketch1.map(t, 0, n, pose.nose.y, pose.leftAnkle.y);
        sketch1.fill(255);
        dx[1] = x[1] + sketch1.noise(0.05 * globalStep + sketch1.sin(0.05 * t)) * 15;
        dy[1] = y[1] + sketch1.noise(0.05 * globalStep + sketch1.sin(0.05 * t)) * 15;
        sketch1.ellipse(dx[1], dy[1], 1, 1);
      }





    }
  }


  sketch1.draw = () => {
    sketch1.translate(1024, 0);
    sketch1.scale(-1, 1);
    sketch1.background(0);
    sketch1.stroke(255);
    globalStep++;

    for (let t = 0; t < Math.min(2, posesD.length); t++) {
      if (posesD[t].score >= minPoseConfidence) {
        drawBody(sketch1, posesD[t]);
      }
    }

  }

};

let p5CamView = new p5(CamViewSketch, document.getElementById('webCamView'));



// sketch 2 on canvas 2 for EMG signal vis


const EMGVisSketch = (sketch2) => {
  var serialValue = 0;
  var latestData = 0;
  var xPos = 0;
  sketch2.setup = () => {
    sketch2.createCanvas(1024, 768);


  }

  if ("serial" in navigator) {
    console.log("serial available");

  }

  // const port = await navigator.serial.requestPort();

  const connectButton = document.getElementById("getPortBtn");
  connectButton.addEventListener('click', async () => {
    try {

      console.log(connectButton);
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

  function graphData(newData) {
    // map the range of the input to the window height:
    var yPos = sketch2.map(newData, 0, 5000, 0, 360);
    // draw the line in a pretty color:
    sketch2.stroke(211, 212, 212);
    sketch2.line(xPos, 360, xPos, 360 - yPos);
    // at the edge of the screen, go back to the beginning:
    if (xPos >= 1280) {
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
