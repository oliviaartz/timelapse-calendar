inlets = 1
outlets = 3

var imagesByDay = []
var patchDir
var camWidth = 640
var camHeight = 360
var calWidth = 3840
var calHeight = 2160
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

var showTime = function (t) {
	var framesFound = []
	
	for ( var i = 0; i < imagesByDay.length; i++ ) {
		possibleImage = imagesByDay[i][t]
		if (possibleImage) {
			framesFound.push(possibleImage)
		}
	}
	drawTime(t)	
	outlet(0, 'clear')
	drawFrames(framesFound)
	outlet(0, 'bang')
}

var drawTime = function(time) {
	var d = new Date()
	var month = monthNames[d.getMonth()]
	
	// jit.lcd method below
	// outlet(0, 'moveto', 40, 120)
	// outlet(0, 'font', 'Helvetica', 144)
	// outlet(0, 'write', month, d.getFullYear(), frameNumToTime(time))

	outlet(2, 'color', 0., 0., 0., 1.)
	outlet(2, 'position', -1.4, 0.65)
	outlet(2, 'size', 200)
	outlet(2, 'text', month + ' ' + d.getFullYear() + ' ' + frameNumToTime(time))
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
	const numDays = daysInMonth(month, year)

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
daysInMonth.local = 1

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