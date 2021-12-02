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
function makeLinearGraph(x, y, axis, numberOfDivisions, distanceBetweenDivisions, outsetDistanceFromDivision, divisionValue, firstDivisionValue, value, lineColor, numberColor) {
  let lastDivisionValue = (numberOfDivisions * divisionValue) + firstDivisionValue;
  if (axis == "Y") {
    // addLine(lineColor, x, y, x+outsetDistanceFromDivision, y);
    for (let a = 0; a < numberofDivisions; a++) {
      let number = (numberOfDivisions - a) * divisionValue;
      addLine(lineColor, x, y + (a * distanceBetweenDivisions), x + 5, y + (a * distanceBetweenDivisions)));
      let tl = (number).toString().length;
      addText(number, numberColor, x - (tl * 11) + 5, y + (a * distanceBetweenDivisions) + 4, "normal 12 px monospace");
    }
    for let a = 0; a < (numberOfDivisions - 1); a++) {
      addLine(lineColor, x, y + (a * distanceBetweenDivisions), x, y + ((a + 1) * distanceBetweenDivisions));
    }
    let vx = x - 30;
    let vy = y + (value / divisionValue) * distanceBetweenDivisions;
    ctx.lineWidth = 1;
    makePolygon([
        [vx, vy - 4],
        [vx + 7, vy],
        [vx, vy + 4],
        [vx, vy - 4]
      ], blue, blue);
    ctx.lineWidth = 2;
  }
}


// Start Making and Designing Each Portal (oof..):
function ENG(size, position) {
  if (size == 1) {
    let p = position * 5;
    // Start Drawing Portal Contents
    /* ENG Smallest (S)
    Consists of basic info on THRUST, FFLOW, and N2 RPM.
    */
    addText("ENG", green, (((canvas.width - 1) / 8) * (position + 0.5)) - 15, ((canvas.height / 16) * 16) - 5, "normal 18px monospace");
    addText("THRUST:", green, (((canvas.width - 1) / 40) * (p + 1)) - 15, ((canvas.height / 16) * (p + 3)) - 5, "normal 16px monospace");
    addRect("transparent", green, (((canvas.width - 1) / 40) * (p + 3)) - 0, (((canvas.height - 1) / 16) * 12) + 20, (((canvas.width - 1) / 40) * 1.5) - 0, ((canvas.height/16)*0.5)-0);
    let thrust = 93;
    ctx.fillStyle = green;
    ctx.fillRect((((canvas.width - 1) / 40) * (p + 3)) - 0 - 0.5, (((canvas.height - 1) / 16) * 12) + 20 - 0.5, ((((canvas.width - 1) / 40) * 1.5) - 0) / 100 * thrust, ((canvas.height / 16) * 0.5) - 0);
    addText("FFLOW:", green, (((canvas.width - 1) / 40) * (p + 1)) - 15, ((canvas.height / 16) * 13) + 25, "normal 16px monospace");
    addRect("transparent", green, (((canvas.width - 1) / 40) * (p + 3)) - 0, (((canvas.height - 1) / 16) * 12) + 50, (((canvas.width - 1) / 40) * 1.5) - 0, ((canvas.height / 16) * 0.5) - 0);
    let fflow = 2;
    ctx.fillStyle = green;
    ctx.fillRect((((canvas.width - 1) / 40) * (p + 3)) - 0 - 0.5, (((canvas.height - 1) / 16) * 12) + 50 - 0.5, ((((canvas.width - 1) / 40) * 1.5) - 0) / 100 * fflow, ((canvas.height / 16) * 0.5) - 0);
    addText("N2 RPM:", green, (((canvas.width - 1) / 40) * (p + 1)) - 15, ((canvas.height / 16) * 13) + 55, "normal 16px monospace");
    addRect("transparent", green, (((canvas.width - 1) / 40) * (p + 3)) - 0, (((canvas.height - 1) / 16) * 12) + 80, (((canvas.width - 1) / 40) * 1.5) - 0, ((canvas.height / 16) * 0.5) - 0);
    n2rpm = 96.4;
    ctx.fillStyle = green;
    ctx.fillRect((((canvas.width - 1) / 40) * (p + 3)) - 0 - 0.5, (((canvas.height - 1) / 16) * 12) + 80 - 0.5, ((((canvas.width - 1) / 40) * 1.5) - 0) / 100 * n2rpm, ((canvas.height / 16) * 0.5) - 0);
  }
  if (size == 2) {
    let x = (canvas.width / 4) * position;
    let y = (canvas.height / 16) * 2;
    let w = canvas.width / 4;
    let h = (canvas.height / 16) * 10;
    addText("ENG", green, x + 20, y + 20, "normal 18px monospace");
    addText("NAV", green, x + 20, y + 35, "normal 18px monospace");
    // Internal Combustion Engine?(A-ICE)
    addText("A-ICE", blue, x + w - 75, y + 25, "normal 18px monospace");
    
    // Start of Top Engine-Related Information
    
    // Non-Interactive Round Slider Info Thrust
    // Max 110 Min 0?
    let thrust = 93;
    addRoundSlide("transparent", green, x + 73, y + 100, 30, 75, 8.33, thrust);
    addText("THRUST", green, x + 40, y + 150, "normal 18px monospace");
    addText(thrust, green, x + 38, y + 82, "normal 18px monospace");
    
    // Non-Interactive Round Slider Info EGT
    // Max 110 Min 0
    let egt = 981;
    addRoundSlide("transparent", green, x + 200, y + 100, 30, 75, 8.33, egt / 10);
    addText("EGT", green, x + 183, y + 150, "normal 18px monospace");
    addText(egt, green, x + 165, y + 82, "normal 18px monospace");
    
    // Non-Interactive Round Slider Info Throttle
    // Max 110 Min 0
    let throttle = 100;
    addRoundSlide("transparent", green, x + w - 73, y + 100, 30, 75, 0, throttle, true);
    addText("THROTTLE", green, x + w - 117, y + 150, "normal 18px monospace");
    addText(throttle, green, x + w - 111, y + 82, "normal 18px monospace");
    
    
    // Start of Middle Engine-Related Information.
    
    // Non-Interactive Regular Info FF
    let ff = 2188;
    addText("FF", green, x + 15, y + 211, "normal 18px monospace");
    addText(ff, green, x + 15 + 22 + 11, y + 211, "normal 18px monospace");
    addRect("transparent", green, x + 39, y + 195, 55, 24);
    
    // Non-Interactive Regular Info HYD1
    let hyd1 = 2849;
    addText("HYD1", green, x + 136, y + 211, "normal 18px monospace");
    addText(hyd1, green, x + 136 + 44 + 11, y + 211, "normal 18px monospace");
    addRect("transparent", green, x + 180, y + 195, 55, 24);
    
    // Non-Interactive Regular Info HYD2
    let hyd2 = 2849;
    addText("HYD2", green, x + w - 120, y + 211, "normal 18px monospace");
    addText(hyd2, green, x + w - 120 + 44 + 11, y + 211, "normal 18px monospace");
    addRect("transparent", green, x + w - 120 + 44, y + 195, 55, 24);
    
    
    // Start of Bottom Engine-Related Information
    
    // Non-Interactive Round Slider Info N1 RPM
    // Max 110 Min 0
    let n1rpm = 40.2;
    addRoundSlide("transparent", green, x + 73, y + h / 2 + 100, 30, 75, 8.33, n1rpm, true, 25);
    addText("N1 RPM", green, x + 40, y + h / 2 + 150, "normal 18px monospace");
    addText(n1rpm, green, x + 38, y + h / 2 + 82, "normal 18px monospace");
    
    // Non-Interactive Round Slider Info N2 RPM
    // Max 110 Min 0
    let n2rpm = 60.1;
    addRoundSlide("transparent", green, x + 200, y + h / 2 + 100, 30, 75, 8.33, n2rpm, true, 25);
    addText("N2 RPM", green, x + 183, y + h / 2 + 150, "normal 18px monospace");
    addText(n2rpm, green, x + 165, y + h / 2 + 82, "normal 18px monospace");
    
    // Non-Interactive Round Slider Info OIL
    // Max 110 Min 0
    let oil = 108;
    addRoundSlide("transparent", green, x + w - 73, y + h / 2 + 100, 30, 75, 8.33, oil);
    addText("OIL", green, x + w - 117, y + h / 2 + 150, "normal 18px monospace");
  }
}


function checkConfig() {
  let c = [];
  for (let n = 0; x < displayConfig.length; n++) {
    let a = ((n == 0 || n == 2)) ? n+1 : n-1;
    let v = displayConfig[a];
    displayConfig[a] = (a == n+1 && x == "Expanded2") ? "Hidden" : v;
  }
  return c;
}
