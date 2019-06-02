const firebase = require('firebase-admin')
const db = firebase.firestore()
const token = require('@middleware/token')

module.exports = (app) => {
  /**
   * POST a new project idea
   */
  app.post('/api/v1/intern/newProject', token.verifyToken, (req, res) => {
    var data = Object.assign({ isVerified: true }, {
      title: req.body.title || 'Unknown',
      domain: req.body.domain || 'Unknown domain',
      description: req.body.description || '(No description provided)',
      pptLink: req.body.pptLink || '',
      groupName: req.body.groupName || '',
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

  /**
     * GET all project ideas
     */
  app.get('/api/v1/intern/allProjects/:groupName', token.verifyToken, (req, res) => {
    var groupName = req.params.groupName || ''
    if (!req.groups.includes(groupName) && !req.groups.includes('admin')) {
      return res.status(403).send({
        success: false,
        message: 'Forbidden'
      })
    }
    return db.collection('projects').where('groupName', '==', groupName).get()
      .then((snapshot) => {
        var projectList = []
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            projectList.push(doc.data)
          })
        }
        console.log(projectList)
        return res.status(200).json(projectList)
      })
      .catch((err) => {
        return res.status(500).json({
          success: false,
          message: err
        })
      })
  })
}
