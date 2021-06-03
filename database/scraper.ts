import rp from 'request-promise'
import cheerio from 'cheerio'

import { Languages, AssignmentTypes } from 'types'

interface ILanguageOptions {
  months: string[]
  addressConstructor: (date: string) => Promise<string[]>
  inherit: AssignmentTypes[]
  cbsTitle: string
  talkRegexes: {
    ministryVideo: RegExp
    initialCall: RegExp
    returnVisit: RegExp
    bibleStudy: RegExp
    studentTalk: RegExp
    title: RegExp
    time: RegExp
    study: RegExp
  }
  bookAbbreviations: {
    [key: string]: string
  }
}

function getWeek (date: Date): number {
  const dowOffset = 1
  const newYear = new Date(date.getFullYear(), 0, 1)
  let day = newYear.getDay() - dowOffset
  day = (day >= 0 ? day : day + 7)
  const daynum = Math.floor((date.getTime() - newYear.getTime() -
    (date.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1
  let weeknum
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1
    if (weeknum > 52) {
      const nYear = new Date(date.getFullYear() + 1, 0, 1)
      let nday = nYear.getDay() - dowOffset
      nday = nday >= 0 ? nday : nday + 7
      weeknum = nday < 4 ? 1 : 53
    }
  } else {
    weeknum = Math.floor((daynum + day - 1) / 7)
  }
  return weeknum
}

const transform = (body: Buffer): CheerioStatic => cheerio.load(body)

const LANGUAGE_OPTIONS: { [key in Languages]: ILanguageOptions } = {
  en: {
    months: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    addressConstructor: async (date) => {
      // this WOL url, although consistent, seemed to stop being updated in 2020
      let address: string = 'https://wol.jw.org/en/wol/dt/r1/lp-e/' + date.replace(/-/g, '/')
      // alternative scraping of main site by going to the consistent workbook page and extracting the link
      try {
        const [sY, sM, sD] = date.split('-').map(Number)
        const month = LANGUAGE_OPTIONS.en.months[sM - 1]
        const wbMonthUrl = `https://www.jw.org/en/library/jw-meeting-workbook/${month}-${sY}-mwb`
        const $: CheerioStatic = await rp({ uri: wbMonthUrl, transform })
        const regex = new RegExp(`^${month}\\s${sD}.+`)
        const links = $('.synopsis a')
        links.each((i, el) => {
          const text = $(el).text().trim().toLowerCase()
          if (regex.test(text)) {
            address = 'https://www.jw.org' + $(el).attr('href')
            return false
          }
        })
      } catch {}
      return [address]
    },
    inherit: [],
    cbsTitle: 'Congregation Bible Study',
    talkRegexes: {
      ministryVideo: /(Apply Yourself|Video|Increase Your Joy)/,
      initialCall: /Initial Call/,
      returnVisit: /Return Visit/,
      bibleStudy: /Bible Study/,
      studentTalk: /Talk/,
      title: /^(.*?): /,
      time: /: \((.*?)\)/,
      study: /\(.*?(\d+)\)\*?$/
    },
    bookAbbreviations: {
      jy: 'Jesus - The Way',
      rr: 'Pure Worship of Jehovah ​— Restored At Last!'
    }
  },
  tpo: {
    months: ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
    addressConstructor: async (date) => {
      const { months } = LANGUAGE_OPTIONS.tpo
      const [sY, sM, sD] = date.split('-').map(Number)
      const endDate = new Date(date)
      endDate.setUTCDate(endDate.getUTCDate() + 6)
      const [, eM, eD] = endDate.toISOString().split('T')[0].split('-').map(Number)
      const workbookMonth = months[sM - 1]
      const sMonth = workbookMonth.substr(0, 3)
      const workbookWeeks = []
      if (sM === eM) {
        workbookWeeks.push(sD + 'a' + eD + sMonth)
        workbookWeeks.push(sD + '-' + eD + sMonth)
        workbookWeeks.push(sD + 'a' + eD + '-' + sMonth)
        workbookWeeks.push(sD + '-' + eD + '-' + sMonth)
        workbookWeeks.push(sD + 'a' + eD + '-' + workbookMonth)
        // just in case of an accidental english abbreviation instead (e.g. /programa-reuniao-22a28-apr/)
        const englishMonth = LANGUAGE_OPTIONS.en.months[sM - 1].substr(0, 3)
        workbookWeeks.push(sD + 'a' + eD + '-' + englishMonth)
      } else {
        const eMonth = months[eM - 1].substr(0, 3)
        workbookWeeks.push(sD + sMonth + '-' + eD + eMonth)
      }
      return workbookWeeks.map(week => `https://www.jw.org/jw-tpo/publicacoes/jw-manual-de-atividades/mwb-${workbookMonth}-${sY}/programa-reuniao-${week}/`)
    },
    inherit: [
      'serviceTalk'
    ],
    cbsTitle: 'Estudo Bíblico de Congregação',
    talkRegexes: {
      ministryVideo: /(Melhore a Sua Leitura|Vídeo)/,
      initialCall: /Contacto Inicial/,
      returnVisit: /Revisita/,
      bibleStudy: /Estudo Bíblico/,
      studentTalk: /Discurso/,
      title: /^(.*?): /,
      time: /: \((.*?)\)/,
      study: /\(.*?(\d+)\)\*?$/
    },
    bookAbbreviations: {}
  },
  es: {
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    addressConstructor: async (date) => {
      const [y] = date.split('-')
      const week = getWeek(new Date(date))
      return [`https://wol.jw.org/es/wol/meetings/r4/lp-s/${y}/${week}`]
    },
    inherit: [
      'serviceTalk'
    ],
    cbsTitle: 'Estudio bíblico de la congregación',
    talkRegexes: {
      ministryVideo: /(Sea más feliz|Video)/,
      initialCall: /Primera conversación/,
      returnVisit: /Revisita/,
      bibleStudy: /Curso bíblico/,
      studentTalk: /Discurso/,
      title: /^(.*?) \(.*?\):?/,
      time: /\((.*?)\):?/,
      study: /\(.*?(\d+)\)\.$/
    },
    bookAbbreviations: {}
  }
}

const paragraphSelector = '.pGroup > ul > li > p'

function safeRegex (regex: RegExp, str: string): string {
  const result = regex.exec(str)
  if (!result) {
    console.warn('Could not run regex on "' + str + '"')
    return ''
  }
  return result[1].trim()
}

export default async function scrapeWOL (date: string, language: Languages): Promise<{}> {
  const options = LANGUAGE_OPTIONS[language]
  if (!options) throw new Error('Unsupported language')
  const { addressConstructor, inherit, talkRegexes, cbsTitle, bookAbbreviations } = options
  if (!addressConstructor || !inherit || !talkRegexes || !cbsTitle || !bookAbbreviations) throw new Error('Language not fully supported')
  const titleRegex = talkRegexes.title
  const timeRegex = talkRegexes.time
  const studyPointRegex = talkRegexes.study

  // We allow for multiple uris because sometimes the url can change slightly for no obvious reason, so we try them all and catch the first that succeeds
  const uris = await addressConstructor(date)
  return Promise.all(uris.map(async uri => {
    try {
      const val = await rp({ uri, transform })
      return Promise.reject(val)
    } catch (err) {
      return Promise.resolve(err)
    }
  }))
    .then(
      () => {
        console.log('No URIs matched: ', uris)
        throw new Error('404')
      },
      val => Promise.resolve(val)
    )
    .then(($: CheerioStatic) => {
      // Check schedule is online first
      const weeklyBibleReading = $('#p2 strong', 'header').text()
      if (!weeklyBibleReading) throw new Error('404')

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
        'assignments.chairman.inherit': inherit.includes('chairman'),
        'assignments.openingPrayer.text': 'N/A',
        'assignments.openingPrayer.type': 'prayer',
        'assignments.openingPrayer.inherit': inherit.includes('openingPrayer'),
        'assignments.gems.text': 'N/A',
        'assignments.gems.type': 'gems',
        'assignments.gems.inherit': inherit.includes('gems'),
        'assignments.reader.text': 'N/A',
        'assignments.reader.type': 'reader',
        'assignments.reader.inherit': inherit.includes('reader'),
        'assignments.closingPrayer.text': 'N/A',
        'assignments.closingPrayer.type': 'prayer',
        'assignments.closingPrayer.inherit': inherit.includes('closingPrayer')
      }

      // Bible Highlights
      const highlightsText = $(paragraphSelector, '#section2').first().text().trim()
      const highlightsPath = 'assignments.highlights.'
      Object.assign(update, {
        [highlightsPath + 'text']: highlightsText,
        [highlightsPath + 'type']: 'highlights',
        [highlightsPath + 'title']: highlightsText.replace(/: \(.*\)$/, ''),
        [highlightsPath + 'time']: safeRegex(timeRegex, highlightsText),
        [highlightsPath + 'inherit']: inherit.includes('highlights')
      })

      // Gems
      const gemsText = $(paragraphSelector, '#section2').eq(1).text().trim()
      Object.assign(update, {
        'assignments.gems.time': safeRegex(timeRegex, gemsText)
      })

      // Bible Reading
      const bibleReadingP = $(paragraphSelector, '#section2').last()
      const bibleReadingText = bibleReadingP.text().trim()
      const bibleReadingPath = 'assignments.bibleReading.'
      Object.assign(update, {
        [bibleReadingPath + 'text']: bibleReadingText,
        [bibleReadingPath + 'type']: 'bibleReading',
        [bibleReadingPath + 'title']: bibleReadingP.find('a.b, a.jsBibleLink').text().trim(),
        [bibleReadingPath + 'time']: safeRegex(timeRegex, bibleReadingText),
        [bibleReadingPath + 'studyPoint']: safeRegex(studyPointRegex, bibleReadingText),
        [bibleReadingPath + 'inherit']: inherit.includes('bibleReading')
      })

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
        Object.assign(update, {
          [studentTalkPath + 'text']: elemText,
          [studentTalkPath + 'type']: type,
          [studentTalkPath + 'title']: title,
          [studentTalkPath + 'time']: safeRegex(timeRegex, elemText),
          [studentTalkPath + 'inherit']: inherit.includes('studentTalk')
        })
        if (type && type !== 'ministryVideo') Object.assign(update, { [studentTalkPath + 'studyPoint']: safeRegex(studyPointRegex, elemText) })
      })

      // Service Talks & CBS
      $(paragraphSelector, '#section4').each((i, elem) => {
        if (i === 0) return // ignore opening song
        const elemText = $(elem).text().trim()
        const title = safeRegex(titleRegex, elemText)
        if (title === cbsTitle) {
          const congregationBibleStudyPath = 'assignments.congregationBibleStudy.'
          const bookInfo = safeRegex(/\):? (.*)$/, elemText)
          const bookAbbreviation: string = safeRegex(/^(\w+)/, bookInfo)
          const bookTitle: string = bookAbbreviations[bookAbbreviation] || bookAbbreviation
          Object.assign(update, {
            [congregationBibleStudyPath + 'text']: elemText,
            [congregationBibleStudyPath + 'type']: 'congregationBibleStudy',
            [congregationBibleStudyPath + 'title']: bookInfo.replace(bookAbbreviation, bookTitle),
            [congregationBibleStudyPath + 'time']: safeRegex(timeRegex, elemText),
            [congregationBibleStudyPath + 'inherit']: inherit.includes('congregationBibleStudy')
          })
          return false // stop loop
        } else {
          const serviceTalkPath = `assignments.serviceTalk${i}.`
          Object.assign(update, {
            [serviceTalkPath + 'text']: elemText,
            [serviceTalkPath + 'type']: 'serviceTalk',
            [serviceTalkPath + 'title']: title,
            [serviceTalkPath + 'time']: safeRegex(timeRegex, elemText),
            [serviceTalkPath + 'inherit']: inherit.includes('serviceTalk')
          })
        }
      })

      // Prepend the language to each key
      const languagePrefix = language + '.'
      return Object.entries(update)
        .reduce((acc, [k, v]) => Object.assign(acc, { [languagePrefix + k]: v }), {})
    })
}
