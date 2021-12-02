/*
Displays:

ASR
CKLST
CNI
DAS
EFI
ENG
FCS
FUEL
HUD
ICAWS
PHM
SMS
SRCH
TFL
TSD-1
TSD-2
TSD-3
TWD
WPN-A
WPN-S
*/

/*
Displat Sizes:

T - Special Displays placed in the top portion of the Display

S - Smallest

N - Normal

B - Big

H - Huge
*/

let green = "#57BE59";
let blue = "#90C1C7";
let lightBlue = "#04FBF5";
let pi = Math.PI;

let canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// ctx.fillStyle = green;
// ctx.font = "normal 20px monospace";

// ctx.strokeStyle = "white";
ctx.lineWidth = 2;

let displayPortals = [["SMS", "TWD", "ENG"], ["TSD1", "SMS", "ENG"], ["TSD1", "SMS", "ENG"], ["ENG", "TWD", "SMS"]];
let displayConfig = ["Normal", "Normal", "Expanded2", "Normal"];

var events = [/* Exaample event */ /*{"points": [ List of Points Forming the Polygon ], "func": function () {console.log("yes");}*/];


function d2r(degrees) {
  return degrees * (pi / 180);
}

function addText(text, color, x, y, font) {
  ctx.beginPath();
  let prevColor = ctx.fillStyle;
  let prevFont = ctx.font;
  ctx.beginPath();
  ctx.fillStyle = color;
  if (font) {
    ctx.font = font;
  }
  ctx.fillText(text, x-0.5, y-0.5);
  ctx.fillStyle = prevColor;
  ctx.font = prevFont;
}
function addRect(fill, color, x, y, width, height) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.rect(x-0.5, y-0.5, width, height);
  ctx.stroke();
  ctx.fillStyle = fill;
  ctx.fill();
}
function addLine(color, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function makePolygon(points, fillColor, outlineColor, onClick) {
  if (onClick) {
    addEventToCanvas(points, onClick);
  }
  ctx.beginPath();
  ctx.moveTo(points[0][0]-0.5, points[0][1]-0.5);
  points = points.slice(1);
  for (a of points) {
    let x = a[0];
    let y = a[1];
    ctx.lineTo(x-0.5, y-0.5);
  }
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = outlineColor;
  ctx.stroke();
}
function addCircle(fillColor, strokeColor, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * pi);
  ctx.stroke();
  ctx.fillStyle = fillColor;
  ctx.fill();
}
function addImage(url, x, y, w, h) {
  let image = new Image();
  image.src = url;
  image.onload = function () {
    ctx.drawImage(image, x, y, w, h);
  }
}

function addRoundSlide(fillColor, strokeColor, x, y, r, totalP, extraP, value, hasInitialRestraint, initialRestraintPosition) {
  ctx.beginPath();
  ctx.arc(x, y, r, d2r(-90), d2r(((360/100)*totalP)-90), false);
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, d2r(((360/100)*totalP)-90), d2r(((360/100)*(totalP+extraP))-90), false);
  ctx.strokeStyle = "red";
  ctx.stroke();
  addLine(strokeColor, x-r+1, y, x-r-5, y);
  let a = 270;
  let b = 180;
  if (hasInitialRestraint) {
    if (initialRestraintPosition) {
      constraintX1 = x+((r) * Math.sin(d2r(360/100) * -initialRestraintPosition-180)));
      constraintY1 = y+((r) * Math.cos(d2r((360/100) * -initialRestraintPosition-180)));
      constraintX2 = x+((r + 5) * Math.sin(d2r((360/100) * -initialRestraintPosition-180)));
      constraintY2 = y+((r + 5) * Math.cos(d2r((360/100) * -initialRestraintPosition-180)));
      addLine(strokeColor, constraintX1, constraintY1, constraintX2, constraintY2);
      b = (360/100) * -initialRestraintPosition;
      a = (360 - 90 - b)/2;
    } else {
      addLine(strokeColor, x, y-r+1, x, y-r-5);
    }
  }
  
  ctx.lineWidth = 1;
  let px, py, rx, ry, lx, ly;
  px = x + ((r - 5) * Math.sin(d2r((a/100) * -value - b)));
  py = y + ((r - 5) * Math.cos(d2r((a/100) * -value - b)));
  addLine(strokeColor, x, y, px, py);
  rx = px + (5 * Math.sin(d2r((a/100) * -value - (b + 135))));
  ry = px + (5 * Math.cos(d2r((a/100) * -value - (b + 135))));
  addLine(strokeColor, px, py, rx, ry);
  lx = px + (5 * Math.sin(d2r((a/100) * -value - (b - 135))));
  ly = px + (5 * Math.cos(d2r((a/100) * -value - (b - 135))));
  addLine(strokeColor, px, py, lx, ly);
  ctx.lineWidth = 2;
}
// function makeLinearGraph(x, y, axis, numberOfDivisions, distanceBetweenDivisions, outsetDistanceFromDivision, divisionValue, firstDivisionValue, value, lineColor, numberColor) {
  

function checkConfig() {
  let c = [];
  for (let n = 0; x < displayConfig.length; n++) {
    let a = ((n == 0 || n == 2)) ? n+1 : n-1;
    let v = displayConfig[a];
    displayConfig[a] = (a == n+1 && x == "Expanded2") ? "Hidden" : v;
  }
  return c;
}
