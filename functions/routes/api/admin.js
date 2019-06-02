const utils = require('@utils/userUtils')
const firestoreUtils = require('@utils/fireStoreUtils')
const token = require('@middleware/token')

// TODO: Remove the following two dependencies and use firestoreUtils instead
const firebase = require('firebase-admin')
const db = firebase.firestore()

module.exports = (app) => {
  /**
  *  POST a new group
  */
  app.post('/api/v1/newGroup', token.requireAdmin(), (req, res) => {
    var groupName = req.body.name
    var userList = req.body.users.split(',').map((element) => { return element.trim().toUpperCase() })

    var groupNameEncoded = utils.b64EncodeUnicode(groupName)
    return db.collection('groups').doc(groupNameEncoded).get()
      .then((doc) => {
        if (!doc.exists) {
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
  })
}
