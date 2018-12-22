import rp from 'request-promise'
import cheerio from 'cheerio'

const transform = body => cheerio.load(body)
const titleRegex = /^(.*?): /
const timeRegex = /: \((.*?)\)/
const studyPointRegex = /\(.*(\d+)\)\*?$/

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
          $('p', '#section4').first().text().trim(),
          $('p', '#section4').last().text().trim()
        ],
        'assignments.chairman': { type: 'CHAIRMAN' },
        'assignments.openingPrayer': { type: 'PRAYER' },
        'assignments.gems': { type: 'GEMS', time: '8 min.' },
        'assignments.reader': { type: 'READER' },
        'assignments.closingPrayer': { type: 'PRAYER' }
      }

      // Bible Highlights
      const highlightsText = $('p', '#section2').first().text().trim()
      update['assignments.highlights'] = {
        type: 'HIGHLIGHTS',
        title: highlightsText.replace(/: \(.*\)$/, ''),
        time: timeRegex.exec(highlightsText)[1]
      }

      // Bible Reading
      const bibleReadingP = $('p', '#section2').last()
      const bibleReadingText = bibleReadingP.text().trim()
      update['assignments.bibleReading'] = {
        type: 'BIBLE_READING',
        title: bibleReadingP.find('a.b').text().trim(),
        time: timeRegex.exec(bibleReadingText)[1],
        studyPoint: studyPointRegex.exec(bibleReadingText)[1]
      }

      // Student Talks
      $('p', '#section3').each((i, elem) => {
        const elemText = $(elem).text().trim()
        const title = titleRegex.exec(elemText)[1]
        let type = ''
        if (title.includes('Apply Yourself') || title.includes('Video')) type = 'VIDEO'
        else if (title === 'Initial Call') type = 'INITIAL_CALL'
        else if (title === 'Return Visit') type = 'RETURN_VISIT'
        else if (title === 'Bible Study') type = 'BIBLE_STUDY'
        else if (title === 'Talk') type = 'STUDENT_TALK'
        const updatePath = `assignments.studentTalk${i + 1}`
        update[updatePath] = {
          type,
          title,
          time: timeRegex.exec(elemText)[1]
        }
        if (type && type !== 'VIDEO') update[updatePath].studyPoint = studyPointRegex.exec(elemText)[1]
      })

      // Service Talks & CBS
      $('p', '#section4').each((i, elem) => {
        if (i === 0) return // ignore opening song
        const elemText = $(elem).text().trim()
        const title = titleRegex.exec(elemText)[1]
        if (title === 'Congregation Bible Study') {
          update['assignments.congregationBibleStudy'] = {
            type: 'CONGREGATION_BIBLE_STUDY',
            title,
            time: timeRegex.exec(elemText)[1]
          }
          return false
        } else {
          const updatePath = `assignments.serviceTalk${i}`
          update[updatePath] = {
            type: 'SERVICE_TALK',
            title,
            time: timeRegex.exec(elemText)[1]
          }
        }
      })

      return update
    })
}
