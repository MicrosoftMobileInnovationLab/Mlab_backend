// var verifyToken = require('./../../middleware/verifyToken').verifyToken

module.exports = (app) => {
  app.get('/api/v1/helloWorld', (req, res) => {
    res.send('Hello ' + req.usn + ' from Firebase!')
  })
}
