/*
Displays:

ASR
CKLST
CNI
DAS
EFI
ENG-
FCS
FUEL-
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
Display Sizes

T - Special Displays placed in the top portion of the Display

S - Smallest

N - Normal

B - Big

H - Huge
*/

let green = "#57BE59";
let blue = "#90C1C7";
let lightBlue = "#04FBF5";
let lighterBlue = "#4EBAFF";

let pi = Math.PI;

let canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// ctx.fillStyle = green;
// ctx.font = "normal 20px monospace";

// ctx.strokeStyle = "white";
ctx.lineWidth = 2;

let displayPortals = [["SMS", "TWD", "ENG"], ["TSD1", "SMS", "ENG"], ["TSD1", "SMS", "ENG"], ["ENG", "TWD", "SMS"]];
let displayConfig = ["Expanded1", "Normal", "Normal", "Normal"];
let tabs = [["", "", ""], ["", "", ""], ["", "", ""], ["", "", ""]];
let topPortals = [["BLANK", "FUEL", "SMS", "ICAWS"], ["BLANK", "COLORS", "RECORD", "ILS", "MENU", "IFFMAN", "CAB", "WIND"]]

var events = [/* Example event */ /*{"points": [list of points], "func": "function() {console.log('clicked within the event area!');}"}*/];

function d2r(degrees) {
  	return degrees * (pi/180);
}

// UI Critical Functions
function addText(text, color, x, y, font) {
	ctx.beginPath();
	let prevColor = ctx.fillStyle;
	let prevFont = ctx.font;;
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
function addImage(url, x, y, w, h) {
  	let image = new Image();
  	image.src = url;
  	image.onload = function () {
		ctx.drawImage(image, x, y, w, h);
  	}
}
function inside(point, vs) {
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
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
function addCircle(fillColor, strokeColor, x, y, r, startAngle, endAngle, antiClockwise) {
	ctx.beginPath();
	if (startAngle) {
		ctx.arc(x, y, r, startAngle, endAngle, antiClockwise);
	} else {
		ctx.arc(x, y, r, 0, 2 * pi);
	}
	ctx.strokeStyle = strokeColor;
	ctx.stroke();
	ctx.fillStyle = fillColor;
	ctx.fill();
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
			constraintX1 = x+((r)*Math.sin(d2r((360/100)*-initialRestraintPosition-180)));
			constraintY1 = y+((r)*Math.cos(d2r((360/100)*-initialRestraintPosition-180)));
			constraintX2 = x+((r+5)*Math.sin(d2r((360/100)*-initialRestraintPosition-180)));
			constraintY2 = y+((r+5)*Math.cos(d2r((360/100)*-initialRestraintPosition-180)));
			addLine(strokeColor, constraintX1, constraintY1, constraintX2, constraintY2);
			b = (360/100)*-initialRestraintPosition;
			a = (360-90-b)/2;
		} else {
			addLine(strokeColor, x, y-r+1, x, y-r-5);
		}
	}

	ctx.lineWidth = 1;
	let px, py;
	px = x+((r-5)*Math.sin(d2r((a/100)*-value-b)));
	py = y+((r-5)*Math.cos(d2r((a/100)*-value-b)));
	addLine(strokeColor, x, y, px, py);
	rx = px+(5*Math.sin(d2r((a/100)*-value-(b+135))));
	ry = py+(5*Math.cos(d2r((a/100)*-value-(b+135))));
	addLine(strokeColor, px, py, rx, ry);
	lx = px+(5*Math.sin(d2r((a/100)*-value-(b-135))));
	ly = py+(5*Math.cos(d2r((a/100)*-value-(b-135))));
	addLine(strokeColor, px, py, lx, ly);
	ctx.lineWidth = 2;
}
function makeLinearGraph(x, y, axis, numberOfDivisions, distanceBetweenDivisions, outsetDistanceFromDivision, divisionValue, firstDivisionValue, value, lineColor, numberColor) {
	let lastDivisionValue = (numberOfDivisions*divisionValue)+firstDivisionValue;
	if (axis == "Y") {
		// addLine(lineColor, x, y, x+outsetDistanceFromDivision, y);
		for (let a = 0; a < numberOfDivisions; a++) {
			let number = (numberOfDivisions-a)*divisionValue;
			addLine(lineColor, x, y+(a*distanceBetweenDivisions), x+5, y+(a*distanceBetweenDivisions));
			let tl = (number).toString().length;
			addText(number, numberColor, x-(tl*11)+5, y+(a*distanceBetweenDivisions)+4, "normal 12px monospace");
		}
		for (let a = 0; a < (numberOfDivisions-1); a++) {
			addLine(lineColor, x, y+(a*distanceBetweenDivisions), x, y+((a+1)*distanceBetweenDivisions));
		}
		let vy = y+(value/divisionValue)*distanceBetweenDivisions;
		let vx = x-30;
		ctx.lineWidth = 1;
		makePolygon([
			[vx, vy-4],
			[vx+7, vy],
			[vx, vy+4],
			[vx, vy-4]
		], blue, blue);
		ctx.lineWidth = 2;
	}
	
}

// Portals
function ENG(size, position) {
	if (size == 1) {
		let p = position*5;
		// Start Drawing Portal Contents
		/* ENG Smallest
		Consists of basic info on THRUST, FFLOW, and N2 RPM.
		*/
		addText(
			"ENG", 
			green, 
			(((canvas.width-1)/8)*(position+0.5))-15, 
			(((canvas.height-1)/16)*16)-5, 
			"normal 18px monospace"
		);
		addText(
			"THRUST:", 
			green, 
			(((canvas.width-1)/40)*(p+1))-15, 
			((canvas.height/16)*13)-5, 
			"normal 16px monospace"
		);

		addRect("transparent", 
			green, 
			(((canvas.width-1)/40)*(p+3))-0, 
			(((canvas.height-1)/16)*12)+20, 
			(((canvas.width-1)/40)*1.5)-0, 
			((canvas.height/16)*0.5)-0
		);
		let thrust = 93;
		ctx.fillStyle = green;
		ctx.fillRect((((canvas.width-1)/40)*(p+3))-0-0.5, (((canvas.height-1)/16)*12)+20-0.5, ((((canvas.width-1)/40)*1.5)-0)/100*thrust, ((canvas.height/16)*0.5)-0);

		addText(
			"FFLOW:", 
			green, 
			(((canvas.width-1)/40)*(p+1))-15, 
			((canvas.height/16)*13)+25, 
			"normal 16px monospace"
		);

		addRect("transparent", 
			green, 
			(((canvas.width-1)/40)*(p+3))-0, 
			(((canvas.height-1)/16)*12)+50, 
			(((canvas.width-1)/40)*1.5)-0, 
			((canvas.height/16)*0.5)-0
		);
		let fflow = 2;
		ctx.fillStyle = green;
		ctx.fillRect((((canvas.width-1)/40)*(p+3))-0-0.5, (((canvas.height-1)/16)*12)+50-0.5, ((((canvas.width-1)/40)*1.5)-0)/100*fflow, ((canvas.height/16)*0.5)-0);

		addText(
			"N2 RPM:", 
			green, 
			(((canvas.width-1)/40)*(p+1))-15, 
			((canvas.height/16)*13)+55, 
			"normal 16px monospace"
		);

		addRect("transparent", 
			green, 
			(((canvas.width-1)/40)*(p+3))-0, 
			(((canvas.height-1)/16)*12)+80, 
			(((canvas.width-1)/40)*1.5)-0, 
			((canvas.height/16)*0.5)-0
		);
		let n2rpm = 96.4;
		ctx.fillStyle = green;
		ctx.fillRect((((canvas.width-1)/40)*(p+3))-0-0.5, (((canvas.height-1)/16)*12)+80-0.5, ((((canvas.width-1)/40)*1.5)-0)/100*n2rpm, ((canvas.height/16)*0.5)-0);
	}
	if (size == 2) {
		let x = (canvas.width/4)*position;
		let y = (canvas.height/16)*2;
		let w = canvas.width/4;
		let h = (canvas.height/16)*10;
		addText("ENG", green, x+20, y+20, "normal 18px monospace");
		addText("NAV", green, x+20, y+35, "normal 18px monospace");
		// Internal Combustion Engine?(A-ICE)
		addText("A-ICE", blue, x+w-75, y+25, "normal 18px monospace");

		// Start of Top Engine-Related Information

		// Non-Interactive Round Slider Info Thrust
		// Max 110 Min 0
		let thrust = 93;
		addRoundSlide("transparent", green, x+73, y+100, 30, 75, 8.33, thrust);
		addText("THRUST", green, x+40, y+150, "normal 18px monospace");
		addText(thrust, green, x+38, y+82, "normal 18px monospace");

		// Non-Interactive Round Slider Info EGT
		// Max 110 Min 0
		let egt = 981;
		addRoundSlide("transparent", green, x+200, y+100, 30, 75, 8.33, egt/10);
		addText("EGT", green, x+183, y+150, "normal 18px monospace");
		addText(egt, green, x+165, y+82, "normal 18px monospace");

		// Non-Interactive Round Slider Info Throttle
		// Max 110 Min 0
		let throttle = 100;
		addRoundSlide("transparent", green, x+w-73, y+100, 30, 75, 0, throttle, true);
		addText("THROTTLE", green, x+w-117, y+150, "normal 18px monospace");
		addText(throttle, green, x+w-111, y+82, "normal 18px monospace");

		// Start of Middle Engine-Related Information.
		
		// Non-Interactive Regular Info FF
		let ff = 2188;
		addText("FF", green, x+15, y+211, "normal 18px monospace");
		addText(ff, green, x+15+22+11, y+211, "normal 18px monospace");
		addRect("transparent", green, x+39, y+195, 55, 24);

		// Non-Interactive Regular Info HYD1
		let hyd1 = 2849;
		addText("HYD1", green, x+136, y+211, "normal 18px monospace");
		addText(hyd1, green, x+136+44+11, y+211, "normal 18px monospace");
		addRect("transparent", green, x+180, y+195, 55, 24);

		// Non-Interactive Regular Info HYD1
		let hyd2 = 2849;
		addText("HYD2", green, x+w-120, y+211, "normal 18px monospace");
		addText(hyd2, green, x+w-120+44+11, y+211, "normal 18px monospace");
		addRect("transparent", green, x+w-120+44, y+195, 55, 24)

		// Start of Bottom Engine-Related Information

		// Non-Interactive Round Slider Info N1 RPM
		// Max 110 Min 0
		let n1rpm = 40.2;
		addRoundSlide("transparent", green, x+73, y+h/2+100, 30, 75, 8.33, n1rpm, true, 25);
		addText("N1 RPM", green, x+40, y+h/2+150, "normal 18px monospace");
		addText(n1rpm, green, x+38, y+h/2+82, "normal 18px monospace");

		// Non-Interactive Round Slider Info N2 RPM
		// Max 110 Min 0
		let n2rpm = 60.1;
		addRoundSlide("transparent", green, x+200, y+h/2+100, 30, 75, 8.33, n2rpm, true, 25);
		addText("N2 RPM", green, x+183, y+h/2+150, "normal 18px monospace");
		addText(n2rpm, green, x+165, y+h/2+82, "normal 18px monospace");

		// Non-Interactive Round Slider Info OIL
		// Max 110 Min 0
		let oil = 108;
		addRoundSlide("transparent", green, x+w-73, y+h/2+100, 30, 75, 8.33, oil);
		addText("OIL", green, x+w-117, y+h/2+150, "normal 18px monospace");
	}
}
function SMS(size, position) {
	if (size == 0) {
		let x = 30+(canvas.width/16)*position;
		let y = (canvas.height/16)*0;
		addText("2 MRM", green, x+20, y+15, "normal 14px monospace");
		addText("2 SRM", green, x+20, y+35, "normal 14px monospace");
		addText("NO  GUN", green, x+20, y+55, "normal 14px monospace");
		addText("2 BOMB", green, x+20, y+75, "normal 14px monospace");
		addText("10", "white", x+82, y+15, "normal 14px monospace");
		addText("20", "white", x+82, y+30, "normal 14px monospace");
	}
	if (size == 1) {
		// Start Drawing Portal Contents
		// SMS portal - Smallest
		let x = (canvas.width/8)*position;
		let y = (canvas.height/16)*12;
		addText(
			"SMS", 
			green, 
			((x/position)*(position+0.5))-15, 
			((canvas.height/16)*16)-5, 
			"normal 18px monospace"
		);
		makePolygon([
			[x+72, y+1],
			[x+69, y+25],
			[x+1, y+65],
			[x+1, y+85],
			[x+69, y+100],
			[x+67, y+85],
			[x+15, y+73],
			[x+15, y+88]
		], "transparent", "#ACACAC");
		makePolygon([
			[x+128, y+1],
			[x+131, y+25],
			[x+198, y+65],
			[x+198, y+85],
			[x+132, y+100],
			[x+133, y+85],
			[x+185, y+73],
			[x+185, y+88]
		], "transparent", "#ACACAC");
		makePolygon([
			[x+75, y+75],
			[x+60, y+110],
			[x+60, y+130],
			[x+75, y+115],
			[x+78, y+102],
			[x+60, y+120],
			[x+78, y+102],
			[x+79, y+95],
			[x+75, y+75]
		], "black", "#ACACAC");
		makePolygon([
			[x+125, y+75],
			[x+140, y+110],
			[x+140, y+130],
			[x+125, y+115],
			[x+122, y+102],
			[x+140, y+120],
			[x+122, y+102],
			[x+121, y+95],
			[x+125, y+75]
		], "black", "#ACACAC");
		makePolygon([
			[x+60, y+115],
			[x+35, y+130],
			[x+35, y+142],
			[x+80, y+155],
			[x+85, y+115],
			[x+84, y+123],
			[x+66, y+125]
		], "transparent", "#ACACAC");
		makePolygon([
			[x+140, y+115],
			[x+165, y+130],
			[x+165, y+142],
			[x+120, y+155],
			[x+115, y+115],
			[x+116, y+123],
			[x+134, y+125]
		], "transparent", "#ACACAC");
		makePolygon([
			[x+85, y+115],
			[x+90, y+122],
			[x+110, y+122],
			[x+115, y+115]
		], "transparent", "#ACACAC");
		makePolygon([
			[x+85, y+115],
			[x+88.75, y+113],
			[x+92.5, y+115],
			[x+96.25, y+113],
			[x+100, y+115],
			[x+103.75, y+113],
			[x+107.5, y+115],
			[x+111.25, y+113],
			[x+115, y+115]
		], "transparent", "#ACACAC");
		addRect("transparent", green, x+10, y+115, 180, 20);
		addText("NO WPN SELECTED", green, x+20, y+130, "normal 18px monospace");
	}
	if (size == 2) {
		let p1 = position;
		let x = (((canvas.width-1)/4)*p1);
		let y = (canvas.height/16)*2;
		let w = ((canvas.width-1)/4);
		let h = (canvas.height/16)*10;
		addText("SMS", green, x+30, y+20, "normal 18px monospace");
		// Aircraft Shape

		// Left Wing
		makePolygon([
			[x+152, y+0],
			[x+145, y+10],
			[x+130, y+100],
			[x+30, y+160],
			[x+30, y+220],
			[x+145, y+245],
			[x+140, y+215],
			[x+50, y+197],
			[x+50, y+225]
		], "transparent", "#ACACAC");

		// Right Wing
		makePolygon([
			[x+w-152, y+0],
			[x+w-145, y+10],
			[x+w-130, y+100],
			[x+w-30, y+160],
			[x+w-30, y+220],
			[x+w-145, y+245],
			[x+w-140, y+215],
			[x+w-50, y+197],
			[x+w-50, y+225]
		], "transparent", "#ACACAC");

		// Left Rudder
		makePolygon([
			[x+160-5, y+205],
			[x+125-5, y+270],
			[x+125-5, y+310],
			[x+165-5, y+290],
			[x+167-5, y+275],
			[x+124-5, y+295],
			[x+167-5, y+275],
			[x+170-5, y+245],
			[x+160-5, y+205]
		], "black", "#ACACAC");

		// Right Rudder
		makePolygon([
			[x+w-160+5, y+205],
			[x+w-125+5, y+270],
			[x+w-125+5, y+310],
			[x+w-165+5, y+290],
			[x+w-167+5, y+275],
			[x+w-124+5, y+295],
			[x+w-167+5, y+275],
			[x+w-170+5, y+245],
			[x+w-160+5, y+205]
		], "black", "#ACACAC");

		// Left Elevator
		makePolygon([
			[x+125-5, y+280],
			[x+75-5, y+310],
			[x+75-5, y+335],
			[x+167-5, y+360],
			[x+180-5, y+280],
			[x+177-5, y+295],
			[x+145-5, y+300]
		], "transparent", "#ACACAC");

		// Right Elevator
		makePolygon([
			[x+w-125+5, y+280],
			[x+w-75+5, y+310],
			[x+w-75+5, y+335],
			[x+w-167+5, y+360],
			[x+w-180+5, y+280],
			[x+w-177+5, y+295],
			[x+w-145+5, y+300]
		], "transparent", "#ACACAC");

		// Nozzle
		makePolygon([
			[x+180-5, y+280],
			[x+190-5, y+290],
			[x+w-190+5, y+290],
			[x+w-180+5, y+280]
		], "transparent", "#FF0000");
		// Nozzle
		makePolygon([
			[x+180-5, y+280],
			[x+185-5, y+276],
			[x+190-5, y+280],
			[x+195-5, y+276],
			[x+200-5, y+280],
			[x+205-5, y+276],
			[x+w-200+5, y+280],
			[x+w-195+5, y+276],
			[x+w-190+5, y+280],
			[x+w-185+5, y+276],
			[x+w-180+5, y+280]
		], "transparent", "#ACACAC");
		/* 
		AA1 / DGFT / AS
		*/
		addText("AA1", green, x+30, y+35, "normal 18px monospace");
		// CNTL
		addText("CNTL>", blue, x+((canvas.width-1)/4)-70, y+20, "normal 18px monospace");
		// LIVE / TRAIN Selection
		let lx = x+((canvas.width-1)/8)-20;
		let ly = y+25;
		let lw = 44;
		addText("LIVE", "white", lx, ly, "normal 18px monospace");
		let tx = x+((canvas.width-1)/8)-25;
		let ty = y+45;
		let tw = 55;
		addText("TRAIN", "grey", tx, ty, "normal 18px monospace");
		addRect("transparent", "white", lx-5, ly-15, lw+10, 20);
		
		// WPN DOORS OPEN/CLOSED Selection
		let wpnDoorsState = 0;
		addText("DOORS", blue, x+5, y+250, "normal 18px monospace");
		if (wpnDoorsState == 0) {
			addText("OPEN", blue, x+5, y+270, "normal 18px monospace");

			addText("CLOSED", "white", x+5, y+290, "normal 18px monospace");
			addRect("transparent", "white", x+5-2, y+290-15, 66+4, 20)
		}
		if (wpnDoorsState == 1) {
			addText("OPEN", "white", x+5, y+270, "normal 18px monospace");

			addText("CLOSED", blue, x+5, y+290, "normal 18px monospace");
			addRect("transparent", "white", x+5-2, y+270-15, 44+4, 20)
		}

		// Weapon Selection and ready-state declaration(it rhymes lmfao).
		// STA7 A120 - RDY
		// NO WPN SELECTED
		let txt = "NO WPN SELECTED";
		let txtlng = txt.length*11;
		let txtx = x+(w/2)-(txtlng/2);
		let txty = y+220;
		addText(txt, "white", txtx, txty, "normal 18px monospace");
		addRect("transparent", "white", txtx-5, txty-15, txtlng+10, 20)

		// Chaff and Flare Count Display System (Chaff Count Display System[CCDS] & Flare Count Display System[FCDS])
		let ccds = "CHAFF  10";
		let ccdslng = ccds.length*11;
		let ccdsx = x+(w/2)-(ccdslng/2);
		let ccdsy = y+260;
		addRect("black", "#FFFFFF", ccdsx-5, ccdsy-15, ccdslng+10, 110);
		addText(ccds, "white", ccdsx, ccdsy, "normal 18px monospace");
		let fcds = "FLARE  20";
		let fcdslng = fcds.length*11;
		let fcdsx = x+(w/2)-(fcdslng/2);
		let fcdsy = y+280;
		addText(fcds, "white", fcdsx, fcdsy, "normal 18px monospace");

		// IDk what "EXCM ARM" is, so I'll make it changeable just in case.

		let escmarm = 1;
		if (escmarm == 0) {
			addText("EXCM", blue, x+5, y+h-40, "normal 18px monospace");
			addText("ARM", blue, x+5, y+h-25, "normal 18px monospace");
		}
		if (escmarm == 1) {
			addText("EXCM", "white", x+5, y+h-40, "normal 18px monospace");
			addText("ARM", "white", x+5, y+h-25, "normal 18px monospace");
			addRect("transparent", "white", x+5-2, y+h-55, 44+4, 35)
		}
	}
	if (size == 3) {
		let p1 = position;
		let x = (((canvas.width-1)/4)*p1);
		let y = (canvas.height/16)*2;
		let w = ((canvas.width-1)/4);
		let h = (canvas.height/16)*10;
		let uh = (canvas.height/16);
		// let uw = (canvas.width/40); Not Necessary

		addText("SMS", green, x+30, y+20, "normal 18px monospace");
		// Top Aircraft View

		// Left Wing
		makePolygon([
			[x+152, y+0],
			[x+145, y+10],
			[x+130, y+100],
			[x+30, y+160],
			[x+30, y+220],
			[x+145, y+245],
			[x+140, y+215],
			[x+50, y+197],
			[x+50, y+225]
		], "transparent", "#ACACAC");

		// Right Wing
		makePolygon([
			[x+w-152, y+0],
			[x+w-145, y+10],
			[x+w-130, y+100],
			[x+w-30, y+160],
			[x+w-30, y+220],
			[x+w-145, y+245],
			[x+w-140, y+215],
			[x+w-50, y+197],
			[x+w-50, y+225]
		], "transparent", "#ACACAC");

		// Left Rudder
		makePolygon([
			[x+160-5, y+205],
			[x+125-5, y+270],
			[x+125-5, y+310],
			[x+165-5, y+290],
			[x+167-5, y+275],
			[x+124-5, y+295],
			[x+167-5, y+275],
			[x+170-5, y+245],
			[x+160-5, y+205]
		], "black", "#ACACAC");

		// Right Rudder
		makePolygon([
			[x+w-160+5, y+205],
			[x+w-125+5, y+270],
			[x+w-125+5, y+310],
			[x+w-165+5, y+290],
			[x+w-167+5, y+275],
			[x+w-124+5, y+295],
			[x+w-167+5, y+275],
			[x+w-170+5, y+245],
			[x+w-160+5, y+205]
		], "black", "#ACACAC");

		// Left Elevator
		makePolygon([
			[x+125-5, y+280],
			[x+75-5, y+310],
			[x+75-5, y+335],
			[x+167-5, y+360],
			[x+180-5, y+280],
			[x+177-5, y+295],
			[x+145-5, y+300]
		], "transparent", "#ACACAC");

		// Right Elevator
		makePolygon([
			[x+w-125+5, y+280],
			[x+w-75+5, y+310],
			[x+w-75+5, y+335],
			[x+w-167+5, y+360],
			[x+w-180+5, y+280],
			[x+w-177+5, y+295],
			[x+w-145+5, y+300]
		], "transparent", "#ACACAC");

		// Nozzle
		makePolygon([
			[x+180-5, y+280],
			[x+190-5, y+290],
			[x+w-190+5, y+290],
			[x+w-180+5, y+280]
		], "transparent", "#ACACAC");
		// Nozzle
		makePolygon([
			[x+180-5, y+280],
			[x+185-5, y+276],
			[x+190-5, y+280],
			[x+195-5, y+276],
			[x+200-5, y+280],
			[x+205-5, y+276],
			[x+w-200+5, y+280],
			[x+w-195+5, y+276],
			[x+w-190+5, y+280],
			[x+w-185+5, y+276],
			[x+w-180+5, y+280]
		], "transparent", "#ACACAC");

		// Front / Back Aircraft View
		makePolygon([
			// Superior Right Section
			[x+(w/2)-10, y+(uh*10)-20],
			[x+(w/2)+10, y+(uh*10)-20],
			[x+(w/2)+40, y+(uh*10)-10],
			[x+(w/2)+60, y+(uh*10)],
			[x+(w/2)+85, y+(uh*10)+5],
			[x+(w/2)+200-30, y+(uh*10)+7],
			[x+(w/2)+85, y+(uh*10)+12],
			[x+(w/2)+80, y+(uh*10)+20],
			[x+(w/2), y+(uh*10)+40],
			// Superior Left Section
			[x+(w/2)-80, y+(uh*10)+20],
			[x+(w/2)-85, y+(uh*10)+12],
			[x+(w/2)-200+30, y+(uh*10)+7],
			[x+(w/2)-85, y+(uh*10)+5],
			[x+(w/2)-60, y+(uh*10)],
			[x+(w/2)-40, y+(uh*10)-10],
			[x+(w/2)-10, y+(uh*10)-20],
			[x+(w/2)+10, y+(uh*10)-20]
		], "transparent", "#ACACAC");
		makePolygon([
			// Inferior Right Section
			[x+(w/2)+72, y+(uh*10)+22],
			[x+(w/2)+68, y+(uh*10)+24],
			[x+(w/2)+65, y+(uh*10)+27],
			[x+(w/2)+64, y+(uh*10)+30],
			[x+(w/2)+63, y+(uh*10)+33],
			[x+(w/2)+62, y+(uh*10)+36],
			[x+(w/2)+61, y+(uh*10)+40],
			[x+(w/2)+60, y+(uh*10)+50],
			[x+(w/2)+59, y+(uh*10)+60],
			[x+(w/2)+58, y+(uh*10)+64],
			[x+(w/2)+57, y+(uh*10)+67],
			[x+(w/2)+56, y+(uh*10)+70],
			// Start of Right Weapon Bay Door Vertices
			[x+(w/2)+55, y+(uh*10)+73],
			[x+(w/2)+48, y+(uh*10)+78],
			[x+(w/2)+10, y+(uh*10)+78],
			// End of Right Weapon Bay Door Vertices
			[x+(w/2), y+(uh*10)+78],
			[x+(w/2), y+(uh*10)+40],
			// Inferior Left Section
			[x+(w/2), y+(uh*10)+78],
			// Start of Left Weapon Bay Door Vertices
			[x+(w/2)-10, y+(uh*10)+78],
			[x+(w/2)-48, y+(uh*10)+78],
			[x+(w/2)-55, y+(uh*10)+73],
			// End of Left Weapon Bay Door Vertices
			[x+(w/2)-56, y+(uh*10)+70],
			[x+(w/2)-57, y+(uh*10)+67],
			[x+(w/2)-58, y+(uh*10)+64],
			[x+(w/2)-59, y+(uh*10)+60],
			[x+(w/2)-60, y+(uh*10)+50],
			[x+(w/2)-61, y+(uh*10)+40],
			[x+(w/2)-62, y+(uh*10)+36],
			[x+(w/2)-63, y+(uh*10)+33],
			[x+(w/2)-64, y+(uh*10)+30],
			[x+(w/2)-65, y+(uh*10)+27],
			[x+(w/2)-68, y+(uh*10)+24],
			[x+(w/2)-72, y+(uh*10)+22],
		], "transparent", "#ACACAC");
		/* 
		AA1 / DGFT / AS
		*/
		addText("AA1", green, x+30, y+35, "normal 18px monospace");
		// CNTL
		addText("CNTL>", blue, x+((canvas.width-1)/4)-70, y+20, "normal 18px monospace");
		// LIVE / TRAIN Selection
		let lx = x+((canvas.width-1)/8)-20;
		let ly = y+25;
		let lw = 44;
		addText("LIVE", "white", lx, ly, "normal 18px monospace");
		let tx = x+((canvas.width-1)/8)-25;
		let ty = y+45;
		let tw = 55;
		addText("TRAIN", "grey", tx, ty, "normal 18px monospace");
		addRect("transparent", "white", lx-5, ly-15, lw+10, 20);
		
		// WPN DOORS OPEN/CLOSED Selection
		let wpnDoorsState = 0;
		addText("DOORS", blue, x+5, y+250, "normal 18px monospace");
		if (wpnDoorsState == 0) {
			addText("OPEN", blue, x+5, y+270, "normal 18px monospace");

			addText("CLOSED", "white", x+5, y+290, "normal 18px monospace");
			addRect("transparent", "white", x+5-2, y+290-15, 66+4, 20)
		}
		if (wpnDoorsState == 1) {
			addText("OPEN", "white", x+5, y+270, "normal 18px monospace");

			addText("CLOSED", blue, x+5, y+290, "normal 18px monospace");
			addRect("transparent", "white", x+5-2, y+270-15, 44+4, 20)
		}

		// Weapon Selection and ready-state declaration(it rhymes lmfao).
		// STA7 A120 - RDY
		// NO WPN SELECTED
		let txt = "NO WPN SELECTED";
		let txtlng = txt.length*11;
		let txtx = x+(w/2)-(txtlng/2);
		let txty = y+220;
		addText(txt, "white", txtx, txty, "normal 18px monospace");
		addRect("transparent", "white", txtx-5, txty-15, txtlng+10, 20)

		// Chaff and Flare Count Display System (Chaff Count Display System[CCDS] & Flare Count Display System[FCDS])
		let ccds = "CHAFF  10";
		let ccdslng = ccds.length*11;
		let ccdsx = x+(w/2)-(ccdslng/2);
		let ccdsy = y+260;
		addRect("transparent", "#FFFFFF", ccdsx-5, ccdsy-15, ccdslng+10, 110);
		addText(ccds, "white", ccdsx, ccdsy, "normal 18px monospace");
		let fcds = "FLARE  20";
		let fcdslng = fcds.length*11;
		let fcdsx = x+(w/2)-(fcdslng/2);
		let fcdsy = y+280;
		addText(fcds, "white", fcdsx, fcdsy, "normal 18px monospace");

		// IDk what "EXCM ARM" is, so I'll make it changeable just in case.

		let escmarm = 1;
		if (escmarm == 0) {
			addText("EXCM", blue, x+5, y+h-40, "normal 18px monospace");
			addText("ARM", blue, x+5, y+h-25, "normal 18px monospace");
		}
		if (escmarm == 1) {
			addText("EXCM", "white", x+5, y+h-40, "normal 18px monospace");
			addText("ARM", "white", x+5, y+h-25, "normal 18px monospace");
			addRect("transparent", "white", x+5-2, y+h-55, 44+4, 35)
		}
	}
	if (size == 4) {
		let p1 = position;
		let x = (((canvas.width-1)/4)*p1);
		let y = (canvas.height/16)*2;
		let w = ((canvas.width-1)/2);
		let h = (canvas.height/16)*10;
		let uh = (canvas.height/16);
		// let uw = (canvas.width/40); Not Necessary

		addText("SMS", green, x+30, y+20, "normal 18px monospace");
		// Top Aircraft View

		// Left Wing
		makePolygon([
			[x+(w/4)+152, y+0],
			[x+(w/4)+145, y+10],
			[x+(w/4)+130, y+100],
			[x+(w/4)+30, y+160],
			[x+(w/4)+30, y+220],
			[x+(w/4)+145, y+245],
			[x+(w/4)+140, y+215],
			[x+(w/4)+50, y+197],
			[x+(w/4)+50, y+225]
		], "transparent", "#ACACAC");

		// Right Wing
		makePolygon([
			[x+w-(w/4)-152, y+0],
			[x+w-(w/4)-145, y+10],
			[x+w-(w/4)-130, y+100],
			[x+w-(w/4)-30, y+160],
			[x+w-(w/4)-30, y+220],
			[x+w-(w/4)-145, y+245],
			[x+w-(w/4)-140, y+215],
			[x+w-(w/4)-50, y+197],
			[x+w-(w/4)-50, y+225]
		], "transparent", "#ACACAC");

		// Left Rudder
		makePolygon([
			[x+(w/4)+160-5, y+205],
			[x+(w/4)+125-5, y+270],
			[x+(w/4)+125-5, y+310],
			[x+(w/4)+165-5, y+290],
			[x+(w/4)+167-5, y+275],
			[x+(w/4)+124-5, y+295],
			[x+(w/4)+167-5, y+275],
			[x+(w/4)+170-5, y+245],
			[x+(w/4)+160-5, y+205]
		], "black", "#ACACAC");

		// Right Rudder
		makePolygon([
			[x+w-(w/4)-160+5, y+205],
			[x+w-(w/4)-125+5, y+270],
			[x+w-(w/4)-125+5, y+310],
			[x+w-(w/4)-165+5, y+290],
			[x+w-(w/4)-167+5, y+275],
			[x+w-(w/4)-124+5, y+295],
			[x+w-(w/4)-167+5, y+275],
			[x+w-(w/4)-170+5, y+245],
			[x+w-(w/4)-160+5, y+205]
		], "black", "#ACACAC");

		// Left Elevator
		makePolygon([
			[x+(w/4)+125-5, y+280],
			[x+(w/4)+75-5, y+310],
			[x+(w/4)+75-5, y+335],
			[x+(w/4)+167-5, y+360],
			[x+(w/4)+180-5, y+280],
			[x+(w/4)+177-5, y+295],
			[x+(w/4)+145-5, y+300]
		], "transparent", "#ACACAC");

		// Right Elevator
		makePolygon([
			[x+w-(w/4)-125+5, y+280],
			[x+w-(w/4)-75+5, y+310],
			[x+w-(w/4)-75+5, y+335],
			[x+w-(w/4)-167+5, y+360],
			[x+w-(w/4)-180+5, y+280],
			[x+w-(w/4)-177+5, y+295],
			[x+w-(w/4)-145+5, y+300]
		], "transparent", "#ACACAC");

		// Nozzle
		makePolygon([
			[x+380-5, y+280],
			[x+390-5, y+290],
			[x+w-390+5, y+290],
			[x+w-380+5, y+280]
		], "transparent", "#ACACAC");
		// Nozzle
		makePolygon([
			[x+380-5, y+280],
			[x+385-5, y+276],
			[x+390-5, y+280],
			[x+395-5, y+276],
			[x+400-5, y+280],
			[x+405-5, y+276],
			[x+w-400+5, y+280],
			[x+w-395+5, y+276],
			[x+w-390+5, y+280],
			[x+w-385+5, y+276],
			[x+w-380+5, y+280]
		], "transparent", "#ACACAC");

		// Front / Back Aircraft View
		makePolygon([
			// Superior Right Section
			[x+(w/2)-10, y+(uh*10)-20],
			[x+(w/2)+10, y+(uh*10)-20],
			[x+(w/2)+40, y+(uh*10)-10],
			[x+(w/2)+60, y+(uh*10)],
			[x+(w/2)+85, y+(uh*10)+5],
			[x+(w/2)+200-30, y+(uh*10)+7],
			[x+(w/2)+85, y+(uh*10)+12],
			[x+(w/2)+80, y+(uh*10)+20],
			[x+(w/2), y+(uh*10)+40],
			// Superior Left Section
			[x+(w/2)-80, y+(uh*10)+20],
			[x+(w/2)-85, y+(uh*10)+12],
			[x+(w/2)-200+30, y+(uh*10)+7],
			[x+(w/2)-85, y+(uh*10)+5],
			[x+(w/2)-60, y+(uh*10)],
			[x+(w/2)-40, y+(uh*10)-10],
			[x+(w/2)-10, y+(uh*10)-20],
			[x+(w/2)+10, y+(uh*10)-20]
		], "transparent", "#ACACAC");
		makePolygon([
			// Inferior Right Section
			[x+(w/2)+72, y+(uh*10)+22],
			[x+(w/2)+68, y+(uh*10)+24],
			[x+(w/2)+65, y+(uh*10)+27],
			[x+(w/2)+64, y+(uh*10)+30],
			[x+(w/2)+63, y+(uh*10)+33],
			[x+(w/2)+62, y+(uh*10)+36],
			[x+(w/2)+61, y+(uh*10)+40],
			[x+(w/2)+60, y+(uh*10)+50],
			[x+(w/2)+59, y+(uh*10)+60],
			[x+(w/2)+58, y+(uh*10)+64],
			[x+(w/2)+57, y+(uh*10)+67],
			[x+(w/2)+56, y+(uh*10)+70],
			// Start of Right Weapon Bay Door Vertices
			[x+(w/2)+55, y+(uh*10)+73],
			[x+(w/2)+48, y+(uh*10)+78],
			[x+(w/2)+10, y+(uh*10)+78],
			// End of Right Weapon Bay Door Vertices
			[x+(w/2), y+(uh*10)+78],
			[x+(w/2), y+(uh*10)+40],
			// Inferior Left Section
			[x+(w/2), y+(uh*10)+78],
			// Start of Left Weapon Bay Door Vertices
			[x+(w/2)-10, y+(uh*10)+78],
			[x+(w/2)-48, y+(uh*10)+78],
			[x+(w/2)-55, y+(uh*10)+73],
			// End of Left Weapon Bay Door Vertices
			[x+(w/2)-56, y+(uh*10)+70],
			[x+(w/2)-57, y+(uh*10)+67],
			[x+(w/2)-58, y+(uh*10)+64],
			[x+(w/2)-59, y+(uh*10)+60],
			[x+(w/2)-60, y+(uh*10)+50],
			[x+(w/2)-61, y+(uh*10)+40],
			[x+(w/2)-62, y+(uh*10)+36],
			[x+(w/2)-63, y+(uh*10)+33],
			[x+(w/2)-64, y+(uh*10)+30],
			[x+(w/2)-65, y+(uh*10)+27],
			[x+(w/2)-68, y+(uh*10)+24],
			[x+(w/2)-72, y+(uh*10)+22],
		], "transparent", "#ACACAC");
		// "Open" / "Closed"
		let weaponBayDoorsOpenClosed = "Open";
		if (weaponBayDoorsOpenClosed == "Closed") {
			
		}
		/* 
		AA1 / DGFT / AS
		*/
		addText("AA1", green, x+30, y+35, "normal 18px monospace");
		// CNTL
		addText("CNTL>", blue, x+((canvas.width-1)/4)-70, y+20, "normal 18px monospace");
		// LIVE / TRAIN Selection
		let lx = x+((canvas.width-1)/8)-20;
		let ly = y+25;
		let lw = 44;
		addText("LIVE", "white", lx, ly, "normal 18px monospace");
		let tx = x+((canvas.width-1)/8)-25;
		let ty = y+45;
		let tw = 55;
		addText("TRAIN", "grey", tx, ty, "normal 18px monospace");
		addRect("transparent", "white", lx-5, ly-15, lw+10, 20);
		
		// WPN DOORS OPEN/CLOSED Selection
		let wpnDoorsState = 0;
		addText("DOORS", blue, x+5, y+250, "normal 18px monospace");
		if (wpnDoorsState == 0) {
			addText("OPEN", blue, x+5, y+270, "normal 18px monospace");

			addText("CLOSED", "white", x+5, y+290, "normal 18px monospace");
			addRect("transparent", "white", x+5-2, y+290-15, 66+4, 20)
		}
		if (wpnDoorsState == 1) {
			addText("OPEN", "white", x+5, y+270, "normal 18px monospace");

			addText("CLOSED", blue, x+5, y+290, "normal 18px monospace");
			addRect("transparent", "white", x+5-2, y+270-15, 44+4, 20)
		}

		// Weapon Selection and ready-state declaration(it rhymes lmfao).
		// STA7 A120 - RDY
		// NO WPN SELECTED
		let txt = "NO WPN SELECTED";
		let txtlng = txt.length*11;
		let txtx = x+(w/2)-(txtlng/2);
		let txty = y+220;
		addText(txt, "white", txtx, txty, "normal 18px monospace");
		addRect("transparent", "white", txtx-5, txty-15, txtlng+10, 20)

		// Chaff and Flare Count Display System (Chaff Count Display System[CCDS] & Flare Count Display System[FCDS])
		let ccds = "CHAFF  10";
		let ccdslng = ccds.length*11;
		let ccdsx = x+(w/2)-(ccdslng/2);
		let ccdsy = y+260;
		addRect("transparent", "#FFFFFF", ccdsx-5, ccdsy-15, ccdslng+10, 110);
		addText(ccds, "white", ccdsx, ccdsy, "normal 18px monospace");
		let fcds = "FLARE  20";
		let fcdslng = fcds.length*11;
		let fcdsx = x+(w/2)-(fcdslng/2);
		let fcdsy = y+280;
		addText(fcds, "white", fcdsx, fcdsy, "normal 18px monospace");

		// IDk what "EXCM ARM" is, so I'll make it changeable just in case.

		let escmarm = 1;
		if (escmarm == 0) {
			addText("EXCM", blue, x+5, y+h-40, "normal 18px monospace");
			addText("ARM", blue, x+5, y+h-25, "normal 18px monospace");
		}
		if (escmarm == 1) {
			addText("EXCM", "white", x+5, y+h-40, "normal 18px monospace");
			addText("ARM", "white", x+5, y+h-25, "normal 18px monospace");
			addRect("transparent", "white", x+5-2, y+h-55, 44+4, 35)
		}
	}
}
function FUEL(size, position) {
	if (size == 2 || size == 3) {
		// Start Drawing Portal Contents.
		// FUEL Portal - Big(3) And Normal(2).
		p1 = position+1;
		p = (((canvas.width-1)/4)*(p1-1));

		addText("FUEL", green, (((canvas.width-1)/4)*p1)-380, 110);
		addText("REFUEL", blue, (((canvas.width-1)/4)*p1)-310, 110);
		addText("POP-UP", "#A43BAC", (((canvas.width-1)/4)*p1)-392, 130);

		addText("DUMP CO", blue, (((canvas.width-1)/4)*p1)-395, 350);
		addText("7.0", blue, (((canvas.width-1)/40)*0.125)+p, 370);


		addText("JOKER", blue, (((canvas.width-1)/4)*p1)-55, 260, "normal 16px monospace");
		addText("4.5", blue, (((canvas.width-1)/4)*p1)-35, 275, "normal 16px monospace");

		addText("BINGO", blue, (((canvas.width-1)/4)*p1)-55, 305, "normal 16px monospace");
		addText("3.0", blue, (((canvas.width-1)/4)*p1)-35, 320, "normal 16px monospace");

		addText("FUEL", blue, (((canvas.width-1)/4)*p1)-45, 350, "normal 16px monospace");
		addLine(blue, (((canvas.width-1)/4)*p1)-44, 355, (((canvas.width-1)/4)*p1)-5, 355);
		addText("JP4", blue, (((canvas.width-1)/4)*p1)-45, 370, "normal 16px monospace");

		// Gross Weight(GW)?
		addText("GW:   48.4", blue, (((canvas.width-1)/40)*1.25)+p, 185, "normal 14px monospace");
		addText("INLET:  43", green, (((canvas.width-1)/40)*1.25)+p, 200, "normal 14px monospace");
		addText("FEED:   44", green, (((canvas.width-1)/40)*1.25)+p, 215, "normal 14px monospace");



		addRect("transparent", green, (((canvas.width-1)/8)*1)+p+55, 135, 75, 75);
		addText("TOT:18.2", green, (((canvas.width-1)/8)*1)+p+57, 155, "normal 14px monospace");
		addText("INT:18.2", green, (((canvas.width-1)/8)*1)+p+57, 175, "normal 14px monospace");
		addText("EXT:0.0", green, (((canvas.width-1)/8)*1)+p+57, 195, "normal 14px monospace");


		ctx.fillStyle = "#AB32FC";
		ctx.fillRect((((canvas.width-1)/8)*1)+p-50-0.5, 150-0.5, 100, 50);
		addRect("transparent", "white", (((canvas.width-1)/8)*1)+p-50, 150, 100, 50);

		ctx.strokeStyle = "#FFFFFF";

		addText("F1", "#FFFFFF", (((canvas.width-1)/8)*1)+p-48, 160, "normal 12px monospace");
		addText("5300", "#FFFFFF", (((canvas.width-1)/8)*1)+p-13, 175, "normal 12px monospace");


		ctx.fillStyle = "#AB32FC";
		ctx.fillRect((((canvas.width-1)/8)*1)+p-53-0.5, 210-0.5, 48, 50);
		addRect("transparent", "white", (((canvas.width-1)/8)*1)+p-53, 210, 48, 50);

		addText("F2L", "#FFFFFF", (((canvas.width-1)/8)*1)+p-51, 220, "normal 12px monospace");
		addText("1500", "#FFFFFF", (((canvas.width-1)/8)*1)+p-43, 235, "normal 12px monospace");


		ctx.fillStyle = "#AB32FC";
		ctx.fillRect((((canvas.width-1)/8)*1)+p+4-0.5, 210-0.5, 48, 50);
		addRect("transparent", "white", (((canvas.width-1)/8)*1)+p+4, 210, 48, 50);

		addText("F2R", "#FFFFFF", (((canvas.width-1)/8)*1)+p+5, 220, "normal 12px monospace");
		addText("1500", "#FFFFFF", (((canvas.width-1)/8)*1)+p+13, 235, "normal 12px monospace");

		addText("FEED", "#FFFFFF", (((canvas.width-1)/8)*1)+p-50, 270, "normal 12px monospace");
		addText("FEED", "#FFFFFF", (((canvas.width-1)/8)*1)+p+20, 270, "normal 12px monospace");

		ctx.fillStyle = "#AB32FC";
		ctx.fillRect((((canvas.width-1)/8)*1)+p-56-0.5, 275-0.5, 52, 50);
		addRect("transparent", "white", (((canvas.width-1)/8)*1)+p-56, 275, 52, 50);

		addText("F3L", "#FFFFFF", (((canvas.width-1)/8)*1)+p-55, 285, "normal 12px monospace");
		addText("1700", "#FFFFFF", (((canvas.width-1)/8)*1)+p-45, 305, "normal 12px monospace");

		ctx.fillStyle = "#AB32FC";
		ctx.fillRect((((canvas.width-1)/8)*1)+p+4-0.5, 275-0.5, 52, 50);
		addRect("transparent", "white", (((canvas.width-1)/8)*1)+p+4, 275, 52, 50);

		addText("F3R", "#FFFFFF", (((canvas.width-1)/8)*1)+p+5, 285, "normal 12px monospace");
		addText("1700", "#FFFFFF", (((canvas.width-1)/8)*1)+p+14, 305, "normal 12px monospace");

		makePolygon([
			[(((canvas.width-1)/8)*1)+p+60, 278],
			[(((canvas.width-1)/8)*1)+p+92, 313],
			[(((canvas.width-1)/8)*1)+p+92, 383],
			[(((canvas.width-1)/8)*1)+p+60, 418],
			[(((canvas.width-1)/8)*1)+p+60, 278]
		], "#AB32FC", "white");
		addText("RW", "#FFFFFF", (((canvas.width-1)/8)*1)+p+70, 313, "normal 10px monospace");
		addText("1300", "#FFFFFF", (((canvas.width-1)/8)*1)+p+61, 350, "normal 12px monospace");


		makePolygon([
			[(((canvas.width-1)/8)*1)+p-60, 278],
			[(((canvas.width-1)/8)*1)+p-92, 313],
			[(((canvas.width-1)/8)*1)+p-92, 383],
			[(((canvas.width-1)/8)*1)+p-60, 418],
			[(((canvas.width-1)/8)*1)+p-60, 278]
		], "#AB32FC", "white");

		addText("LW", "#FFFFFF", (((canvas.width-1)/8)*1)+p-84, 313, "normal 10px monospace");
		addText("1300", "#FFFFFF", (((canvas.width-1)/8)*1)+p-91, 350, "normal 12px monospace");


		addText("CG 30.0", green, (((canvas.width-1)/8)*1)+p-22, 340, "normal 12px monospace");


		ctx.fillStyle = "#AB32FC";
		ctx.fillRect((((canvas.width-1)/8)*1)+p-56-0.5, 345-0.5, 52, 50);
		addRect("transparent", "white", (((canvas.width-1)/8)*1)+p-56, 345, 52, 50);

		addText("F4L", "#FFFFFF", (((canvas.width-1)/8)*1)+p-55, 360, "normal 12px monospace");
		addText("1150", "#FFFFFF", (((canvas.width-1)/8)*1)+p-45, 375, "normal 12px monospace");

		ctx.fillStyle = "#AB32FC";
		ctx.fillRect((((canvas.width-1)/8)*1)+p+4-0.5, 345-0.5, 52, 50);
		addRect("transparent", "white", (((canvas.width-1)/8)*1)+p+4, 345, 52, 50);

		addText("F4R", "#FFFFFF", (((canvas.width-1)/8)*1)+p+5, 360, "normal 12px monospace");
		addText("1150", "#FFFFFF", (((canvas.width-1)/8)*1)+p+14, 375, "normal 12px monospace");


		ctx.fillStyle = "#AB32FC";
		ctx.fillRect((((canvas.width-1)/8)*1)+p-44-0.5, 405-0.5, 30, 50);
		addRect("transparent", "white", (((canvas.width-1)/8)*1)+p-44, 405, 30, 50);

		addText("F5L", "#FFFFFF", (((canvas.width-1)/8)*1)+p-43, 415, "normal 12px monospace");
		addText("600", "#FFFFFF", (((canvas.width-1)/8)*1)+p-40, 427, "normal 12px monospace");

		ctx.fillStyle = "#AB32FC";
		ctx.fillRect((((canvas.width-1)/8)*1)+p+15-0.5, 405-0.5, 30, 50);
		addRect("transparent", "white", (((canvas.width-1)/8)*1)+p+15, 405, 30, 50);

		addText("F5R", "#FFFFFF", (((canvas.width-1)/8)*1)+p+16, 415, "normal 12px monospace");
		addText("600", "#FFFFFF", (((canvas.width-1)/8)*1)+p+18, 427, "normal 12px monospace");
	}
	if (size == 0) {
		let x = 30+(canvas.width/16)*position;
		let y = (canvas.height/16)*0;
		// Internal Fuel is labeled as I, and External Fuel is labeled as E(Although it might be something else)
		addText("  18.2", green, x+13, y+30, "normal 18px monospace");
		addText("I 18.2", green, x+20, y+45, "normal 16px monospace");
		addText("E  0.0", green, x+20, y+60, "normal 16px monospace");
		ctx.fillStyle = "#A2B2FF";
		ctx.fillRect(x+80, y+13, 25, 66);
		addLine("black", x+80, y+24, x+105, y+24);
		addLine("black", x+80, y+35, x+105, y+35);
		addLine("black", x+80, y+46, x+105, y+46);
		addLine("black", x+80, y+57, x+105, y+57);
		addLine("black", x+80, y+68, x+105, y+68);
		addLine("white", x+85, y+52, x+110, y+52);
		addLine("white", x+85, y+60, x+110, y+60);
	}
}
function TWD(size, position) {
	if (size == 1) {
		// TWD S
		let p = position;
		let x = (((canvas.width-1)/8)*p);
		let y = ((canvas.height/16)*12);
		let w = 200;
		let h = 160;

		// Contents
		addCircle("transparent", "white", x+(w/2), y+(h/2), (h/2)-10);
		addCircle("transparent", "white", x+(w/2), y+(h/2), (h/2)-35);
		addCircle("transparent", "white", x+(w/2), y+(h/2), (h/2)-62);
		addCircle("transparent", "white", x+(w/2), y+(h/2), (h/2)-77);
		addLine("We're no strangers to love", x+(w/2), y+(h/2)-((h/2)-10), x+(w/2), y+(h/2)-((h/2)-62));
		addLine("You know the rules and so do I", x+(w/2), y+(h/2)+((h/2)-10), x+(w/2), y+(h/2)+((h/2)-62));
		addLine("A full commitment's what I'm thinking of", x+(w/2)-((h/2)-10), y+(h/2), x+(w/2)-((h/2)-62), y+(h/2));
		addLine("You wouldn't get this from any other guy", x+(w/2)+((h/2)-10), y+(h/2), x+(w/2)+((h/2)-62), y+(h/2));
		// Portal Name
		addText(
			"TWD", 
			green, 
			x+w-(w/2)-16.5, 
			y+h-5, 
			"normal 18px monospace"
		);
		addText(
			"OPER", 
			green, 
			x+10, 
			y+20, 
			"normal 18px monospace"
		);
		addText(
			"SEMI", 
			green, 
			x+w-50, 
			y+20, 
			"normal 18px monospace"
		);

	}
}
function TSD1(size, position) {
	if (size == 1) {
		let p = position;
		let x = (((canvas.width-1)/8)*p);
		let y = ((canvas.height/16)*12);
		let w = 200;
		let h = 160;
		addText(
			"TSD1", 
			green, 
			x+w-(w/2)-22, 
			y+h-5, 
			"normal 18px monospace"
		);
	}
	if (size == 2) {
		let p = position;
		let x = (canvas.width/4)*position;
		let y = (canvas.height/16)*2;
		let w = canvas.width/4;
		let h = (canvas.height/16)*10;
		// Circles
		addCircle("transparent", "grey", x+(w/2), y+w-50, 75, d2r(40), d2r(-220), true);
		addCircle("transparent", "grey", x+(w/2), y+w-50, 150, d2r(19), d2r(-199), true);
		addCircle("transparent", "grey", x+(w/2), y+w-50, 225, d2r(-29), d2r(-152), true);
		addCircle("transparent", "grey", x+(w/2), y+w-50, 300, d2r(-49), d2r(-131), true);
		// Portal Name
		addText(
			"TSD1", 
			green, 
			x+50-2*11, 
			y+20, 
			"normal 18px monospace"
		);
		// NAV / A-S / 
		addText(
			"NAV", 
			green, 
			x+50-1.5*11, 
			y+40, 
			"normal 18px monospace"
		);
		addText(
			"VIEW", 
			green, 
			x+135-2*11, 
			y+20, 
			"normal 18px monospace"
		);
		addLine(green, x+113, y+22, x+157, y+22);
		// HSD / HGD / VSD
		addText(
			"HSD", 
			blue, 
			x+135-1.5*11, 
			y+40, 
			"normal 18px monospace"
		);
		// addText(
		// 	"REPLY>", 
		// 	blue, 
		// 	x+225-3*11, 
		// 	y+20, 
		// 	"normal 18px monospace"
		// );
		// addText(
		// 	"RESET>", 
		// 	blue, 
		// 	x+315-3*11, 
		// 	y+20, 
		// 	"normal 18px monospace"
		// );

		// Data Link? (DLNK>) maybe
		addText(
			"DLNK>", 
			blue, 
			x+320-6*11, 
			y+20, 
			"normal 18px monospace"
		);
		addText(
			"CNTL>", 
			blue, 
			x+395-5*11, 
			y+20, 
			"normal 18px monospace"
		);
		addText(
			"E 4", 
			green, 
			x+395-4*11, 
			y+40, 
			"normal 18px monospace"
		);
		/* OB#1 / F-ALL / IFF / FCR / ESM / IRST */
		/* 
		ESM: Electronic (Warfare) Support Measure

		 */
		addText(
			"F-ALL", 
			"white", 
			x+103-2.5*11, 
			y+58, 
			"normal 14px monospace"
		);
		// I don't actually know what this is, i just thought it might be zoom idk why lmfao.
		let t1x = x+28;
		let t1y = y+90;
		makePolygon([
			[t1x, t1y+30],
			[t1x+10, t1y],
			[t1x+20, t1y+30],
			[t1x, t1y+30]
		], lightBlue, lightBlue);

		let zoom = "40.0";
		addText(
			zoom, 
			blue, 
			x+10, 
			y+150, 
			"normal 18px monospace"
		);
		let t2x = x+28;
		let t2y = y+170;
		makePolygon([
			[t2x, t2y],
			[t2x+10, t2y+30],
			[t2x+20, t2y],
			[t2x, t2y]
		], lightBlue, lightBlue);

		addText(
			"EMC", 
			green, 
			x+10, 
			y+250, 
			"normal 18px monospace"
		);
		addLine(green, x+10, y+252, x+41, y+252);
		let emc = 4
		addText(
			"EMC"+emc, 
			blue, 
			x+10, 
			y+270, 
			"normal 18px monospace"
		);
		addText(
			"MAP", 
			"grey", 
			x+10, 
			y+330, 
			"normal 18px monospace"
		);
		// Blob lets you choose wether to render enemy radar "hotspots" thingies
		let blob = false;
		addText(
			"BLOB", 
			blue, 
			x+10, 
			y+390, 
			"normal 18px monospace"
		);
		let something = 25;
		let g1x = x+100;
		let g1y = y+385;
		// IDK what this is... 
		// makeLinearGraph(g1x, g1y, "Y", 6, 20, 5, 10, 0, something, "white", "white");

		addText("NORM", "white", x+w-44-10, y+90, "normal 18px monospace");
		// 204 / 284 / 182
		addText("204", "white", x+w-33-10, y+110, "normal 18px monospace");

		addText("DEP", "white", x+w-33-10, y+170, "normal 18px monospace");

		addText("MK", blue, x+w-22-10, y+240, "normal 18px monospace");
		
		addText("ASGN>", blue, x+w-55-10, y+310, "normal 18px monospace");

		addText("DCLT>", blue, x+w-55-10, y+380, "normal 18px monospace");
	}
	if (size == 3) {
		let p = position;
		let x = (canvas.width/4)*position;
		let y = (canvas.height/16)*2;
		let w = canvas.width/4;
		let h = (canvas.height/16)*10;
		addText(
			"TSD1", 
			green, 
			x+50-2*11, 
			y+20, 
			"normal 18px monospace"
		);
		// NAV / A-S / 
		addText(
			"NAV", 
			green, 
			x+50-1.5*11, 
			y+40, 
			"normal 18px monospace"
		);
		addText(
			"VIEW", 
			green, 
			x+135-2*11, 
			y+20, 
			"normal 18px monospace"
		);
		addLine(green, x+113, y+22, x+157, y+22);
		// HSD / HGD / VSD
		addText(
			"HSD", 
			blue, 
			x+135-1.5*11, 
			y+40, 
			"normal 18px monospace"
		);
		// addText(
		// 	"REPLY>", 
		// 	blue, 
		// 	x+225-3*11, 
		// 	y+20, 
		// 	"normal 18px monospace"
		// );
		// addText(
		// 	"RESET>", 
		// 	blue, 
		// 	x+315-3*11, 
		// 	y+20, 
		// 	"normal 18px monospace"
		// );

		// Data Link? (DLNK>) maybe
		addText(
			"DLNK>", 
			blue, 
			x+320-6*11, 
			y+20, 
			"normal 18px monospace"
		);
		addText(
			"CNTL>", 
			blue, 
			x+395-5*11, 
			y+20, 
			"normal 18px monospace"
		);
		addText(
			"E 4", 
			green, 
			x+395-4*11, 
			y+40, 
			"normal 18px monospace"
		);
		/* OB#1 / F-ALL / IFF / FCR / ESM / IRST */
		/* 
		ESM: Electronic (Warfare) Support Measure

		 */
		addText(
			"F-ALL", 
			"white", 
			x+103-2.5*11, 
			y+58, 
			"normal 14px monospace"
		);
		// I don't actually know what this is, i just thought it might be zoom idk why lmfao.
		let t1x = x+28;
		let t1y = y+90;
		makePolygon([
			[t1x, t1y+30],
			[t1x+10, t1y],
			[t1x+20, t1y+30],
			[t1x, t1y+30]
		], lightBlue, lightBlue);

		let zoom = "40.0";
		addText(
			zoom, 
			blue, 
			x+10, 
			y+150, 
			"normal 18px monospace"
		);
		let t2x = x+28;
		let t2y = y+170;
		makePolygon([
			[t2x, t2y],
			[t2x+10, t2y+30],
			[t2x+20, t2y],
			[t2x, t2y]
		], lightBlue, lightBlue);

		addText(
			"EMC", 
			green, 
			x+10, 
			y+250, 
			"normal 18px monospace"
		);
		addLine(green, x+10, y+252, x+41, y+252);
		let emc = 4
		addText(
			"EMC"+emc, 
			blue, 
			x+10, 
			y+270, 
			"normal 18px monospace"
		);
		addText(
			"MAP", 
			"grey", 
			x+10, 
			y+330, 
			"normal 18px monospace"
		);
		// Blob lets you choose wether to render enemy radar "hotspots" thingies
		let blob = false;
		addText(
			"BLOB", 
			blue, 
			x+10, 
			y+390, 
			"normal 18px monospace"
		);
		let something = 25;
		let g1x = x+100;
		let g1y = y+385;
		// IDK what this is... 
		// makeLinearGraph(g1x, g1y, "Y", 6, 20, 5, 10, 0, something, "white", "white");

		addText("NORM", "white", x+w-44-10, y+90, "normal 18px monospace");
		// 204 / 284 / 182
		addText("204", "white", x+w-33-10, y+110, "normal 18px monospace");

		addText("DEP", "white", x+w-33-10, y+170, "normal 18px monospace");

		addText("MK", blue, x+w-22-10, y+240, "normal 18px monospace");
		
		addText("ASGN>", blue, x+w-55-10, y+310, "normal 18px monospace");

		addText("DCLT>", blue, x+w-55-10, y+380, "normal 18px monospace");

		addCircle("transparent", "grey", x+(w/2), y+w-50, 75);
		addCircle("transparent", "grey", x+(w/2), y+w-50, 150);
		addCircle("transparent", "grey", x+(w/2), y+w-50, 225, d2r(-29), d2r(-152), true);
		addCircle("transparent", "grey", x+(w/2), y+w-50, 225, d2r(152), d2r(29), true);
		addCircle("transparent", "grey", x+(w/2), y+w-50, 300, d2r(-49), d2r(-131), true);
	}
	if (size == 4) {
		let p = position;
		let x = (canvas.width/4)*position;
		let y = (canvas.height/16)*2;
		let w = canvas.width/2;
		let h = (canvas.height/16)*14;
		addText(
			"TSD1", 
			green, 
			x+50-2*11, 
			y+20, 
			"normal 18px monospace"
		);
		// NAV / A-S / 
		addText(
			"NAV", 
			green, 
			x+50-1.5*11, 
			y+40, 
			"normal 18px monospace"
		);
		addText(
			"VIEW", 
			green, 
			x+135-2*11, 
			y+20, 
			"normal 18px monospace"
		);
		addLine(green, x+113, y+22, x+157, y+22);
		// HSD / HGD / VSD
		addText(
			"HSD", 
			blue, 
			x+135-1.5*11, 
			y+40, 
			"normal 18px monospace"
		);
		// addText(
		// 	"REPLY>", 
		// 	blue, 
		// 	x+225-3*11, 
		// 	y+20, 
		// 	"normal 18px monospace"
		// );
		// addText(
		// 	"RESET>", 
		// 	blue, 
		// 	x+315-3*11, 
		// 	y+20, 
		// 	"normal 18px monospace"
		// );

		// Data Link? (DLNK>) maybe
		addText(
			"DLNK>", 
			blue, 
			x+305-3*11, 
			y+20, 
			"normal 18px monospace"
		);
		addText(
			"CNTL>", 
			blue, 
			x+395-2.5*11, 
			y+20, 
			"normal 18px monospace"
		);
		addText(
			"E 4", 
			green, 
			x+395-1*11, 
			y+40, 
			"normal 18px monospace"
		);
		/* OB#1 / F-ALL / IFF / FCR / ESM / IRST */
		/* 
		ESM: Electronic (Warfare) Support Measure

		 */
		addText(
			"F-ALL", 
			"white", 
			x+103-2.5*11, 
			y+58, 
			"normal 14px monospace"
		);

		// I don't actually know what this is, i just thought it might be zoom idk why lmfao.
		let t1x = x+28;
		let t1y = y+90;
		makePolygon([
			[t1x, t1y+30],
			[t1x+10, t1y],
			[t1x+20, t1y+30],
			[t1x, t1y+30]
		], lightBlue, lightBlue);

		let zoom = "40.0";
		addText(
			zoom, 
			blue, 
			x+10, 
			y+150, 
			"normal 18px monospace"
		);
		let t2x = x+28;
		let t2y = y+170;
		makePolygon([
			[t2x, t2y],
			[t2x+10, t2y+30],
			[t2x+20, t2y],
			[t2x, t2y]
		], lightBlue, lightBlue);

		addText(
			"EMC", 
			green, 
			x+10, 
			y+250, 
			"normal 18px monospace"
		);
		addLine(green, x+10, y+252, x+41, y+252);
		let emc = 4
		addText(
			"EMC"+emc, 
			blue, 
			x+10, 
			y+270, 
			"normal 18px monospace"
		);
		addText(
			"MAP", 
			"grey", 
			x+10, 
			y+330, 
			"normal 18px monospace"
		);
		// Blob lets you choose wether to render enemy radar "hotspots" thingies
		let blob = false;
		addText(
			"BLOB", 
			blue, 
			x+10, 
			y+390, 
			"normal 18px monospace"
		);

		let something = 25;
		let g1x = x+100;
		let g1y = y+385;
		// IDK what this is... 
		// makeLinearGraph(g1x, g1y, "Y", 6, 20, 5, 10, 0, something, "white", "white");

		addText(
			"ATK", 
			blue, 
			x+10, 
			y+460, 
			"normal 18px monospace"
		);

		addText(
			"360", 
			blue, 
			x+10, 
			y+480, 
			"normal 18px monospace"
		);

		addText("NORM", "white", x+w-44-10, y+90, "normal 18px monospace");
		// 204 / 284 / 182
		addText("204", "white", x+w-33-10, y+110, "normal 18px monospace");

		addText("DEP", "white", x+w-33-10, y+170, "normal 18px monospace");

		addText("MK", blue, x+w-22-10, y+240, "normal 18px monospace");
		
		addText("ASGN>", blue, x+w-55-10, y+310, "normal 18px monospace");

		addText("DCLT>", blue, x+w-55-10, y+380, "normal 18px monospace");
		addText("ATK", blue, x+w-33-10, y+450, "normal 18px monospace");
		makePolygon([
			[x+50+2*11, y+45],
			[x+w-50-2*11, y+45],
			[x+w-50-2*11, y+h-45],
			[x+50+2*11, y+h-45],
			[x+50+2*11, y+45]
		], "transparent", "gray");
		addCircle("transparent", "grey", x+(w/2), y+(w/2)-65, 75);
		addCircle("transparent", "grey", x+(w/2), y+(w/2)-65, 150);
		addCircle("transparent", "grey", x+(w/2), y+(w/2)-65, 225);
		addCircle("transparent", "grey", x+(w/2), y+(w/2)-65, 300);
	}
}

// UI Navigation Interface / Buttons
function addMobilityButton(direction, position, leftRight) {
	let n = position*10;
	let x, y;
	if (leftRight == "Left") {
		x = ((canvas.width/40)*n);
	}
	if (leftRight == "Right") {
		x = ((canvas.width/40)*(n+10));
	}
	y = ((canvas.height/16)*16);
	// Up Down Left Right
	if (direction == "Up" && leftRight == "Left") {
		makePolygon([
			[x+5, y-5],
			[x+25, y-25],
			[x+45, y-5],
			[x+5, y-5]
		], "transparent", blue, function () {toggleSize(position, direction);});
	}
	if (direction == "Up" && leftRight == "Right") {
		makePolygon([
			[x-5,  y-5],
			[x-25, y-25],
			[x-45, y-5],
			[x-5,  y-5]
		], "transparent", blue, function () {toggleSize(position, direction);});
	}
	if (direction == "Down" && leftRight == "Left") {
		makePolygon([
			[x+5,  y-25],
			[x+25, y-5],
			[x+45, y-25],
			[x+5,  y-25]
		], "transparent", blue, function () {toggleSize(position, direction);});
	}
	if (direction == "Down" && leftRight == "Right") {
		makePolygon([
			[x-5,  y-25],
			[x-25, y-5],
			[x-45, y-25],
			[x-5,  y-25]
		], "transparent", blue, function () {toggleSize(position, direction);});
	}
	if (direction == "Right" && leftRight == "Right") {
		makePolygon([
			[x-25, y-45],
			[x-5, y-25],
			[x-25, y-5],
			[x-25, y-45]
		], "transparent", blue, function () {toggleSize(position, direction);});
	}
	if (direction == "Left" && leftRight == "Left") {
		makePolygon([
			[x+25, y-45],
			[x+5, y-25],
			[x+25, y-5],
			[x+25, y-45]
		], "transparent", blue, function () {toggleSize(position, direction);});
	}
}
function makeNormalBorders(position) {
	let p = position;
	makePolygon([
		[(canvas.width/4)*p, (canvas.height/16)*12],
		[(canvas.width/8)*((2*p)+1), (canvas.height/16)*12],
		[(canvas.width/8)*((2*p)+1), (canvas.height/16)*16],
		[(canvas.width/4)*p, (canvas.height/16)*16],
		[(canvas.width/4)*p, (canvas.height/16)*12]
	], "transparent", "#FFFFFF", function () {switchPortals(p, 0);});
	makePolygon([
		[(canvas.width/4)*(p+1), (canvas.height/16)*12],
		[(canvas.width/8)*((2*(p+1))-1), (canvas.height/16)*12],
		[(canvas.width/8)*((2*(p+1))-1), (canvas.height/16)*16],
		[(canvas.width/4)*(p+1), (canvas.height/16)*16],
		[(canvas.width/4)*(p+1), (canvas.height/16)*12]
	], "transparent", "#FFFFFF", function () {switchPortals(p, 1);});
} 
function makeNormalTabs(position, number) {
	let x = ((canvas.width-1)/4)*position;
	let y = ((canvas.height-1)/16)*16;
	for (let z = 0; z < number; z++) {
		posX = x+(295-(z*76));
		makePolygon([
			[posX-38, y],
			[posX-32, y-30],
			[posX+32, y-30],
			[posX+38, y]
		], "transparent", blue, function () {switchPortals(position, z)});
	}
}
function checkConfig() {
	let c = [];
	for (x of displayConfig) {
		let n = displayConfig.indexOf(x);
		let a = ((n == 0 || n == 2)) ? n+1 : n-1;
		let v = displayConfig[a];
		displayConfig[a] = (x == "Expanded2") ? "Hidden" : v;
	}
	return c;
}
function drawOutline() {
	makePolygon([
		[1, 1],
		[canvas.width-1, 1],
		[canvas.width-1, canvas.height-1],
		[1, canvas.height-1],
		[1, 1]],
		"transparent",
		"white"
	);
	addLine("white", ((canvas.width-1)/2)-0.5, 0, ((canvas.width-1)/2)-0.5, canvas.height-1);
	addLine("white", (0)+0.5, 80-0.5, (canvas.width-1)-0.5, 80-0.5);

	let c = ((displayConfig[0] == "Expanded2" || displayConfig[1] == "Expanded2")) ? "transparent" : "white";
	addLine(c, ((canvas.width-1)/4)-0.5, 80-0.5, ((canvas.width-1)/4)-0.5, canvas.height-1);
	
	let c1 = ((displayConfig[2] == "Expanded2" || displayConfig[3] == "Expanded2")) ? "transparent" : "white";
	addLine(c1, (((canvas.width-1)/4)*3)-0.5, 80-0.5, (((canvas.width-1)/4)*3)-0.5, canvas.height-1);

}
function toggleSize(position, direction) {
	if (direction == "Up" || direction == "Down") {
		if (displayConfig[position] == "Normal") {
			displayConfig[position] = (direction == "Down") ? "Expanded1" : "Normal";
			return;
		}
		if (displayConfig[position] == "Expanded1") {
			displayConfig[position] = (direction == "Up") ? "Normal" : "Normal";
			return;
		}
		let a = (position == 0 || position == 2) ? position+1 : position-1;
		console.log(a);
		if (displayConfig[position] == "Expanded2" || displayConfig[a] == "Expanded2") {
			displayConfig[position] = (direction == "Up") ? "Normal" : "Expanded2";
			displayConfig[a] = (direction == "Up") ? "Normal" : "Hidden";
			return;
		}
		if (displayConfig[a] == "Expanded2") {
			displayConfig[a] = (direction == "Up") ? "Normal" : "Normal";
			return;
		}

	}
	if (direction == "Right") {
		if (displayConfig[position] == "Normal" || displayConfig[position] == "Expanded1") {
			let a = (position == 0 || position == 2) ? true : false;
			displayConfig[position] = (a && direction == "Right") ? "Expanded2" : "Normal";
			return;
		}
	}
	if (direction == "Left") {
		if (displayConfig[position] == "Normal" || displayConfig[position] == "Expanded1") {
			let a = (position == 1 || position == 3) ? true : false;
			displayConfig[position] = (a && direction == "Left") ? "Expanded2" : "Normal";
			return;
		}
	}
	// console.log(position);
	// console.log(direction);
}

// Main Draw Function
function drawPortals() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	checkConfig();
	drawOutline();
	FUEL(0, 1);
	SMS(0, 2);
	addText("ICAWS", blue, ((canvas.width-1)/4)+40, ((canvas.height-1)/16)+10, "normal 30px monospace");
	addImage("/F35Icon0.png", ((canvas.width-1)/4)-40, 7, 56/1.25, 84/1.25);
	for (x of displayPortals) {
		let n = displayPortals.indexOf(x);
		if (displayConfig[n] != "Expanded2" && displayConfig[n] != "Hidden") {
			let b = (n == 0 || n == 2) ? "Right" : "Left";
			addMobilityButton(b, n, b);
		}
		if (displayConfig[n] == "Normal") {
			let a = (n == 0 || n == 2) ? "Left" : "Right";
			addMobilityButton("Down", n, a);
			eval(x[0]+"(2, "+n+");");
			makeNormalBorders(n);
			eval(x[1]+"(1, "+(n*2)+");");
			eval(x[2]+"(1, "+((n*2)+1)+");");
		}
		if (displayConfig[n] == "Expanded1") {
			eval(x[0]+"(3, "+n+");");
			makeNormalTabs(n, 2);
			// setTabs(n, [x[1], x[2]])
			tabs[n][1] = x[1];
			tabs[n][2] = x[2];
			let x1 = ((canvas.width-1)/4)*n;
			let y1 = ((canvas.height-1)/16)*16;
			addText(x[1], blue, x1+219-(x[1].length*11/2), y1-10, "normal 18px monospace");
			addText(x[2], blue, x1+295-(x[2].length*11/2), y1-10, "normal 18px monospace");
			let a = (n == 0 || n == 2) ? "Left" : "Right";
			addMobilityButton("Up", n, a);
		}
		if (displayConfig[n] == "Expanded2") {
			if (n == 0 || n == 2) {
				eval(x[0]+"(4, "+n+");");
				makeNormalTabs(n, 2);
				makeNormalTabs(n+1, 3);
				tabs[n][1] = x[1];
				tabs[n][2] = x[2];
				let e = (n == 0 || n == 2) ? n+1 : n-1
				// console.log(e)
				// console.log(tabs[e]);
				tabs[e][0] = displayPortals[e][0];
				tabs[e][1] = displayPortals[e][1];
				tabs[e][2] = displayPortals[e][2];
				let x1 = ((canvas.width-1)/4)*n;
				let y1 = ((canvas.height-1)/16)*16;
				addText(x[1], blue, x1+219-(x[1].length*11/2), y1-10, "normal 18px monospace");
				addText(x[2], blue, x1+295-(x[2].length*11/2), y1-10, "normal 18px monospace");

				let x2 = ((canvas.width-1)/4)*(n+1);
				let y2 = ((canvas.height-1)/16)*16;
				addText(displayPortals[n+1][0], blue, x2+143-(displayPortals[n+1][0].length*11/2), y2-10, "normal 18px monospace");
				addText(displayPortals[n+1][1], blue, x2+219-(displayPortals[n+1][1].length*11/2), y2-10, "normal 18px monospace");
				addText(displayPortals[n+1][2], blue, x2+295-(displayPortals[n+1][2].length*11/2), y2-10, "normal 18px monospace");

				let a = (n == 0 || n == 2) ? "Left" : "Right";
				let a1 = (n+1 == 0 || n+1 == 2) ? "Left" : "Right";
				addMobilityButton("Up", n, a);
				addMobilityButton("Up", n+1, a1);
			}
			if (n == 1 || n == 3) {
				eval(x[0]+"(4, "+(n-1)+");");
				makeNormalTabs(n-1, 3);
				makeNormalTabs(n, 2);
				tabs[n][1] = x[1];
				tabs[n][2] = x[2];
				let e = (n == 0 || n == 2) ? n+1 : n-1
				// console.log(e)
				// console.log(tabs[e]);
				tabs[e][0] = displayPortals[e][0];
				tabs[e][1] = displayPortals[e][1];
				tabs[e][2] = displayPortals[e][2];
				let x1 = ((canvas.width-1)/4)*n;
				let y1 = ((canvas.height-1)/16)*16;
				addText(x[1], blue, x1+219-(x[1].length*11/2), y1-10, "normal 18px monospace");
				addText(x[2], blue, x1+295-(x[2].length*11/2), y1-10, "normal 18px monospace");

				let x2 = ((canvas.width-1)/4)*(n-1);
				let y2 = ((canvas.height-1)/16)*16;
				addText(displayPortals[n-1][0], blue, x2+143-(displayPortals[n-1][0].length*11/2), y2-10, "normal 18px monospace");
				addText(displayPortals[n-1][1], blue, x2+219-(displayPortals[n-1][1].length*11/2), y2-10, "normal 18px monospace");
				addText(displayPortals[n-1][2], blue, x2+295-(displayPortals[n-1][2].length*11/2), y2-10, "normal 18px monospace");

				let a = (n == 0 || n == 2) ? "Left" : "Right";
				let a1 = (n-1 == 0 || n-1 == 2) ? "Left" : "Right";
				addMobilityButton("Up", n, a);
				addMobilityButton("Up", n-1, a1);
			}

		}
	}
}

// Main Event-Handling Functions
function addEventToCanvas(points, func) {
	let newObj = {"points": points, "func": func};
	events[events.length] = newObj;
}
function resetEvents() {
	events.length = 0;
}
canvas.onclick = function (event) {
	let x = event.pageX*2;
	let y = event.pageY*2;
	// console.log("X: "+x+"\nY: "+y);
	for (a of events) {
		let func = a.func;
		let vs = a.points;
		// console.log(vs);
		if (inside([x, y], vs)) {
			func();
			resetEvents();
		}
	}
	drawPortals();
};

// Main Portal Switching Function
function switchPortals(position, number) {
	let n = position;
	let pType = displayConfig[position];
	if (pType == "Normal") {
		let prevPortal = displayPortals[position][0];
		displayPortals[position][0] = displayPortals[position][number+1];
		displayPortals[position][number+1] = prevPortal;
	} else if (pType == "Expanded1") {
		let prevPortal = displayPortals[position][0];
		displayPortals[position][0] = displayPortals[position][2-number];
		displayPortals[position][2-number] = prevPortal;
	} else {
		if (n == 1 || n == 3) {
			if (displayConfig[n] == "Expanded2") {
				let prevPortal = displayPortals[position][0];
				displayPortals[position][0] = displayPortals[position][2-number];
				displayPortals[position][2-number] = prevPortal;
			}
			if (displayConfig[n-1] == "Expanded2") {
				let prevPortal = displayPortals[position][0];
				displayPortals[position][0] = displayPortals[position][2-number];
				displayPortals[position][2-number] = prevPortal;
				displayConfig[position] = "Expanded2";
				displayConfig[position-1] = "Expanded1";
			}
		}
		if (n == 0 || n == 2) {
			if (displayConfig[n] == "Expanded2") {
				let prevPortal = displayPortals[position][0];
				displayPortals[position][0] = displayPortals[position][2-number];
				displayPortals[position][2-number] = prevPortal;
			}
			if (displayConfig[n+1] == "Expanded2") {
				let prevPortal = displayPortals[position][0];
				displayPortals[position][0] = displayPortals[position][2-number];
				displayPortals[position][2-number] = prevPortal;
				displayConfig[position] = "Expanded2";
				displayConfig[position+1] = "Expanded1";
			}
		}
	}
}


drawPortals();
