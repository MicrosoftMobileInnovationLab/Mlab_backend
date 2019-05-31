const firebase = require('firebase-admin')
const db = firebase.firestore()
var cors = require('cors')
var bodyParser = require('body-parser')

module.exports = (app) => {
  app.use(cors())
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(bodyParser.json())

  app.post('/api/v1/addProject', (req, res) => {
    // TODO: Verify the generated token.
    try {
      req.body = JSON.parse(req.body)
    } catch (e) {
      console.log(e)
    }
    console.log(req.body)
    var data = Object.assign({ isVerified: false }, {
      title: req.body.title || 'Unknown',
      domain: req.body.domain || 'Unknown domain',
      description: req.body.description || '(No description provided)',
      pptLink: req.body.pptLink || '',
      createdAt: (new Date()).getTime()
    })
    return db.collection('projects').add(data)
      .then(() => {
        console.log('success')
        return res.status(200).json({
          success: true,
          message: 'Project created.'
        })
      })
      .catch((error) => {
        console.log(error)
        return res.status(500).json({
          success: false,
          message: 'Entry not created',
          error: error
        })
      })
  })
}
