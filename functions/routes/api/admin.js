const utils = require('./../../utils/userutils')
const firestoreUtils = require('./../../utils/fireStoreutils')

// TODO: Remove the following two dependencies and use firestoreUtils instead
const firebase = require('firebase-admin')
const db = firebase.firestore()

module.exports = (app) => {
  /**
     *  POST a new group
     */
  app.post('/api/v1/newGroup', (req, res) => {
    // TODO: allow only to admins
    try {
      req.body = JSON.parse(req.body)
    } catch (e) {
      console.log(e)
    }
    var groupName = req.body.name
    var userList = req.body.users.split(',').map((element) => { return element.trim().toUpperCase() })
    
    var groupNameEncoded = utils.b64EncodeUnicode(groupName)
    if (db.collection('groups').doc(groupNameEncoded).exists) {
      return firestoreUtils.setDoc('groups', groupNameEncoded, { groupName, userList })
        .then(() => {
          return res.status(200).json({
            success: true,
            message: 'Group created succesfully'
          })
        }, () => {
          return res.status(500).send('Internal Server Error')
        })
    } else {
      return res.status(409).send('Group Name already exists')
    }
  })
}
