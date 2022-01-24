// let context = new (window.AudioContext || window.webkitAudioContext)();
let context = new AudioContext();
//
let songLength;
//
const pre = document.querySelector("pre");
const myScript = document.querySelector("script");
const play = document.querySelector(".play");
const stop = document.querySelector(".stop");

const btnSong01 = document.querySelector(".song01");
const btnSong02 = document.querySelector(".song02");
//
const playbackControlNew = document.querySelector(".playback-rate-control-new")
const playbackValueNew = document.querySelector(".rangeValuePlayback");
playbackControlNew.setAttribute("disabled", "disabled");
//
const loopstartControlNew = document.querySelector(".loopstart-value-new")
const loopstartValueNew = document.querySelector(".rangeValueLoopStart");
loopstartControlNew.setAttribute("disabled", "disabled");

const loopendControlNew = document.querySelector(".loopend-value-new")
const loopendValueNew = document.querySelector(".rangeValueLoopEnd");
loopendControlNew.setAttribute("disabled", "disabled");

//
var jsonCoord

//
let myAudio = document.querySelector("audio");

// Convolver
let convolver = context.createConvolver();

// Filter
const slidersDetune = document.querySelector(".detune-value")
const slidersDetuneValue = document.querySelector(".rangeValueDetune")
slidersDetune.setAttribute("disabled", "disabled");

const slidersQuality = document.querySelector(".quality-value")
const slidersQualityValue = document.querySelector(".rangeValueQuality")
slidersQuality.setAttribute("disabled", "disabled");

let slidersFilt = document.getElementsByClassName("slider"),
  selectListFilter = document.querySelector("#selectListFilter"),
  // selectListFilter = document.querySelector("#selectListFilter"),
  filter = context.createBiquadFilter();

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

  // if (document.querySelector("#song01").clicked == true)


// use XHR to load an audio track, and
// decodeAudioData to decode it and stick it in a buffer.
// Then put the buffer into the source

function getData() {

  source = context.createBufferSource();
  request = new XMLHttpRequest();

  request.open("GET", selectSong(), true);

  request.responseType = "arraybuffer";

  request.onload = function () {
    let audioData = request.response;

    //Variables for the Thereminlike actions
    let gainNode = context.createGain();
    let delay = context.createDelay(4.0);
    // var corX;
    // var corY;
    // var windowWidth = window.innerWidth;
    // var windowHeigth = window.innerHeight;

    // Get new mouse pointer coordinates when mouse is moved
    // then set new gain and frequency values
    //document.onmousemove = updatePage;
  
    
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
        source.playbackRate.value = playbackControlNew.value;
        source.connect(delay);
        delay.connect(convolver);
        filter.detune.value = slidersDetune.value;
        filter.Q.value = slidersQuality.value;
        convolver.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);
        source.loop = true;

        //Set the length of the loop sliders to the length of the Audio data
        // loopstartControlNew.setAttribute("max", Math.floor(songLength));
        // loopendControlNew.setAttribute("max", Math.floor(songLength));

      },

      function (e) {
        "Error with decoding audio data" + e.error;
      }
    );

    function updatePage(e) {
      //corX = window.Event ? e.pageX : clientX + 10000;
      //corY = window.Event ? e.pageY : null; // clientX + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

      //gainNode.gain.value = newGain(corY);
      //filter.frequency.value = corX;
      
      gainNode.gain.value = newGain(jsonCoord.yCoord);
      filter.frequency.value = newFrequency(jsonCoord.xCoord);
    }
  };

  request.send();
}

// wire up buttons to stop and play audio, and range slider control
loadInpulseResponse("room")
play.onclick = function () {
  getData();

  source.start(0, 36, songLength);  //source.start() not working accordingly, seems to be an issue with Web Audio

  play.setAttribute("disabled", "disabled");
  playbackControlNew.removeAttribute("disabled");
  loopstartControlNew.removeAttribute("disabled");
  loopendControlNew.removeAttribute("disabled");
  slidersDetune.removeAttribute("disabled");
  slidersQuality.removeAttribute("disabled");
  //songstartControl.removeAttribute('disabled')
  // reverb_Buttons();

  // for (var i = 0; i < slidersFilt.length; i++) {
  //   slidersFilt[i].removeAttribute("disabled", "disabled");
  // }
};

stop.onclick = function () {
  source.stop(0);
  play.removeAttribute("disabled");
  playbackControlNew.setAttribute("disabled", "disabled");
  loopstartControlNew.setAttribute("disabled", "disabled");
  loopendControlNew.setAttribute("disabled", "disabled");
  slidersDetune.setAttribute("disabled", "disabled");
  slidersQuality.setAttribute("disabled", "disabled");

  // for (var i = 0; i < slidersFilt.length; i++) {
  //   slidersFilt[i].setAttribute("disabled", "disabled");
  // }
};

playbackControlNew.oninput = function () {
  source.playbackRate.value = playbackControlNew.value;
  // playbackValueNew.innerHTML = playbackControlNew.value;

};

loopstartControlNew.oninput = function () {
  source.loopStart = loopstartControlNew.value;
  // loopstartValueNew.innerHTML = loopstartControlNew.value;
};

loopendControlNew.oninput = function () {
  source.loopEnd = loopendControlNew.value;
  // loopendValueNew.innerHTML = loopendControlNew.value;
};

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
// document.querySelector("#selectList").addEventListener("change", function (e) {
//   let name = e.target.options[e.target.selectedIndex].value;
//   loadInpulseResponse(name);
// });

// Reverb (Buttons)
// function reverb_Buttons() {
    document.querySelector("#cave").addEventListener("click", function (e) {
      let name = "cave"
      console.log(name);
      loadInpulseResponse(name)
    });

    document.querySelector("#church").addEventListener("click", function (e) {
      let name = "church"
      console.log(name);
      loadInpulseResponse(name)
    });

    document.querySelector("#garage").addEventListener("click", function (e) {
      let name = "garage"
      console.log(name);
      loadInpulseResponse(name)
    });

    document.querySelector("#room").addEventListener("click", function (e) {
      let name = "room"
      console.log(name);
      loadInpulseResponse(name)
    });
// }


//Convolver for Reverb
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

// selectListFilter.addEventListener("change", function (e) {
//   filter.type = selectListFilter.options[selectListFilter.selectedIndex].value;
// });

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

window.addEventListener("DOMContentLoaded", () => {
  const xData = document.querySelector("#coordsX")
  const yData = document.querySelector("#coordsY")

  const websocket = new WebSocket("ws://localhost:5678/");

  websocket.onmessage = ({ data }) => {
    console.log(data)
    jsonCoord = JSON.parse(data);
    xData.innerHTML = jsonCoord.xCoord;
    yData.innerHTML = jsonCoord.yCoord;
    
  };

  setInterval(() => {
    websocket.send(JSON.stringify({ action: "plus" }));
  }, 5000);
});