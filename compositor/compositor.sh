#!/usr/bin/env node

const fs = require("fs"),
			path = require('path')

var imagesByDay = []
var patchDir = __dirname.split(path.sep)
patchDir.pop()
patchDir = patchDir.join(path.sep)
var calWidth = 3840
var calHeight = 2160
var cellWidth = calWidth / 7
var cellHeight = calHeight / 6
var cellAspect = cellWidth / calHeight

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var frameNum = 0

// can be 'png', 'jpeg', or 'tiff'
// 'jpeg' appears to write to disk the fastest, even when there isn't much files savings
var stillImageOutputFormat = 'jpeg'

var showTime = function (t) {
	var framesFound = []
	
	for ( var i = 0; i < imagesByDay.length; i++ ) {
		possibleImage = imagesByDay[i][t]
		if (possibleImage) {
			framesFound.push(possibleImage)
		}
	}
	frameNum = t
	outlet(1, 'clear')
	drawText()
	drawFrames(framesFound)
	outlet(1, 'bang')
}

var exportTime = function (t) {
	showTime(t)
	outlet(0, 'exportimage', 'export/' + t, stillImageOutputFormat)
}

var drawText = function(time) {
	var d = new Date()
	var month = monthNames[d.getMonth()]
	
	// jit.lcd method below
	outlet(1, 'frgb', 0, 0, 0)
	outlet(1, 'moveto', 80, 240)
	outlet(1, 'font', 'Helvetica Neue', 200)
	outlet(1, 'textface', 'bold')
	outlet(1, 'write', month)
	outlet(1, 'textface', 'normal')
	outlet(1, 'write', d.getFullYear())
	outlet(1, 'font', 'Helvetica', 200)
	outlet(1, 'font', 'Helvetica Neue Ultralight', 200)
	outlet(1, 'moveto', cellWidth * 5, 240)
	outlet(1, 'write', frameNumToTime(frameNum))

	outlet(1, 'frgb', 0, 0, 0)
	outlet(1, 'font', 'Helvetica Neue Light', 54)
	var numDays = daysInThisMonth()
	for ( var day = 0; day < numDays; day++ ) {
		var calCoords = dayToCalCoords(day)
		outlet(1, 'moveto', (calCoords[0] * cellWidth) + 16, (calCoords[1] * cellHeight) + 54)
		outlet(1, 'write', day + 1)
	}

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

		outlet(1, 'readpict', 'pictname' + i, frames[i].path)
		outlet(1, 'drawpict', 'pictname' + i, Math.floor(destLtrb[0]), destLtrb[1], Math.ceil(destLtrb[2] - destLtrb[0]), destLtrb[3] - destLtrb[1], sourceXOffset, 0, sourceWidth, img.size[1])
		outlet(1, 'frgb', 255, 255, 255)
		var calCoords = dayToCalCoords(frames[i].day)
		outlet(1, 'moveto', (calCoords[0] * cellWidth) + 16, (calCoords[1] * cellHeight) + 54)
		outlet(1, 'write', frames[i].day + 1)


	}
}

var dayToCalPos = function(dayNum) {
	var coords = dayToCalCoords(dayNum)
	var ltrb = [coords[0] * cellWidth, coords[1] * cellHeight, (coords[0]+1) * cellWidth, (coords[1]+1) * cellHeight]
	return ltrb
}

var dayToCalCoords = function(dayNum) {
	var d = new Date()
	d.setDate(1)
	var dayOffset = d.getDay()
	var xPos = (dayNum + dayOffset) % 7
	var yPos = Math.floor( (dayNum + dayOffset) / 7 ) + 1
	return [xPos, yPos]
}

var loadImages = function () {
	var now = new Date()
	var year = now.getFullYear()
	var month = now.getMonth()+1
	var numDays = daysInThisMonth()

	for ( var i = 0; i < numDays; i++ ) {
		var dayPath = patchDir + '/images/' + month + '-' + (i+1) + '-' + year
		// console.log(dayPath)
		fs.readdir(dayPath, function (err, files) {
			if (err) {
				// console.error("Could not list the directory.", err);
			}
			else {
				var todaysImages = []
				files.forEach(function (file) {
					// console.log(dayPath, file)
					var nameSplit = file.split('-')
					var fileMonth = parseInt(nameSplit[0])
					var fileDay = parseInt(nameSplit[1])
					var fileYear = parseInt(nameSplit[2])
					var imageNum = parseInt(nameSplit[3].split('.')[0])
					todaysImages[imageNum] = {
						'path': patchDir + "/images/" + fileMonth + "-" + fileDay + "-" + fileYear + "/" + file,
						'filename': file,
						'time': imageNum,
						'day': fileDay
					}
					// console.log(fileDay, todaysImages)
					// console.log(imagesByDay, fileDay, todaysImages)

				})
				console.log(todaysImages)
				// imagesByDay[i] = todaysImages

				// console.log(imagesByDay)

			}

	
		})

	}
	console.log(imagesByDay)
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

var makeDirectory = function(dir) {
	fs.mkdir(dir, { recursive: true }, (error) => {
		if (error) {
			console.error('An error occurred: ', error)
		} else {
			// console.log('Your directory is made!')
		}
	})
}

makeDirectory('../export')

loadImages()
console.log(imagesByDay)