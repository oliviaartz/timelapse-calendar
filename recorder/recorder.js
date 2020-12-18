const NodeWebcam = require( "node-webcam" ),
			schedule = require('node-schedule'),
			fs = require("fs"),
			opts = {
				width: 640,
				height: 360,
				quality: 100,
				output: "png" // [jpeg, png] support varies
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

var capturePhoto = function() {
	var now = new Date()
			month = now.getMonth()+1,
			day = String(now.getDate()).padStart(2, 0),
			year = now.getFullYear(),
			dateStr = `${month}-${day}-${year}`,
			path = `images/${dateStr}/`,
			hours = now.getHours(),
			minutes = now.getMinutes(),
			seconds = now.getSeconds(),
			frameNum = parseInt( ((((hours*60)+minutes)*60)+seconds) / 6, 10 ) + 1,
			filename = `${dateStr}-${frameNum}`

	makeDirectory(path)
	NodeWebcam.capture( path + filename, opts, function( err, data ) {
		if ( !err ) console.log( `${filename} created!` );
	} )
}

var j = schedule.scheduleJob('*/6 * * * * *', capturePhoto)