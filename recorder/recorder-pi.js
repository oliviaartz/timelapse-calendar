const Raspistill = require('node-raspistill').Raspistill,
			camera = new Raspistill({
				width: 640,
				height: 360,
				time: 1,
				encoding: 'png'
			}),
			schedule = require('node-schedule'),
			fs = require("fs")

var makeDirectory = function(dir) {
	fs.mkdir(dir, { recursive: true }, (error) => {
		if (error) {
			console.error('An error occurred: ', error)
		} else {
			// console.log('Your directory is made!')
		}
	})
}

var capturePhoto = function() {
	var now = new Date()
			month = now.getMonth()+1,
			day = String(now.getDate()).padStart(2, 0),
			year = now.getFullYear(),
			dateStr = `${month}-${day}-${year}`,
			path = `../images/${dateStr}/`,
			hours = now.getHours(),
			minutes = now.getMinutes(),
			seconds = now.getSeconds(),
			frameNum = parseInt( ((((hours*60)+minutes)*60)+seconds) / 6, 10 ) + 1,
			filename = `${dateStr}-${frameNum}.png`

	makeDirectory(path)
	camera.setOptions({ outputDir: path })
	camera.takePhoto(filename ).then((photo) => {
		console.log( `${filename} created!` );
	})
}

var j = schedule.scheduleJob('*/6 * * * * *', capturePhoto)