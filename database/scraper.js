import rp from 'request-promise'
import cheerio from 'cheerio'

const LANGUAGE_OPTIONS = {
  en: {
    address: 'https://wol.jw.org/en/wol/dt/r1/lp-e/',
    cbsTitle: 'Congregation Bible Study',
    talkRegexes: {
      ministryVideo: /(Apply Yourself|Video)/,
      initialCall: /Initial Call/,
      returnVisit: /Return Visit/,
      bibleStudy: /Bible Study/,
      studentTalk: /Talk/
    },
    bookAbbreviations: {
      jy: 'Jesus - The Way'
    }
  },
  tpo: {
    address: 'https://wol.jw.org/jw-tpo/wol/dt/r296/lp-tpo/',
    cbsTitle: 'Estudo Bíblico de Congregação',
    talkRegexes: {
      ministryVideo: /(Melhore a Sua Leitura|Vídeo)/,
      initialCall: /Contacto Inicial/,
      returnVisit: /Revisita/,
      bibleStudy: /Estudo Bíblico/,
      studentTalk: /Discurso/
    },
    bookAbbreviations: {}
  }
}

const transform = body => cheerio.load(body)
const titleRegex = /^(.*?): /
const timeRegex = /: \((.*?)\)/
const studyPointRegex = /\(.*?(\d+)\)\*?$/
const paragraphSelector = '.pGroup > ul > li > p'

function safeRegex (regex, str) {
  const result = regex.exec(str)
  if (!result) {
    console.warn('Could not run regex on "' + str + '"')
    return ''
  }
  return result[1].trim()
}

export default function scrapeWOL (date, language) {
  const options = LANGUAGE_OPTIONS[language]
  if (!options) throw new Error('Unsupported language')
  const { address, talkRegexes, cbsTitle, bookAbbreviations } = options
  if (!address || !talkRegexes || !cbsTitle || !bookAbbreviations) throw new Error('Language not fully supported')

  const uri = address + date.replace(/-/g, '/')
  return rp({ uri, transform })
    .then($ => {
      // Check schedule is online first
      const weeklyBibleReading = $('#p2 strong', 'header').text()
      if (!weeklyBibleReading) throw new Error('Week not yet available')

      // Load as much static information as possible
      const update = {
        scraped: true,
        weeklyBibleReading,
        songs: [
          $('#p3', '#section1').text().trim(),
          $(paragraphSelector, '#section4').first().text().trim(),
          $(paragraphSelector, '#section4').last().text().trim()
        ],
        'assignments.chairman.text': 'N/A',
        'assignments.chairman.type': 'chairman',
        'assignments.openingPrayer.text': 'N/A',
        'assignments.openingPrayer.type': 'prayer',
        'assignments.gems.text': 'N/A',
        'assignments.gems.type': 'gems',
        'assignments.gems.time': '8 min.',
        'assignments.reader.text': 'N/A',
        'assignments.reader.type': 'reader',
        'assignments.closingPrayer.text': 'N/A',
        'assignments.closingPrayer.type': 'prayer'
      }

      // Bible Highlights
      const highlightsText = $(paragraphSelector, '#section2').first().text().trim()
      const highlightsPath = 'assignments.highlights.'
      update[highlightsPath + 'text'] = highlightsText
      update[highlightsPath + 'type'] = 'highlights'
      update[highlightsPath + 'title'] = highlightsText.replace(/: \(.*\)$/, '')
      update[highlightsPath + 'time'] = safeRegex(timeRegex, highlightsText)

      // Bible Reading
      const bibleReadingP = $(paragraphSelector, '#section2').last()
      const bibleReadingText = bibleReadingP.text().trim()
      const bibleReadingPath = 'assignments.bibleReading.'
      update[bibleReadingPath + 'text'] = bibleReadingText
      update[bibleReadingPath + 'type'] = 'bibleReading'
      update[bibleReadingPath + 'title'] = bibleReadingP.find('a.b').text().trim()
      update[bibleReadingPath + 'time'] = safeRegex(timeRegex, bibleReadingText)
      update[bibleReadingPath + 'studyPoint'] = safeRegex(studyPointRegex, bibleReadingText)

      // Student Talks
      $(paragraphSelector, '#section3').each((i, elem) => {
        const elemText = $(elem).text().trim()
        const title = safeRegex(titleRegex, elemText)
        let type = ''
        if (talkRegexes.ministryVideo.test(title)) type = 'ministryVideo'
        else if (talkRegexes.initialCall.test(title)) type = 'initialCall'
        else if (talkRegexes.returnVisit.test(title)) type = 'returnVisit'
        else if (talkRegexes.bibleStudy.test(title)) type = 'bibleStudy'
        else if (talkRegexes.studentTalk.test(title)) type = 'studentTalk'
        const studentTalkPath = `assignments.studentTalk${i + 1}.`
        update[studentTalkPath + 'text'] = elemText
        update[studentTalkPath + 'type'] = type
        update[studentTalkPath + 'title'] = title
        update[studentTalkPath + 'time'] = safeRegex(timeRegex, elemText)
        if (type && type !== 'ministryVideo') update[studentTalkPath + 'studyPoint'] = safeRegex(studyPointRegex, elemText)
      })

      // Service Talks & CBS
      $(paragraphSelector, '#section4').each((i, elem) => {
        if (i === 0) return // ignore opening song
        const elemText = $(elem).text().trim()
        const title = safeRegex(titleRegex, elemText)
        if (title === cbsTitle) {
          const congregationBibleStudyPath = 'assignments.congregationBibleStudy.'
          const bookInfo = safeRegex(/\) (.*)$/, elemText)
          const bookAbbreviation = safeRegex(/^(\w+)/, bookInfo)
          const bookTitle = bookAbbreviations[bookAbbreviation] || bookAbbreviation
          update[congregationBibleStudyPath + 'text'] = elemText
          update[congregationBibleStudyPath + 'type'] = 'congregationBibleStudy'
          update[congregationBibleStudyPath + 'title'] = bookInfo.replace(bookAbbreviation, bookTitle)
          update[congregationBibleStudyPath + 'time'] = safeRegex(timeRegex, elemText)
          return false // stop loop
        } else {
          const serviceTalkPath = `assignments.serviceTalk${i}.`
          update[serviceTalkPath + 'text'] = elemText
          update[serviceTalkPath + 'type'] = 'serviceTalk'
          update[serviceTalkPath + 'title'] = title
          update[serviceTalkPath + 'time'] = safeRegex(timeRegex, elemText)
        }
      })

      // Prepend the language to each key
      const languagePrefix = language + '.'
      return Object.entries(update)
        .reduce((acc, [k, v]) => Object.assign(acc, { [languagePrefix + k]: v }), {})
    })
}
