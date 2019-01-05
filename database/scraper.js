import rp from 'request-promise'
import cheerio from 'cheerio'

const transform = body => cheerio.load(body)
const titleRegex = /^(.*?): /
const timeRegex = /: \((.*?)\)/
const studyPointRegex = /\(.*(\d+)\)\*?$/
const paragraphSelector = 'p.su'

export default function scrapeWOL (date) {
  const uri = `https://wol.jw.org/en/wol/dt/r1/lp-e/${date.replace(/-/g, '/')}`
  return rp({ uri, transform })
    .then($ => {
      // Check schedule is online first
      if (!$('#p2').text()) throw new Error('Week not yet available')

      // Load as much static information as possible
      const update = {
        scraped: true,
        bibleReading: $('#p2').text(),
        songs: [
          $('#p3').text().trim(),
          $(paragraphSelector, '#section4').first().text().trim(),
          $(paragraphSelector, '#section4').last().text().trim()
        ],
        'assignments.chairman': { type: 'chairman' },
        'assignments.openingPrayer': { type: 'prayer' },
        'assignments.gems': { type: 'gems', time: '8 min.' },
        'assignments.reader': { type: 'reader' },
        'assignments.closingPrayer': { type: 'prayer' }
      }

      // Bible Highlights
      const highlightsText = $(paragraphSelector, '#section2').first().text().trim()
      update['assignments.highlights'] = {
        type: 'highlights',
        title: highlightsText.replace(/: \(.*\)$/, ''),
        time: timeRegex.exec(highlightsText)[1]
      }

      // Bible Reading
      const bibleReadingP = $(paragraphSelector, '#section2').last()
      const bibleReadingText = bibleReadingP.text().trim()
      update['assignments.bibleReading'] = {
        type: 'bibleReading',
        title: bibleReadingP.find('a.b').text().trim(),
        time: timeRegex.exec(bibleReadingText)[1],
        studyPoint: studyPointRegex.exec(bibleReadingText)[1]
      }

      // Student Talks
      $(paragraphSelector, '#section3').each((i, elem) => {
        const elemText = $(elem).text().trim()
        const title = titleRegex.exec(elemText)[1]
        let type = ''
        if (title.includes('Apply Yourself') || title.includes('Video')) type = 'ministryVideo'
        else if (title.includes('Initial Call')) type = 'initialCall'
        else if (title.includes('Return Visit')) type = 'returnVisit'
        else if (title.includes('Bible Study')) type = 'bibleStudy'
        else if (title.includes('Talk')) type = 'studentTalk'
        const updatePath = `assignments.studentTalk${i + 1}`
        update[updatePath] = {
          type,
          title,
          time: timeRegex.exec(elemText)[1]
        }
        if (type && type !== 'ministryVideo') update[updatePath].studyPoint = studyPointRegex.exec(elemText)[1]
      })

      // Service Talks & CBS
      $(paragraphSelector, '#section4').each((i, elem) => {
        if (i === 0) return // ignore opening song
        const elemText = $(elem).text().trim()
        const title = titleRegex.exec(elemText)[1]
        if (title === 'Congregation Bible Study') {
          update['assignments.congregationBibleStudy'] = {
            type: 'congregationBibleStudy',
            title,
            time: timeRegex.exec(elemText)[1]
          }
          return false
        } else {
          const updatePath = `assignments.serviceTalk${i}`
          update[updatePath] = {
            type: 'serviceTalk',
            title,
            time: timeRegex.exec(elemText)[1]
          }
        }
      })

      return update
    })
}
