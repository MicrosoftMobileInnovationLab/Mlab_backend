module.exports = (app) => {
  /**
     * Sign Up Endpoint
     */
  app.post('/api/v1/signup', (req, res) => {
    var usn = req.body.usn
    var email = req.body.email && req.body.email.trim()

    return res.json({
      usn, email
    })
  })
}
