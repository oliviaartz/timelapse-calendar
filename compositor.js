inlets = 1
outlets = 3

var imagesByDay = []
var patchDir
var calWidth = 3840
var calHeight = 2160
var cellWidth = calWidth / 7
var cellHeight = calHeight / 6
var cellAspect = cellWidth / calHeight

var calSketch = new Sketch(calWidth, calHeight)
calSketch.default2d()

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

	with (calSketch) {
		glclearcolor(1., 1., 1., 1.)            
		glclear();            
		moveto(0.5,0.5);     
		glcolor(0,1,1,1);
		circle(0.25);
	}

	drawText()
	// drawFrames(framesFound)
	
	var outputImage = new Image(calSketch)
	outputImage.tonamedmatrix('ts-cal')
	outlet(0, 'bang')
}

var drawText = function(time) {
	var d = new Date()
	var month = monthNames[d.getMonth()]
	

	with (calSketch) {
		moveto(screentoworld(80, 280))
		font('Helvetica')
		fontsize(200)
		text(month + ' ' + d.getFullYear() + ' ' + frameNumToTime(frameNum))
	}
	// jit.lcd method below
	// outlet(0, 'moveto', 80, 280)
	// outlet(0, 'font', 'Helvetica', 200)
	// outlet(0, 'write', month, d.getFullYear(), frameNumToTime(frameNum))

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

	// outlet(1, 'erase')
	// outlet(1, 'bang')
}

var drawFrames = function (frames) {
	for ( var i = 0; i < frames.length; i++ ) {
		var destLtrb = dayToCalPos(frames[i].day)
		var img = new Image(frames[i].path)

		var sourceAspect = img.size[1] / img.size[0]
		// TODO: Deal with other case, where calendar cells are actually wider than the source image
		if (sourceAspect > cellAspect) {
			var hRatio = img.size[1] / cellHeight
			var scaledSourceWidth = img.size[0] / hRatio
			var sourceXOffset = (scaledSourceWidth - cellWidth) * hRatio / 2
			var sourceWidth = img.size[0] - (sourceXOffset * 2)
		}

		outlet(0, 'readpict', 'pictname' + i, frames[i].path)
		outlet(0, 'drawpict', 'pictname' + i, Math.floor(destLtrb[0]), destLtrb[1], Math.ceil(destLtrb[2] - destLtrb[0]), destLtrb[3] - destLtrb[1], sourceXOffset, 0, sourceWidth, img.size[1])
	}
}

var dayToCalPos = function(dayNum) {
	var d = new Date()
	d.setDate(1)
	var dayOffset = d.getDay()
	var xPos = (dayNum + dayOffset) % 7
	var yPos = Math.floor( (dayNum + dayOffset) / 7 ) + 1
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
			var path = f.pathname + "/" + f.filename
			todaysImages[imageNum] = {
				'path': path,
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