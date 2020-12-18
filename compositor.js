inlets = 1
outlets = 3

var imagesByDay = []
var patchDir
var camWidth = 640
var camHeight = 360
var calWidth = 3840
var calHeight = 2160
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var frameNum = 0

var showTime = function (t) {
	var framesFound = []
	
	for ( var i = 0; i < imagesByDay.length; i++ ) {
		possibleImage = imagesByDay[i][t]
		if (possibleImage) {
			framesFound.push(possibleImage)
		}
	}
	frameNum = t
	outlet(0, 'clear')
	drawText()
	drawFrames(framesFound)
	outlet(0, 'bang')
}

var drawText = function(time) {
	var d = new Date()
	var month = monthNames[d.getMonth()]
	
	// jit.lcd method below
	outlet(0, 'moveto', 80, 280)
	outlet(0, 'font', 'Helvetica', 200)
	outlet(0, 'write', month, d.getFullYear(), frameNumToTime(frameNum))

	// outlet(2, 'color', 0., 0., 0., 1.)
	// outlet(2, 'size', 200)
	// var timePos = screenToWorld(80, 280)
	// outlet(2, 'position', timePos[0], timePos[1])
	// outlet(2, 'text', month + ' ' + d.getFullYear() + ' ' + frameNumToTime(frameNum))

	// var numDays = daysInThisMonth()
	// for ( var day = 0; day < numDays; day++ ) {
	// 	post(day)
	// 	post()
	// 	outlet(2, 'position', day * 30, day *30)
	// 	outlet(2, 'text', day)
	
	// }

	outlet(1, 'erase')
	outlet(1, 'bang')
}

var drawFrames = function (frames) {
	for ( var i = 0; i < frames.length; i++ ) {
		var destLtrb = dayToCalPos(frames[i].day)
		outlet(0, 'readpict', 'pictname' + i, frames[i].path)
		outlet(0, 'drawpict', 'pictname' + i, Math.floor(destLtrb[0]), destLtrb[1], Math.ceil(destLtrb[2] - destLtrb[0]), destLtrb[3] - destLtrb[1], 45.7142857143, 0, 548.5714285714)
	}
}

var dayToCalPos = function(dayNum) {
	var d = new Date()
	d.setDate(1)
	var dayOffset = d.getDay()
	var xPos = (dayNum + dayOffset) % 7
	var yPos = Math.floor( (dayNum + dayOffset) / 7 ) + 1
	var cellWidth = calWidth / 7
	var cellHeight = calHeight / 6
	var ltrb = [xPos * cellWidth, yPos * cellHeight, (xPos+1) * cellWidth, (yPos+1) * cellHeight]
	return ltrb
}

var setDirectory = function (dir) {
	patchDir = dir;
}

var loadImages = function () {
	var now = new Date()
	var year = now.getFullYear()
	var month = now.getMonth()+1
	var numDays = daysInThisMonth()

	for ( var i = 0; i < numDays; i++ ) {
		var path = patchDir + 'images/' + month + '-' + (i+1) + '-' + year
		var f = new Folder(path)
		var todaysImages = []
		while (!f.end) {
			var imageNum = f.filename.split('-')
			if(imageNum[3]) {
				imageNum = parseInt(imageNum[3].split('.')[0])
			}
			todaysImages[imageNum] = {
				'path': f.pathname + "/" + f.filename,
				'filename': f.filename,
				'time': imageNum,
				'day': i
			}
			f.next()
		}
		f.close()
		imagesByDay[i] = todaysImages
	}
}

function daysInMonth (month, year) {
	return new Date(year, month, 0).getDate();
}

var daysInThisMonth = function() {
	var now = new Date()
	var year = now.getFullYear()
	var month = now.getMonth()+1
	return daysInMonth(month, year)
}

var frameNumToTime = function(f) {
	var seconds = Math.floor(f * 6)
	var minutes = Math.floor(seconds / 60)
	var hours = Math.floor(minutes / 60)
	var ampm = (hours < 12) ? 'AM' : 'PM'
	
	// make the hours pretty
	hours = hours % 12
	if (hours == 0) {
		hours = 12
	}

	// make the minutes pretty
	minutes = minutes % 60
	minutes = ("0" + minutes).slice(-2)
	return hours + ":" + minutes + ' ' + ampm
}
frameNumToTime.local = 1

var scale = function (input, inMin, inMax, outMin, outMax) {
	var percent = (input - inMin) / (inMax - inMin)
	return percent * (outMax - outMin) + outMin
}
	
var screenToWorld = function (x, y) {
	return [scale(x, 0, 3839, -1.472761, 1.472761),
					scale(y, 0, 2159, 0.828428, -0.828428)]
}