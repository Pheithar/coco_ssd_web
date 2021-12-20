// All the labels that the model can predict. This is just used fr setting the colors
const labels = ["unlabeled", "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "street sign", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "hat", "backpack", "umbrella", "shoe", "eye glasses", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "plate", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "mirror", "dining table", "window", "desk", "toilet", "door", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "blender", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"];

const colors = [];

// Each time, the set of colors are defined randomly and different for each class
labels.forEach((label, i) => {
  var randomColor = Math.floor(Math.random()*16777215).toString(16);
  colors.push(randomColor);
});

// Start with it hidden
$("#loaded").css("display", "none");



// Define the model
var model = null;

// Sets the global variable 'model' to a value
function setModel(model) {
  this.model = model;
}

// Functions for getting the direction of a image/video given the name
// that is in HTNL
function getImageByName(name) {
  return "assets/images/" + name + ".jpg"
}
function getVideoByName(name) {
  return "assets/videos/" + name + ".mp4"
}


// Function for loading the model
// Could have not use it as cocoSsd already has load, but allows debugging and
// more control over the workflow. On the other hand, as it has an await, makes
// the webpage unsuable (cannot click links nor do any action) while is loading
async function loadModel() {
  console.log("Loading Model...");
  const model = await cocoSsd.load();
  console.log("Model loaded");

  // test if error
  // throw Error("Test Error");
  return model;
}

// then and catch of the loadModel()
loadModel().then((model) => {
  // Show content of the web once the model is loaded
  $("#loaded").css("display", "block")
  $("#not-loaded").css("display", "none")

  // Save the model value so it can be used in other functions
  setModel(model);

  // Set the default selection and draw image for the default image
  $(".select-image").val('image1');
  $('.img').attr("src", getImageByName("image1")).load(() => {
    drawImage();
  });

  // Set the default selection and draw video for the default video
  $(".select-video").val('video1');
  $('.video').attr("src", getVideoByName("video1")).load(() => {
    drawVideo();
  });

}).catch((err) => {
  // Show the user that there has been an error
  console.log(err);
  $("#not-loaded").text("Model could not be loaded, try reloading")
  return null;
});

// Function for drawing the image in the canvas
function drawImage() {
  const img = $('.img')[0];
  const canvas = $('#canvas-image')[0];

  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);
}

// Function for drawingthe prediction boxes in the canvas
function predictImage() {
  const img = $('.img')[0];
  const canvas = $('#canvas-image')[0];
  const ctx = canvas.getContext('2d');

  ctx.font = "bold 12.5px Arial";

  // Predict using cocoSsd
  model.detect(img).then((predictions) => {
    // Loop through all the predictions
    predictions.forEach((prediction, i) => {
      const index = labels.indexOf(prediction.class);
      const color = "#" + colors[index];

      ctx.beginPath();
      ctx.rect(...prediction.bbox);
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();

      ctx.beginPath();
      const test = [prediction.bbox[0], prediction.bbox[1]-35, prediction.bbox[2], 35]
      ctx.strokeStyle = color;
      ctx.rect(...test);
      ctx.stroke();

      ctx.fillStyle = "#BB86FC";
      ctx.fillText("\tClass: " + prediction.class, prediction.bbox[0], prediction.bbox[1] - 20);
      ctx.fillText("\tProb.: " + prediction.score.toFixed(3), prediction.bbox[0], prediction.bbox[1] - 5);
    });
  });
}

// Change the current image when the user change it
$('.select-image').change(() => {
  $('.img').attr("src", getImageByName($('.select-image')[0].value)).load(() => {
    drawImage();
  });
});

// Call predictImage when the button 'predict' is clicked
$(".predict-image-button").click(() => {
  predictImage();
});

// When clicked 'upload image', check if there is a file (it only accepts images)
// and load it
$(".upload-image-button").click(() => {
  const files = $(".input-image")[0].files

  if (files.length > 0) {
    const src = URL.createObjectURL(files[0])
    $('.img').attr("src", src).load(() => {
      drawImage();
    });
  }
});


// Helping variables for checking if the video is in prediction mode or not,
// and check if the webcam is on or not.
var predict_video = false;
var webcam = false;

// Variables for the source for the play button
var play_src = "assets/icons/play-button.png"
var stop_src = "assets/icons/stop-button.png"


// Same as drawImage, but with video. Draw video in the canvas
function drawVideo() {
  const video = $('.video')[0];
  const canvas = $('#canvas-video')[0];

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');

  ctx.drawImage(video, 0, 0);

  // If is in prediction mode, call the prediction
  if (predict_video) {
    predictVideo()
  }

  // Control the image that is shown in the 'play button', and
  // call the function for the next fram, as it needs to be reloaded
  // if the video is playing
  if (!video.paused) {
    $(".play-stop-image").attr("src", stop_src)
    requestAnimationFrame(drawVideo);
  }
  else {
    $(".play-stop-image").attr("src", play_src)
  }

}

// Similar to predict image, but with video. Do the prediction of the video
// using cocoSsd
function predictVideo() {
  const video = $('.video')[0];
  const canvas = $('#canvas-video')[0];
  const ctx = canvas.getContext('2d');

  ctx.font = "bold 12.5px Arial";

  model.detect(video).then((predictions) => {

    predictions.forEach((prediction, i) => {
      const index = labels.indexOf(prediction.class);
      const color = "#" + colors[index];

      ctx.beginPath();
      ctx.rect(...prediction.bbox);
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();

      ctx.beginPath();
      const test = [prediction.bbox[0], prediction.bbox[1]-35, prediction.bbox[2], 35]
      ctx.strokeStyle = color;
      ctx.rect(...test);
      ctx.stroke();

      ctx.fillStyle = "#BB86FC";
      ctx.fillText("\tClass: " + prediction.class, prediction.bbox[0], prediction.bbox[1] - 20);
      ctx.fillText("\tProb.: " + prediction.score.toFixed(3), prediction.bbox[0], prediction.bbox[1] - 5);
    });
  });
}


// Wait for the video to load before calling drawVideo
$(".video").on("loadeddata", () => {
  drawVideo();
});

// When the play on the video ois call, draw the video in the canvas
$(".video").on("play", () => {
  drawVideo();
});

// Change between play and stop when the button 'play/stop' is clicked
$(".play-button").click(() => {
  const video = $(".video")[0];
  if (video.paused) {
    video.play();
  }
  else {
    video.pause();
  }
});

// Change between different videos from the selector
$('.select-video').change(() => {
  const src = $('.select-video')[0].value;
  $('.video').attr("src", getVideoByName(src)).load(() => {
    drawVideo();
  });
});

// Activate/deactivate prediction mode when the button
// 'prediction on/off' is clicked
$(".predict-video-button").click(() => {
  predict_video = !predict_video;

  drawVideo();

  if (predict_video) {
    $(".predict-video-button").text("Prediction On");
  }
  else {
    $(".predict-video-button").text("Prediction Off");
  }
});

// Upload a video from the input. It only accepts video format
$(".upload-video-button").click(() => {
  const files = $(".input-video")[0].files

  if (files.length > 0) {
    const src = URL.createObjectURL(files[0])
    $('.video').attr("src", src).load(() => {
      drawVideo();
    });
  }
});


// If possible, activate the webcam of the user and use it as video
$(".webcam-button").click(() => {

  if (!webcam && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const video = $(".video")[0]
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {

      video.srcObject= stream;

      webcam = !webcam;
    }).catch((err) => {
      // Catch any possible error and show that there has been an
      // error to the user
      console.log(err);
      $(".no-webcam").css("display", "block");
    });
  }
  else if (webcam) {
    webcam = !webcam;

    const video = $(".video")[0]
    video.srcObject= null;

    // Select default video on webcam off
    $(".select-video").val('video1');
    $('.video').attr("src", getVideoByName("video1")).load(() => {
      drawVideo();
    });
  }
  else {
    // show that there has been an  error to the user
    $(".no-webcam").css("display", "block");
  }
});
