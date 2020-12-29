# Timelapse Calendar

The compositor assembles the timelapse calendar video. It is currently a max patch. The recorder is a tiny NodeJS app. Just run `npm install` in the recorder folder and then `node recorder.js`

---

For the recorder to work with a webcam it relies on `node-webcam`. [As the instructions from `node-webcam` state](https://github.com/chuckfairy/node-webcam), you will need additional software to use the webcam…


### Linux

```
#Linux relies on fswebcam currently
#Tested on ubuntu

sudo apt-get install fswebcam

```

### Mac OSX

```
#Mac OSX relies on imagesnap
#Repo https://github.com/rharder/imagesnap
#Avaliable through brew

brew install imagesnap

```

If you’re using the raspbery pi recorder (`recorder-pi.sh`), this isn't relevant.

---

Before recording a timelapse with the compositor-images.maxpat you'll need to create an "export" folder in this project. *Note that this this is "export" singular. No "s".*
