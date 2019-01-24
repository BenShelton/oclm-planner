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

function getAssigneeName (assignee, defaultValue = '') {
  if (!assignee) return defaultValue
  const idMap = store.getters['congregation/idMap']
  const mappedAssignee = idMap[assignee]
  return mappedAssignee ? mappedAssignee.name : defaultValue
}

function getAssignmentTitle (assignment) {
  const { title, time } = assignment
  return `${title} (${time})`
}

function getScheduleAssignees (assignment) {
  let assignees = getAssigneeName(assignment.assignee, '-')
  if (['initialCall', 'returnVisit', 'bibleStudy'].includes(assignment.type)) {
    assignees += ' / ' + getAssigneeName(assignment.assistant, '-')
  }
  return assignees
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
      [setTime('7:00'), songs[0], 'Prayer:', getScheduleAssignees(openingPrayer), addTime(5)],
      [timer, 'Opening Comments (3 min.)', 'Chairman:', getScheduleAssignees(chairman), addTime(3)]
    ]))

    // TREASURES Section
    stack.push(createScheduleSubheader('TREASURES FROM GOD\'S WORD', COLORS.TREASURES))
    const bibleReadingTitle = `Bible Reading (${bibleReading.time}): ${bibleReading.title}`
    stack.push(createScheduleTable(COLORS.MINISTRY, [
      [timer, getAssignmentTitle(highlights), null, getScheduleAssignees(highlights), addTime(highlights.time)],
      [timer, 'Digging for Spiritual Gems (10 min.)', null, getScheduleAssignees(gems), addTime(gems.time)],
      [timer, bibleReadingTitle, null, getScheduleAssignees(bibleReading), addTime(bibleReading.time)]
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
      ministryTableRows.push([timer, getAssignmentTitle(studentTalk), assigneeTitle, getScheduleAssignees(studentTalk), addTime(studentTalk.time)])
    }
    stack.push(createScheduleTable(COLORS.MINISTRY, ministryTableRows, true))

    // LIVING Section
    stack.push(createScheduleSubheader('LIVING AS CHRISTIANS', COLORS.LIVING))
    const livingTableRows = [
      [setTime('7:47'), songs[1], null, null, addTime(5)],
      [timer, getAssignmentTitle(serviceTalk1), null, getScheduleAssignees(serviceTalk1), addTime(serviceTalk1.time)],
      null
    ]
    if (serviceTalk2) livingTableRows[2] = [timer, getAssignmentTitle(serviceTalk2), null, getScheduleAssignees(serviceTalk2), addTime(serviceTalk2.time)]
    livingTableRows.push(
      [timer, 'Congregation Bible Study (30 min.)', 'Conductor:', getScheduleAssignees(congregationBibleStudy), addTime(30)],
      [null, congregationBibleStudy.title, 'Reader:', getScheduleAssignees(reader), null],
      [timer, 'Review/Preview/Announcements (3 min.)', 'Chairman:', getScheduleAssignees(chairman), addTime(3)],
      [timer, songs[2], 'Prayer:', getScheduleAssignees(closingPrayer), addTime(5)]
    )
    const livingTable = createScheduleTable(COLORS.LIVING, livingTableRows)
    Object.assign(livingTable.table.body[3][1], { rowSpan: 2 })
    stack.push(livingTable)
    stack.push(createScheduleSeparator())
  })

  return pdfMake.createPdf(docDefinition)
}

function createSlip (assignment, date = '') {
  const { title, type, assignee, assistant, studyPoint } = assignment || {}
  const [y, m, d] = date.split('-')
  const prettyDate = [d, MONTHS[+m - 1], y].join(' ')
  return {
    width: '50%',
    margin: [32, 32, 32, 32],
    stack: [
      {
        text: 'OUR CHRISTIAN LIFE AND MINISTRY MEETING ASSIGNMENT',
        fontSize: 14,
        alignment: 'center',
        bold: true,
        margin: [0, 0, 0, 12]
      },
      createAssignmentInput('Name:', getAssigneeName(assignee)),
      createAssignmentInput('Assistant:', getAssigneeName(assistant)),
      createAssignmentInput('Date:', prettyDate),
      createAssignmentInput('Study Point:', studyPoint),
      {
        fontSize: 10,
        margin: [0, 8, 0, 16],
        columns: [
          {
            width: '55%',
            stack: [
              { text: 'Assignment:', bold: true, margin: [0, 0, 0, 1] },
              createAssignmentCheckbox('Bible reading', type === 'bibleReading'),
              createAssignmentCheckbox('Initial call', type === 'initialCall'),
              createAssignmentCheckbox('First return visit', title === 'First Return Visit'),
              createAssignmentCheckbox('Second return visit', title === 'Second Return Visit'),
              { text: 'To be given in:', bold: true, margin: [0, 4, 0, 1] },
              createAssignmentCheckbox('Main hall', !!assignment),
              createAssignmentCheckbox('Auxiliary classroom 1'),
              createAssignmentCheckbox('Auxiliary classroom 2')
            ]
          },
          {
            width: '45%',
            margin: [0, 12, 0, 0],
            stack: [
              createAssignmentCheckbox('Bible study', type === 'bibleStudy'),
              createAssignmentCheckbox('Talk', type === 'studentTalk'),
              createAssignmentCheckbox('Other: ..................')
            ]
          }
        ]
      },
      {
        fontSize: 9,
        alignment: 'justify',
        text: [
          { text: 'Note to student: ', bold: true },
          { text: 'The source material and study point for your assignment can be found in the ' },
          { text: 'Life and Ministry Meeting Workbook. ', italics: true },
          { text: 'Please work on the listed study point, which is discussed in the ' },
          { text: 'Teaching ', italics: true },
          { text: 'brochure. You should ' },
          { text: 'bring your brochure, either printed or electronic, to the Life and Ministry Meeting.', bold: true }
        ]
      },
      {
        text: 'S-89-E      10/18',
        fontSize: 10,
        margin: [0, 8, 0, 0]
      }
    ]
  }
}

function createAssignmentInput (title, content) {
  return {
    margin: [0, 0, 0, 8],
    columns: [
      {
        width: 'auto',
        text: title,
        bold: true,
        fontSize: 12,
        margin: [0, 1, 4, 0]
      },
      {
        width: '*',
        fontSize: 10,
        layout: {
          hLineStyle: () => ({ dash: { length: 2, space: 1 } }),
          paddingTop: () => 0,
          paddingBottom: () => 0
        },
        table: {
          heights: 11,
          widths: ['*'],
          body: [[{
            text: content,
            border: [false, false, false, true]
          }]]
        }
      }
    ]
  }
}

function createAssignmentCheckbox (title, checked) {
  const checkbox = {
    width: 28,
    canvas: [{ type: 'rect', x: 12, y: 2, w: 8, h: 8, lineWidth: 1 }]
  }
  if (checked) {
    checkbox.canvas.push(
      { type: 'line', x1: 14, y1: 5, x2: 15, y2: 8, lineWidth: 1 },
      { type: 'line', x1: 15, y1: 8, x2: 18, y2: 4, lineWidth: 1 }
    )
  }
  return {
    columns: [
      checkbox,
      { text: title }
    ]
  }
}

export function generateAssignmentSlips (weeks, month) {
  // variables for the cutting lines
  const pageWidth = 595
  const pageHeight = 842
  const midX = pageWidth / 2
  const midY = pageHeight / 2
  const lineLength = 36

  const content = []
  const docDefinition = {
    info: {
      title: 'Assignment Slips ' + month,
      author: 'OCLM Planner',
      subject: 'Assignment Slips'
    },
    pageMargins: [0, 0, 0, 0],
    pageSize: 'A4',
    pageBreakBefore: ({ id }) => id === 'TopSlips',
    background: {
      canvas: [
        // we don't go all the way to the edge otherwise it can overflow and not show anything
        { type: 'line', x1: 1, y1: midY, x2: lineLength, y2: midY, lineWidth: 0.5 }, // left
        { type: 'line', x1: midX, y1: 1, x2: midX, y2: lineLength, lineWidth: 0.5 }, // top
        { type: 'line', x1: pageWidth - lineLength, y1: midY, x2: pageWidth - 1, y2: midY, lineWidth: 0.5 }, // right
        { type: 'line', x1: midX, y1: pageHeight - lineLength, x2: midX, y2: pageHeight - 1, lineWidth: 0.5 } // bottom
      ]
    },
    content
  }

  const slips = []
  const VALID_TYPES = ['bibleReading', 'initialCall', 'returnVisit', 'bibleStudy', 'studentTalk']
  for (const week of weeks) {
    const { assignments } = week
    for (let i = 0; i <= 4; i++) {
      // treat index 0 as the bibleReading, else extract a student talk
      const talk = i === 0 ? assignments.bibleReading : assignments['studentTalk' + i]
      if (!talk || !(VALID_TYPES.includes(talk.type))) continue
      slips.push(createSlip(talk, week.date))
    }
  }

  // complete the last page so there aren't blank slips
  while (slips.length % 4 !== 0) {
    slips.push(createSlip())
  }

  // arrange the slips
  let slipPageNum = 1
  while (slips.length) {
    const slipPage = slips.splice(0, 4)
    content.push(
      { columns: [slipPage[0], slipPage[1]], id: slipPageNum !== 1 ? 'TopSlips' : '' },
      { columns: [slipPage[2], slipPage[3]] }
    )
    slipPageNum++
  }

  return pdfMake.createPdf(docDefinition)
}
