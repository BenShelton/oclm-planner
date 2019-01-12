import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

import store from '@/store'
import { COLORS } from '@/constants'

pdfMake.vfs = pdfFonts.pdfMake.vfs

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let timer

function setTime (time) {
  timer = time
  return time
}

function addTime (minutes) {
  const toAdd = parseInt(/\d+/.exec(minutes)[0])
  let [h, m] = timer.split(':').map(Number)
  m += toAdd
  if (m > 59) {
    m -= 60
    h++
  }
  const time = `${h}:${m.toString().padStart(2, '0')}`
  timer = time
  return time
}

function getAssignmentTitle (assignment) {
  const { title, time } = assignment
  return `${title} (${time})`
}

function getAssigneeName (assignment) {
  const idMap = store.getters['congregation/idMap']
  const assignee = idMap[assignment.assignee]
  let name = assignee ? assignee.name : '-'
  if (['initialCall', 'returnVisit', 'bibleStudy'].includes(assignment.type)) {
    const assistant = idMap[assignment.assistant]
    name += ` / ${assistant ? assistant.name : '-'}`
  }
  return name
}

function createScheduleSubheader (text, fillColor) {
  return {
    margin: [-8, 0],
    layout: 'noBorders',
    table: {
      widths: [350],
      body: [
        [{ margin: [12, 0], color: 'white', text, fillColor, bold: true }]
      ]
    }
  }
}

function createScheduleSeparator (pageStart) {
  return {
    id: pageStart ? 'PageStartSeparator' : null,
    margin: [0, 0, 0, 8],
    stack: [
      { canvas: [{ type: 'line', x1: -8, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
      { canvas: [{ type: 'line', x1: -8, y1: 3, x2: 515, y2: 3, lineWidth: 1 }] }
    ]
  }
}

function createScheduleTable (markerColor, rows, expandAssigneeName) {
  const body = []
  for (const row of rows) {
    const bodyRow = []
    body.push(bodyRow)
    if (!row) {
      bodyRow.push({ text: '', colSpan: 7 })
      continue
    }
    const [timeOn, title, assigneeTitle, assigneeName, timeOff] = row
    bodyRow.push(
      { text: timeOn },
      { text: '•', fontSize: 24, color: markerColor, margin: [0, -8] },
      { text: title, paddingLeft: 0, colSpan: expandAssigneeName ? 1 : 2 }
    )
    if (!expandAssigneeName) bodyRow.push({ text: '' })
    bodyRow.push(
      { text: assigneeTitle, fontSize: 8, color: '#6F6F6F', alignment: 'right', margin: [0, 1, 0, 0] },
      { text: assigneeName, colSpan: expandAssigneeName ? 2 : 1 }
    )
    if (expandAssigneeName) bodyRow.push({ text: '' })
    bodyRow.push({ text: timeOff, alignment: 'right' })
  }
  return {
    margin: [0, 2, 0, 8],
    layout: {
      defaultBorder: false,
      fillColor: (rowIndex, node, columnIndex) => rowIndex % 2 === 1 && columnIndex > 1 ? '#DEDEDE' : null,
      paddingLeft: columnIndex => columnIndex === 2 ? 0 : 2,
      paddingTop: () => 1,
      paddingBottom: () => 1
    },
    table: {
      widths: [20, 6, 234, 36, 72, 72, 20],
      body
    }
  }
}

export function generateSchedule (weeks, month) {
  const stack = []
  const docDefinition = {
    info: {
      title: 'OCLM Schedule ' + month,
      author: 'OCLM Planner',
      subject: 'OCLM Schedule'
    },
    pageSize: 'A4',
    pageMargins: [36, 62, 36, 44],
    pageBreakBefore: ({ id }) => id === 'PageStartSeparator',
    defaultStyle: {
      fontSize: 9,
      noWrap: true
    },
    header: {
      margin: [44, 36, 44, 0],
      stack: [
        {
          columns: [
            { text: 'CANTON CONGREGATION', width: 160, margin: [0, 8, 0, 0], bold: true },
            { text: 'Our Christian Life & Ministry Schedule', alignment: 'right', fontSize: 17, bold: true }
          ]
        }
      ]
    },
    footer (currentPage) {
      const startingWeek = currentPage * 2 - 1
      const text = startingWeek === weeks.length ? `WEEK ${startingWeek}` : `WEEKS ${startingWeek} & ${startingWeek + 1}`
      return { text, margin: [0, 0, 44, 36], alignment: 'right', bold: true }
    },
    content: [
      { margin: [8, 0], stack }
    ]
  }

  stack.push(createScheduleSeparator(false))
  weeks.forEach((week, index) => {
    const { date, weeklyBibleReading, songs, assignments } = week
    const {
      openingPrayer,
      chairman,
      highlights,
      gems,
      bibleReading,
      serviceTalk1,
      serviceTalk2,
      congregationBibleStudy,
      reader,
      closingPrayer
    } = assignments

    // Week Title & Information
    if (index > 0 && index % 2 === 0) stack.push(createScheduleSeparator(true))
    const [, month, day] = date.split('-')
    const titleDay = day.charAt(0) === '0' ? day.charAt(1) : day
    const titleMonth = MONTHS[+month - 1]
    stack.push({
      text: `${titleDay} ${titleMonth} | WEEKLY BIBLE READING: ${weeklyBibleReading}`,
      fontSize: 14,
      bold: true
    })
    stack.push({ text: 'Time Off', bold: true, decoration: 'underline', alignment: 'right' })

    // Introduction Section
    stack.push(createScheduleTable(COLORS.TREASURES, [
      [setTime('7:00'), songs[0], 'Prayer:', getAssigneeName(openingPrayer), addTime(5)],
      [timer, 'Opening Comments (3 min.)', 'Chairman:', getAssigneeName(chairman), addTime(3)]
    ]))

    // TREASURES Section
    stack.push(createScheduleSubheader('TREASURES FROM GOD\'S WORD', COLORS.TREASURES))
    const bibleReadingTitle = `Bible Reading (${bibleReading.time}): ${bibleReading.title}`
    stack.push(createScheduleTable(COLORS.MINISTRY, [
      [timer, getAssignmentTitle(highlights), null, getAssigneeName(highlights), addTime(highlights.time)],
      [timer, 'Digging for Spiritual Gems (10 min.)', null, getAssigneeName(gems), addTime(gems.time)],
      [timer, bibleReadingTitle, null, getAssigneeName(bibleReading), addTime(bibleReading.time)]
    ]))

    // MINISTRY Section
    stack.push(createScheduleSubheader('APPLY YOURSELF TO THE FIELD MINISTRY', COLORS.MINISTRY))
    const ministryTableRows = []
    for (let i = 1; i <= 4; i++) {
      const studentTalk = assignments['studentTalk' + i]
      if (!studentTalk) {
        ministryTableRows.push(null)
        continue
      }
      let assigneeTitle = 'Student/Assistant:'
      if (studentTalk.type === 'ministryVideo') assigneeTitle = ''
      if (studentTalk.type === 'studentTalk') assigneeTitle = 'Student:'
      ministryTableRows.push([timer, getAssignmentTitle(studentTalk), assigneeTitle, getAssigneeName(studentTalk), addTime(studentTalk.time)])
    }
    stack.push(createScheduleTable(COLORS.MINISTRY, ministryTableRows, true))

    // LIVING Section
    stack.push(createScheduleSubheader('LIVING AS CHRISTIANS', COLORS.LIVING))
    const livingTableRows = [
      [setTime('7:47'), songs[1], null, null, addTime(5)],
      [timer, getAssignmentTitle(serviceTalk1), null, getAssigneeName(serviceTalk1), addTime(serviceTalk1.time)],
      null
    ]
    if (serviceTalk2) livingTableRows[2] = [timer, getAssignmentTitle(serviceTalk2), null, getAssigneeName(serviceTalk2), addTime(serviceTalk2.time)]
    livingTableRows.push(
      [timer, 'Congregation Bible Study (30 min.)', 'Conductor:', getAssigneeName(congregationBibleStudy), addTime(30)],
      [null, congregationBibleStudy.title, 'Reader:', getAssigneeName(reader), null],
      [timer, 'Review/Preview/Announcements (3 min.)', 'Chairman:', getAssigneeName(chairman), addTime(3)],
      [timer, songs[2], 'Prayer:', getAssigneeName(closingPrayer), addTime(5)]
    )
    const livingTable = createScheduleTable(COLORS.LIVING, livingTableRows)
    Object.assign(livingTable.table.body[3][1], { rowSpan: 2 })
    stack.push(livingTable)
    stack.push(createScheduleSeparator())
  })

  return pdfMake.createPdf(docDefinition)
}

export function generateAssignmentSlips (weeks, month) {
  const stack = []
  const docDefinition = {
    info: {
      title: 'Assignment Slips ' + month,
      author: 'OCLM Planner',
      subject: 'Assignment Slips'
    },
    pageSize: 'A4',
    defaultStyle: {
      noWrap: true
    },
    content: [
      { margin: [8, 0], stack }
    ]
  }

  stack.push('Test Slip')

  return pdfMake.createPdf(docDefinition)
}
