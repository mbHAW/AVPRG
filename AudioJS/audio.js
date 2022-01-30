// create Audiocontext
let context = new AudioContext();

// Declare empty songLength
let songLength;

// Define HTML Buttons and Sliders
const play = document.querySelector(".play");
const stop = document.querySelector(".stop");

const btnSong01 = document.querySelector(".song01");
const btnSong02 = document.querySelector(".song02");

//
const loopstartControlNew = document.querySelector(".loopstart-value-new")
const loopstartValueNew = document.querySelector(".rangeValueLoopStart");
loopstartControlNew.setAttribute("disabled", "disabled");

const loopendControlNew = document.querySelector(".loopend-value-new")
const loopendValueNew = document.querySelector(".rangeValueLoopEnd");
loopendControlNew.setAttribute("disabled", "disabled");

// Declare variable for coordinates from Python
var jsonCoord

// Filter - HTML Sliders and attributes to disable them when not playing
const slidersFrequency = document.querySelector(".frequency-value")
const slidersFrequencyValue = document.querySelector(".rangeValueFrequency")
slidersFrequency.setAttribute("disabled", "disabled");

const slidersDetune = document.querySelector(".detune-value")
const slidersDetuneValue = document.querySelector(".rangeValueDetune")
slidersDetune.setAttribute("disabled", "disabled");

const slidersQuality = document.querySelector(".quality-value")
const slidersQualityValue = document.querySelector(".rangeValueQuality")
slidersQuality.setAttribute("disabled", "disabled");
let filter = context.createBiquadFilter();

// Logic for choosing a song
var songChoice = "Song01.mp3";
function selectSong() {
  document.querySelector("#song01").addEventListener("click", function (e) {
    globalThis.songChoice = "Song01.mp3"
    console.log(songChoice);

  });

  document.querySelector("#song02").addEventListener("click", function (e) {
    globalThis.songChoice = "guitar.wav"
    console.log(songChoice);
  });
  return songChoice
}

// Logic for transfering audio data
function getData() {
  source = context.createBufferSource();
  request = new XMLHttpRequest();

  request.open("GET", selectSong(), true);

  request.responseType = "arraybuffer";

  request.onload = function () {
    let audioData = request.response;

    //Variables for the Thereminlike actions
    let gainNode = context.createGain();
    
    updateData = setInterval(() => {
      updatePage()
    }, 100);
    //Connect the buffer and nodes
    context.decodeAudioData(
      audioData,
      function (buffer) {
        let myBuffer = buffer;
        songLength = buffer.duration;
        source.buffer = myBuffer;
        source.connect(filter);
        filter.frequency.value = slidersFrequency.value;
        filter.detune.value = slidersDetune.value;
        filter.Q.value = slidersQuality.value;
        filter.connect(gainNode);
        gainNode.connect(context.destination);
        source.loop = true;

        // Set the length of the loop sliders to the length of the Audio data
        loopstartControlNew.setAttribute("max", Math.floor(songLength));
        loopendControlNew.setAttribute("max", Math.floor(songLength));
      },

      function (e) {
        "Error with decoding audio data" + e.error;
      }
    );

    // Function for the lollipop movement controls
    function updatePage(e) {
      gainNode.gain.value = newGain(jsonCoord.yCoord);
      source.playbackRate.value = newPlaybackRate(jsonCoord.xCoord);
      document.getElementById('rangeValueGain').innerHTML = ((Math.round(gainNode.gain.value*10000) / 100).toFixed(2)) + " %";
      document.getElementById('rangeValuePlayback').innerHTML = "x "+ (Math.round(source.playbackRate.value * 100) / 100).toFixed(2);
    }
  };

  request.send();
}

// wire up buttons to stop and play audio, and range slider control
play.onclick = function () {
  getData();
  source.start(0, 36, songLength);
  play.setAttribute("disabled", "disabled");
  loopstartControlNew.removeAttribute("disabled");
  loopendControlNew.removeAttribute("disabled");
  slidersFrequency.removeAttribute("disabled");
  slidersDetune.removeAttribute("disabled");
  slidersQuality.removeAttribute("disabled");
};

stop.onclick = function () {
  source.stop(0);
  play.removeAttribute("disabled");
  loopstartControlNew.setAttribute("disabled", "disabled");
  loopendControlNew.setAttribute("disabled", "disabled");
  slidersFrequency.setAttribute("disabled", "disabled");
  slidersDetune.setAttribute("disabled", "disabled");
  slidersQuality.setAttribute("disabled", "disabled");
};

// Set new values for various variables
loopstartControlNew.oninput = function () {
  source.loopStart = loopstartControlNew.value;
};

loopendControlNew.oninput = function () {
  source.loopEnd = loopendControlNew.value;
};

slidersFrequency.oninput = function () {
  filter.frequency.value = slidersFrequency.value;
};

slidersDetune.oninput = function () {
  filter.detune.value = slidersDetune.value;
};

slidersQuality.oninput = function () {
  filter.Q.value = slidersQuality.value;
};

// Function for logic to control gain with lollipop
var newGain = function (mouseYPosition) {
  var minGain = 0;
  var maxGain = 1;
  return 1 - (mouseYPosition / 720) * maxGain + minGain;
};

var newPlaybackRate = function (mouseXPosition) {
  var minPlayback = 0.25;
  var maxPlayback = 3;
  return (mouseXPosition / 1280) * maxPlayback + minPlayback
};

// Filter buttons functions
document.querySelector("#lowpass").addEventListener("click", function (e) {
  filter.type = "lowpass"
  console.log(filter.type)
});

document.querySelector("#highpass").addEventListener("click", function (e) {
  filter.type = "highpass"
  console.log(filter.type)
});

document.querySelector("#bandpass").addEventListener("click", function (e) {
  filter.type = "bandpass"
  console.log(filter.type)
});

document.querySelector("#allpass").addEventListener("click", function (e) {
  filter.type = "allpass"
  console.log(filter.type)
});

document.querySelector("#lowshelf").addEventListener("click", function (e) {
  filter.type = "lowshelf"
  console.log(filter.type)
});

document.querySelector("#highshelf").addEventListener("click", function (e) {
  filter.type = "highshelf"
  console.log(filter.type)
});

document.querySelector("#peaking").addEventListener("click", function (e) {
  filter.type = "peaking"
  console.log(filter.type)
});

document.querySelector("#notch").addEventListener("click", function (e) {
  filter.type = "notch"
  console.log(filter.type)
});

// Get coordinates from websocket
window.addEventListener("DOMContentLoaded", () => {
  const xData = document.querySelector("#coordsX")
  const yData = document.querySelector("#coordsY")

  const websocket = new WebSocket("ws://localhost:5678/");

  websocket.onmessage = ({ data }) => {
    console.log(data)
    jsonCoord = JSON.parse(data);
    xData.innerHTML = (Math.round(jsonCoord.xCoord*100) / 100).toFixed(2) + " out of 1280";
    yData.innerHTML = (((Math.round(jsonCoord.yCoord*100) / 100) * -1 + 720).toFixed(2))  + " out of 720"; 
  };

  setInterval(() => {
    websocket.send(JSON.stringify({ action: "plus" }));
  }, 5000);
});