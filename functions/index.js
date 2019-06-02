const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
require('module-alias/register')

admin.initializeApp()

// Express instance
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

var myJSONparser = (req, res, next) => {
  try {
    req.body = JSON.parse(req.body)
  } catch (e) {
    console.log(e)
  }
  next()
  // console.log(req.body)
}
app.use(myJSONparser)

// Setting up routes
require('./routes/index')(app)

// Run express as a firebase cloud function
exports.app = functions.https.onRequest(app)
