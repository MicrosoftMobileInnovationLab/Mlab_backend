const firebase = require('firebase-admin')
const db = firebase.firestore()
const token = require('@middleware/token')

module.exports = (app) => {
  app.post('/api/v1/newProject', token.verifyToken, (req, res) => {
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
