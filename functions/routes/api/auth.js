const utils = require('@utils/userUtils')
const firestoreUtils = require('@utils/fireStoreUtils')

// TODO: Remove the following two dependencies and use firestoreUtils instead
const firebase = require('firebase-admin')
const db = firebase.firestore()

module.exports = (app) => {
  /**
     * GET redirect URL to Pesu Academy auth
     */
  app.get('/api/v1/ssoRedirectUrl', (req, res) => {
    let returnUrl = req.query.returnUrl
    let nonce = utils.generateUuid()
    var data = {
      nonce,
      timestamp: (new Date()).getTime(),
      count: 0
    }
    return firestoreUtils.setDoc('nonce', nonce, data).then(() => {
      let redirectUrl = utils.getRedirectUrl(nonce, returnUrl)
      return res.send(redirectUrl)
    }, () => {
      return res.status(500).send('Internal Server Error')
    })
  })

  /**
     * Sign Up Endpoint
     */
  app.post('/api/v1/signin', (req, res) => {
    var sso = req.body['sso']
    var sig = req.body['sig']
    let decodedSSO = utils.verifySignature(sso, sig)

    if (!decodedSSO) {
      return res.status(403).json({
        success: false,
        message: 'Signature does not match'
      })
    }

    // Check if nonce in decodedSSO exists in database
    let nonce = decodedSSO.nonce
    return db.collection('nonce').doc(nonce).get()
      .then(doc => {
        let tenMinutes = 10 * 60 * 1000
        if (!doc.exists || ((new Date()).getTime() - doc.data().timestamp > tenMinutes) || (doc.data().count > 0)) {
          // TODO: Increase nonce count
          throw Object.assign({}, {
            message: 'Nonce is invalid',
            name: 'Forbidden'
          })
        } else {
          return doc.id
        }
      })
      .then((docId) => {
        // Increase nonce count
        return firestoreUtils.updateDoc('nonce', docId, { count: 1 })
      })
      .then(() => {
        var usn = decodedSSO.username
        var groupsOfTheUser = []
        return db.collection('groups').get().then(snapshot => {
          if (snapshot.empty) { return groupsOfTheUser }
          snapshot.forEach(doc => {
            var userList = doc.data().userList
            if (userList.includes(usn)) {
              groupsOfTheUser.push(doc.data().groupName)
            }
          })
          // console.log(groupsOfTheUser)
          return { groups: groupsOfTheUser }
        })
      })
      .then((groups) => {
        Object.assign(decodedSSO, groups)
        // console.log(decodedSSO)
        let token = utils.generateToken(decodedSSO)
        var data = {
          token,
          timestamp: (new Date()).getTime()
        }
        // console.log("New Token: ", token);
        firestoreUtils.setDoc('sessions', String(token), data)
        return token
      })
      .then((token) => {
        return res.status(200).json({
          success: true,
          message: 'User signed in.',
          token
        })
      })
      .catch((error) => {
        // console.log(error);
        if (error.name === 'Forbidden') {
          return res.status(403).json({
            success: false,
            message: error.message
          })
        }
        return res.status(500).json({
          success: false,
          message: 'Session not created',
          error: error
        })
      })
  })
}
