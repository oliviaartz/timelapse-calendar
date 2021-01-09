#!/usr/bin/env node

const { createCanvas, loadImage } = require('canvas'),
			fs = require("fs"),
			path = require('path'),
			calWidth = 3840,
			calHeight = 2160,
			cellWidth = calWidth / 7,
			cellHeight = calHeight / 6,
			cellAspect = cellWidth / calHeight,
			monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			// can be 'png', 'jpeg', or 'tiff'
			// 'jpeg' appears to write to storage the fastest, even when there isn't much files savings
			stillImageOutputFormat = 'jpeg',
			canvas = createCanvas(calWidth, calHeight),
			ctx = canvas.getContext('2d'),
			args = process.argv.slice(2)

var calMonth,
		calYear,
		patchDir = __dirname.split(path.sep)

patchDir.pop()
patchDir = patchDir.join(path.sep)

var renderFrame = function (t, month, year) {
	
	// clear the canvas to white
	ctx.beginPath()
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = '#fff'
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	// - what month are we displaying? if unspecified, it’s this month
	if (typeof month === 'undefined' || typeof year === 'undefined') {
		var now = new Date()
	}
	if (typeof month === 'undefined') {
		month = now.getMonth()
	}
	if (typeof year === 'undefined') {
		year = now.getFullYear()
	}
	calMonth = parseInt(month)
	calYear = parseInt(year)

	var monthName = monthNames[month]

	// - write month, year, & time being shown
	drawTime(t)

	// - how many days in this month? for loop for each day in the month…
	var numDays = daysInMonth(month, year)

	// setting up the font for the day numbers
	ctx.font = '54px Helvetica Neue Light'

	var imagePromises = []

	for (var i = 0; i < numDays; i++) {

		// - determine the ltrb for this calendar cell
		const cellLtrb = dayToCalPos(i)
		const dayNum = i

		// - is there a file for that time in the folder for this day?
		const day = String(i+1),
					pathStr = `../images/${month+1}-${day}-${year}/${month+1}-${day.padStart(2, 0)}-${year}-${String(t).padStart(2, 0)}.png`

		if (fs.existsSync(pathStr)) {
			// - if found, draw image w correct srcrect at lrtb then write date in white
			var thisPromise = loadImage(pathStr)
			imagePromises.push(thisPromise)

			thisPromise.then((image) => {

				var sourceAspect = image.width / image.height
				// TODO: Deal with other case, where calendar cells are actually wider than the source image
				if (sourceAspect > cellAspect) {
					var hRatio = image.height / cellHeight
					var scaledSourceWidth = image.width / hRatio
					var sourceXOffset = (scaledSourceWidth - cellWidth) * hRatio / 2
					var sourceWidth = image.width - (sourceXOffset * 2)
				}
				ctx.drawImage(image, sourceXOffset, 0, sourceWidth, image.height, Math.floor(cellLtrb[0]), cellLtrb[1], cellWidth, cellHeight)
				// set context to write the day number in white on top of the frame we just drew
				ctx.fillStyle = '#fff'
				ctx.fillText(dayNum + 1, cellLtrb[0] + 16, cellLtrb[1] + 54)			
			})

		}
		else {
			// - set the context to write the day number in black
			ctx.fillStyle = '#000'
			ctx.fillText(dayNum + 1, cellLtrb[0] + 16, cellLtrb[1] + 54)
		}
	}

	Promise
	.all(imagePromises)
	.then(function() {
		const out = fs.createWriteStream(`../export/${t}.png`)
		const stream = canvas.createPNGStream()
		stream.pipe(out)	
	})
}

var drawTime = function(time) {
	// draw text in black
	ctx.fillStyle = '#000'

	// draw name of month
	ctx.font = 'bold 200px Helvetica Neue'
	ctx.fillText(monthNames[calMonth], 80, 240)

	// measure name of month to the position the text for the year
	var monthWidth = ctx.measureText(monthNames[calMonth] + '   ').width // spaces added to give them breathe

	// draw the year
	ctx.font = '200px Helvetica Neue'
	ctx.fillText(calYear, monthWidth, 240)

	// draw the normal AM/PM time
	ctx.font = 'light 200px Helvetica Neue'
	ctx.fillText(frameNumToTime(time), cellWidth * 5, 240)
}

var dayToCalPos = function(dayNum) {
	var coords = dayToCalCoords(dayNum)
	var ltrb = [coords[0] * cellWidth, coords[1] * cellHeight, (coords[0]+1) * cellWidth, (coords[1]+1) * cellHeight]
	return ltrb
}

var dayToCalCoords = function(dayNum) {
	var d = new Date(calYear, calMonth)
	d.setDate(1)
	var dayOffset = d.getDay()
	var xPos = (dayNum + dayOffset) % 7
	var yPos = Math.floor( (dayNum + dayOffset) / 7 ) + 1
	return [xPos, yPos]
}

var daysInMonth = function(month, year) {
	return new Date(year, month + 1, 0).getDate()
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

renderFrame(args[0], args[1], args[2])