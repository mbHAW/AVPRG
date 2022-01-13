// let context = new (window.AudioContext || window.webkitAudioContext)();
let context = new AudioContext();
// let sound = new Audio("guitar.wav");
//
let songLength;
//
const pre = document.querySelector("pre");
const myScript = document.querySelector("script");
const play = document.querySelector(".play");
const stop = document.querySelector(".stop");
//
const playbackControl = document.querySelector(".playback-rate-control");
const playbackValue = document.querySelector(".playback-rate-value");
playbackControl.setAttribute("disabled", "disabled");
//
const loopstartControl = document.querySelector(".loopstart-control");
const loopstartValue = document.querySelector(".loopstart-value");
loopstartControl.setAttribute("disabled", "disabled"); //Having issues when enabling, context needs to be called inside the getData() function but
const loopendControl = document.querySelector(".loopend-control"); //that also means that other functions cant access context unless getData() was already called
const loopendValue = document.querySelector(".loopend-value");
loopendControl.setAttribute("disabled", "disabled");
//
// const songstartControl = document.querySelector('.songstart-control');
// const songstartValue = document.querySelector('.songstart-value');
// songstartControl.setAttribute('enabled', 'enabled');

//
let myAudio = document.querySelector("audio");

// Convolver
let convolver = context.createConvolver();

// Filter
let slidersFilt = document.getElementsByClassName("slider"),
  selectListFilter = document.querySelector("#selectListFilter"),
  filter = context.createBiquadFilter();

function getOption() {
  console.log(document.querySelector("#songs option:checked").value);
  var songChoice = document.querySelector("#songs option:checked").value;
  return songChoice;
}

// use XHR to load an audio track, and
// decodeAudioData to decode it and stick it in a buffer.
// Then put the buffer into the source

function getData() {
  source = context.createBufferSource();
  request = new XMLHttpRequest();

  request.open("GET", getOption(), true);

  request.responseType = "arraybuffer";

  request.onload = function () {
    let audioData = request.response;

    //Variables for the Thereminlike actions
    let gainNode = context.createGain();
    let delay = context.createDelay(4.0);
    var corX;
    var corY;
    var windowWidth = window.innerWidth;
    var windowHeigth = window.innerHeight;

    // Get new mouse pointer coordinates when mouse is moved
    // then set new gain and frequency values
    document.onmousemove = updatePage;

    //Connect the buffer and nodes
    context.decodeAudioData(
      audioData,
      function (buffer) {
        myBuffer = buffer;
        songLength = buffer.duration;
        source.buffer = myBuffer;
        source.playbackRate.value = playbackControl.value;
        source.connect(delay);
        delay.connect(convolver);
        convolver.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);
        source.loop = true;

        //Set the length of the loop sliders to the length of the Audio data
        loopstartControl.setAttribute("max", Math.floor(songLength));
        loopendControl.setAttribute("max", Math.floor(songLength));

        //Set the length of the songstart slider to match the length of the Audio data
        //songstartControl.setAttribute('max', Math.floor(songLength))
      },

      function (e) {
        "Error with decoding audio data" + e.error;
      }
    );

    function updatePage(e) {
      corX = window.Event ? e.pageX : clientX + 10000;
      corY = window.Event ? e.pageY : null; // clientX + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

      gainNode.gain.value = newGain(corY);
      filter.frequency.value = corX;
    }
  };

  request.send();
}

// wire up buttons to stop and play audio, and range slider control

play.onclick = function () {
  getData();

  source.start(0, 36, songLength);  //source.start() not working accordingly, seems to be an issue with Web Audio

  play.setAttribute("disabled", "disabled");
  playbackControl.removeAttribute("disabled");
  loopstartControl.removeAttribute("disabled");
  loopendControl.removeAttribute("disabled");
  //songstartControl.removeAttribute('disabled')
  loadInpulseResponse("Room");

  for (var i = 0; i < slidersFilt.length; i++) {
    slidersFilt[i].removeAttribute("disabled", "disabled");
  }
};

stop.onclick = function () {
  source.stop(0);
  play.removeAttribute("disabled");
  playbackControl.setAttribute("disabled", "disabled");
  loopstartControl.setAttribute("disabled", "disabled");
  loopendControl.setAttribute("disabled", "disabled");

  for (var i = 0; i < slidersFilt.length; i++) {
    slidersFilt[i].setAttribute("disabled", "disabled");
  }
};

playbackControl.oninput = function () {
  source.playbackRate.value = playbackControl.value;
  playbackValue.innerHTML = playbackControl.value;
};

loopstartControl.oninput = function () {
  source.loopStart = loopstartControl.value;
  loopstartValue.innerHTML = loopstartControl.value;
};

loopendControl.oninput = function () {
  source.loopEnd = loopendControl.value;
  loopendValue.innerHTML = loopendControl.value;
};

// songstartControl.oninput = function() {
//   source.start(songstartControl.value);
//   songstartValue.innerHTML = songstartControl.value;
// }

// dump script to pre element

//   pre.innerHTML = myScript.innerHTML;

var newFrequency = function (mouseXPosition) {
  var minFrequency = 20;
  var maxFrequency = 2000;
  return (mouseXPosition / window.innerWidth) * maxFrequency + minFrequency;
};

var newGain = function (mouseYPosition) {
  var minGain = 0;
  var maxGain = 1;
  return 1 - (mouseYPosition / window.innerHeight) * maxGain + minGain;
};

// Reverb
document.querySelector("#selectList").addEventListener("change", function (e) {
  let name = e.target.options[e.target.selectedIndex].value;
  loadInpulseResponse(name);
});

//Convolver
function loadInpulseResponse(name) {
  fetch("impulseResponses/" + name + ".wav")
    .then((response) => response.arrayBuffer())
    .then((undecodedAudio) => context.decodeAudioData(undecodedAudio))
    .then((audioBuffer) => {
      // if (convolver) {convolver.disconnect();}

      convolver = context.createConvolver();
      convolver.buffer = audioBuffer;
      convolver.normalize = true;
    })
    .catch(console.error);
}

// Filter
for (var i = 0; i < slidersFilt.length; i++) {
  slidersFilt[i].addEventListener("mousemove", changeParameter, false);
  slidersFilt[i].setAttribute("disabled", "disabled");
}

selectListFilter.addEventListener("change", function (e) {
  filter.type = selectListFilter.options[selectListFilter.selectedIndex].value;
});

function changeParameter() {
  switch (this.id) {
    // case "frequencySlider":
    //     //filter.frequency.value = (this.value);
    //     //filter.frequency.value = (this.value);
    //     document.querySelector("#frequencyOutput").innerHTML = (this.value) + " Hz";
    //     break;
    case "detuneSlider":
      filter.detune.value = this.value;
      document.querySelector("#detuneOutput").innerHTML = this.value + " cents";
      break;
    case "qSlider":
      filter.Q.value = this.value;
      document.querySelector("#qOutput").innerHTML = this.value + " ";
      break;
  }
}
