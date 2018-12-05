const express = require('express')
const bodyParser = require('body-parser')
const serverless = require('serverless-http')

const setupDB = require('../database')

// Initialize express app
const app = express()
app.use(bodyParser.json())

const router = express.Router()
router.get('/schedule/week/:date', (req, res) => {
  const { date } = req.params
  if (!date) return res.status(400).json({ message: 'No date provided' })
  const defaultWeek = {
    date,
    assignments: {
      chairman: { type: 'CHAIRMAN', assignee: 'John Smith' },
      openingPrayer: { type: 'PRAYER', assignee: 'John Smith' },
      talk: { type: 'TALK', assignee: 'John Smith', title: 'Paul Appeals to Caesar and Then Witnesses to King Herod Agrippa', time: '10 min.' },
      gems: { type: 'GEMS', time: '8 min.' },
      bibleReading: { type: 'BIBLE_READING', assignee: 'John Smith', title: 'Ac 25:1-12', studyPoint: 5, time: '4 min. or less' },
      studentTalk1: { type: 'MINISTRY_VIDEO', assignee: 'John Smith', title: 'First Return Visit Video: (5 min.) Play and discuss the video.', time: '5 min.' },
      studentTalk2: { type: 'RETURN_VISIT', assignee: 'John Smith', title: 'First Return Visit: (3 min. or less) Use the sample conversation. (th study 2)', studyPoint: 2, time: '3 min. or less' },
      studentTalk3: { type: 'RETURN_VISIT', assignee: 'John Smith', title: 'First Return Visit: (4 min. or less) Begin with the sample conversation. Then introduce the Teach Us book. (th study 3)', assistant: 'Ben Jones', studyPoint: 3, time: '4 min. or less' },
      serviceTalk1: { type: 'SERVICE_TALK', assignee: 'John Smith', title: '"The Legalisation of the Work in Quebec": (15 min.) Discussion. Play the video.', time: '15 min.' },
      congregationBibleStudy: { type: 'CONGREGATION_BIBLE_STUDY', assignee: 'John Smith', title: 'Jesus The Way chap. 50', time: '30 min.' },
      reader: { type: 'READER', assignee: 'Ben Jones' },
      closingPrayer: { type: 'PRAYER', assignee: 'Ben Jones' }
    }
  }
  res.json({ week: defaultWeek })
    })
router.post('/schedule/updateAssignment', (req, res) => {

})

// The lambda function route starts with api so account for that here
app.use('/api', router)
app.use((req, res) => {
  res.status(404).send('Not found')
})

// Export lambda handler
exports.handler = serverless(app)

// Test server for sanity checking
// app.listen(9000, () => console.log('Test app listening on port 9000'))
