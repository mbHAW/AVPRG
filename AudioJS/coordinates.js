// window.addEventListener("DOMContentLoaded", () => {
//     const xData = document.querySelector("#coordsX")
//     const yData = document.querySelector("#coordsY")

//     const websocket = new WebSocket("ws://localhost:5678/");

//     websocket.onmessage = ({ data }) => {
//       console.log(data)
//       var jsonCoord = JSON.parse(data);
//       xData.innerHTML = jsonCoord.xCoord;
//       yData.innerHTML = jsonCoord.yCoord;
      
//     };

//     setInterval(() => {
//       websocket.send(JSON.stringify({ action: "plus" }));
//     }, 5000);
//   });