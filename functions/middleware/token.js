const utils = require('@utils/userUtils')
const firebase = require('firebase-admin')
const db = firebase.firestore()

var verifyToken = (req, res, next) => {
  var token = (req.body && req.body.token) || (req.query && req.query.token) || (req.headers && req.headers['x-access-token']) || null
  if (!token) {
    return res.status(403).send({
      success: false,
      message: 'No token provided',
      token: token
    })
  }
  token = token.trim()
  var decodedToken = utils.jwtVerify(token)
  // console.log('Token: ' + token)
  return db.collection('sessions').doc(token).get()
    .then(doc => {
      if (!doc.exists || !decodedToken) {
        return res.status(403).send({
          success: false,
          message: 'Forbidden'
        })
      } else {
        // console.log(decodedToken);
        req.token = decodedToken
        req.usn = decodedToken.username
        req.groups = decodedToken.groups
        return next()
      }
    })
    .catch(err => {
      console.log('Error getting document', err)
      return res.status(403).send({
        success: false,
        message: 'Forbidden'
      })
    })
}

var requireGroups = (requiredGroups) => {
  return (req, res, next) => {
    return verifyToken(req, res, () => {
      for (var rg of requiredGroups) {
        if (!req.groups.includes(rg)) {
          return res.status(403).send({
            success: false,
            message: 'Error: Forbidden request.'
          })
        }
      }
      return next()
    })
  }
}

var requireAdmin = () => {
  return requireGroups(['admin'])
}

module.exports = { verifyToken, requireGroups, requireAdmin }
