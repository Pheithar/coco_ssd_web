const labels = ["unlabeled", "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "street sign", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "hat", "backpack", "umbrella", "shoe", "eye glasses", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "plate", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "mirror", "dining table", "window", "desk", "toilet", "door", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "blender", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"];

const colors = [];

labels.forEach((label, i) => {
  var randomColor = Math.floor(Math.random()*16777215).toString(16);
  colors.push(randomColor);
});

$("#loaded").css("display", "none");

var model = null;

function setModel(model) {
  this.model = model;
}

function getImageByName(name) {
  return "assets/images/" + name + ".jpg"
}
function getVideoByName(name) {
  return "assets/videos/" + name + ".mp4"
}

async function loadModel() {
  console.log("Loading Model...");
  const model = await cocoSsd.load();
  console.log("Model loaded");

  // const model = null;
  // throw Error("Test Error");
  return model;
}


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

function drawImage() {
  const img = $('.img')[0];
  const canvas = $('#canvas-image')[0];

  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);
}

function predictImage() {
  const img = $('.img')[0];
  const canvas = $('#canvas-image')[0];
  const ctx = canvas.getContext('2d');

  ctx.font = '12.5px Arial';

  model.detect(img).then((predictions) => {

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

      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("\tClass: " + prediction.class, prediction.bbox[0], prediction.bbox[1] - 20);
      ctx.fillText("\tProb.: " + prediction.score.toFixed(3), prediction.bbox[0], prediction.bbox[1] - 5);
    });
  });
}


$('.select-image').change(() => {
  $('.img').attr("src", getImageByName($('.select-image')[0].value)).load(() => {
    drawImage();
  });
});

$(".predict-image-button").click(() => {
  predictImage();
  predictVideo();
});

$(".upload-image-button").click(() => {
  const files = $(".input-image")[0].files

  if (files.length > 0) {
    const src = URL.createObjectURL(files[0])
    $('.img').attr("src", src).load(() => {
      drawImage();
    });
  }
});


var predict_video = false;
var webcam = false;



function drawVideo() {
  const video = $('.video')[0];
  const canvas = $('#canvas-video')[0];

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');

  ctx.drawImage(video, 0, 0);

  if (predict_video) {
    predictVideo()
  }

  if (!video.paused) {
    requestAnimationFrame(drawVideo);
  }

}

function predictVideo() {
  const video = $('.video')[0];
  const canvas = $('#canvas-video')[0];
  const ctx = canvas.getContext('2d');

  ctx.font = '12.5px Arial';

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

      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("\tClass: " + prediction.class, prediction.bbox[0], prediction.bbox[1] - 20);
      ctx.fillText("\tProb.: " + prediction.score.toFixed(3), prediction.bbox[0], prediction.bbox[1] - 5);
    });
  });
}



$(".video").on("loadeddata", () => {
  drawVideo();
});


$(".video").on("play", () => {
  drawVideo();
});

$(".play-button").click(() => {
  const video = $(".video")[0];
  if (video.paused) {
    video.play();
    $(".play-button").text("Stop")
  }
  else {
    video.pause();
    $(".play-button").text("Play")
  }
});

$('.select-video').change(() => {
  const src = $('.select-video')[0].value;
  $('.video').attr("src", getVideoByName(src)).load(() => {
    drawVideo();
  });
});

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

$(".upload-video-button").click(() => {
  const files = $(".input-video")[0].files

  if (files.length > 0) {
    const src = URL.createObjectURL(files[0])
    $('.video').attr("src", src).load(() => {
      drawVideo();
    });
  }
});

$(".webcam-button").click(() => {

  if (!webcam && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const video = $(".video")[0]
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {

      video.srcObject= stream;

      webcam = !webcam;
      $(".play-button").text("Play")
    }).catch((err) => {
      console.log(err);
      $(".no-webcam").css("display", "block");
    });
  }
  else if (webcam) {
    webcam = !webcam;
    $(".play-button").text("Play")

    const video = $(".video")[0]
    video.srcObject= null;

    $(".select-video").val('video1');
    $('.video').attr("src", getVideoByName("video1")).load(() => {
      drawVideo();
    });
  }
  else {
    $(".no-webcam").css("display", "block");
  }
});
