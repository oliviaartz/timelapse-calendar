const Max = require('max-api')
const fs = require("fs")

var makeDirectory = function(dir) {
	fs.mkdir(dir, { recursive: true }, (error) => {
		if (error) {
			console.error('An error occurred: ', error)
		} else {
			console.log('Your directory is made!')
		}
	})
}

Max.addHandler("mkdir", (msg) => {
	makeDirectory( msg )
}) 