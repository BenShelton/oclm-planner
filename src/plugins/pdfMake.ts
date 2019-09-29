import pdfMake, { Content, CurrentNode, TDocumentDefinitions } from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

import { congregationModule, scheduleModule } from '@/store'
import { COLORS, WEEK_TYPES } from '@/constants'
import {
  IScheduleTranslationMap,
  IAssignmentTranslationMap,
  IScheduleAssignment,
  IScheduleWeekAssignments,
  PDFGenerator,
  Languages,
  ScheduleWeek
} from 'types'

type ScheduleTableRow = [string | null, string, string | null, string | null, string | null, boolean?] | null

pdfMake.vfs = pdfFonts.pdfMake.vfs

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const TPO_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const SCHEDULE_TRANSLATIONS: { [key in Languages]: IScheduleTranslationMap } = {
  en: {
    startTime: '7:00',
    group: 'CANTON CONGREGATION',
    header: 'Our Christian Life & Ministry Schedule',
    week: 'WEEK',
    weeks: 'WEEKS',
    months: EN_MONTHS,
    weeklyBibleReading: 'WEEKLY BIBLE READING',
    assemblyWeek: 'Assembly Week',
    memorialWeek: 'Memorial Week',
    noMeeting: 'No Meeting',
    timeOff: 'Time Off',
    prayer: 'Prayer',
    openingComments: 'Opening Comments',
    chairman: 'Chairman',
    treasures: 'TREASURES FROM GOD\'S WORD',
    bibleReading: 'Bible Reading',
    gems: 'Digging for Spiritual Gems',
    ministry: 'APPLY YOURSELF TO THE FIELD MINISTRY',
    student: 'Student',
    assistant: 'Assistant',
    living: 'LIVING AS CHRISTIANS',
    review: 'Review/Preview/Announcements',
    co: 'Circuit Overseer',
    cbs: 'Congregation Bible Study',
    conductor: 'Conductor',
    reader: 'Reader'
  },
  tpo: {
    startTime: '19:00',
    group: 'GROUP PORTUGUÊS',
    header: 'Programação de reunião de semana',
    week: 'SEMANA',
    weeks: 'SEMANAS',
    months: TPO_MONTHS,
    weeklyBibleReading: 'LEITURA SEMANAL DA BÍBLIA',
    assemblyWeek: 'Semana da Assembleía',
    memorialWeek: 'Semana da Comemoração',
    noMeeting: 'Não Reunião',
    timeOff: 'Fim',
    prayer: 'Oração',
    openingComments: 'Comentários iniciais',
    chairman: 'Presidente',
    treasures: 'TESOUROS DA PALAVRA DE DEUS',
    bibleReading: 'Leitura da Bíblia',
    gems: 'Em busca de pérolas espirituais',
    ministry: 'EMPENHE-SE NO MINISTÉRIO',
    student: 'Estudante',
    assistant: 'Ajudante',
    living: 'VIVER COMO CRISTÃOS',
    review: 'Recapitulação/Antevisão/Anúncios',
    co: 'Superintendente do Circuito',
    cbs: 'Estudo Bíblico de Congregagação',
    conductor: 'Dirigente',
    reader: 'Leitor'
  }
}

const ASSIGNMENT_SLIP_TRANSLATIONS: { [key in Languages]: IAssignmentTranslationMap } = {
  en: {
    verticalPadding: 32,
    defaultRoom: 'mainHall',
    months: EN_MONTHS,
    title: 'OUR CHRISTIAN LIFE AND MINISTRY MEETING ASSIGNMENT',
    name: 'Name',
    assistant: 'Assistant',
    date: 'Date',
    studyPoint: 'Study Point',
    assignment: 'Assignment',
    bibleReading: 'Bible reading',
    initialCall: 'Initial call',
    firstReturnVisit: 'First return visit',
    secondReturnVisit: 'Second return visit',
    first: 'First',
    second: 'Second',
    givenIn: 'To be given in',
    mainHall: 'Main hall',
    class1: 'Auxiliary classroom 1',
    class2: 'Auxiliary classroom 2',
    bibleStudy: 'Bible study',
    studentTalk: 'Talk',
    other: 'Other: ..................',
    note: [
      { text: 'Note to student: ', bold: true },
      { text: 'The source material and study point for your assignment can be found in the ' },
      { text: 'Life and Ministry Meeting Workbook. ', italics: true },
      { text: 'Please work on the listed study point, which is discussed in the ' },
      { text: 'Teaching ', italics: true },
      { text: 'brochure. You should ' },
      { text: 'bring your brochure, either printed or electronic, to the Life and Ministry Meeting.', bold: true }
    ],
    footer: 'S-89-E      10/18'
  },
  tpo: {
    verticalPadding: 28,
    defaultRoom: 'class1',
    months: TPO_MONTHS,
    title: 'DESIGNAÇÃO PARA A REUNIÃO VIDA E MINISTÉRIO CRISTÃOS',
    name: 'Nome',
    assistant: 'Ajudante',
    date: 'Data',
    studyPoint: 'Ponto de Conselho',
    assignment: 'Designação',
    bibleReading: 'Leitura da Bíblia',
    initialCall: 'Contacto Inicial',
    firstReturnVisit: 'Primeira Revisita',
    secondReturnVisit: 'Segunda Revisita',
    first: 'Primeira',
    second: 'Segunda',
    givenIn: 'A ser apresentada no(a)',
    mainHall: 'Salão principal',
    class1: '1a Sala auxiliar',
    class2: '2a Sala auxiliar',
    bibleStudy: 'Estudo Bíblico',
    studentTalk: 'Discurso',
    other: 'Outra: ..................',
    note: [
      { text: 'Nota ao estudante: ', bold: true },
      { text: 'A fonte de matéria para a sua designação encontra-se no ' },
      { text: 'Manual de Atividades da Reunião Vida e Ministério. ', italics: true },
      { text: 'Por favor, trabalhe o ponto de conselho que é designado, e que é abordado na brochura ' },
      { text: 'Melhore a Sua Leitura e o Seu Ensino. ', italics: true },
      { text: 'Deverá ' },
      { text: 'trazer a sua brochura, quer impressa ou em formato electrónico para a Reunião Vida e Ministério.', bold: true }
    ],
    footer: 'S-89-TPO     10/18'
  }
}

let timer: string

function setTime (time: string): string {
  timer = time
  return time
}

function addTime (minutes?: string | number): string {
  if (!minutes) return timer
  const mins = /\d+/.exec(minutes.toString()) || ['0']
  const toAdd = parseInt(mins[0])
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

function getAssigneeName (assignee?: string, defaultValue = ''): string {
  if (!assignee) return defaultValue
  const mappedAssignee = congregationModule.idMap[assignee]
  return mappedAssignee ? mappedAssignee.name : defaultValue
}

function getAssignmentTitle (assignment: IScheduleAssignment): string {
  const { title, time } = assignment
  return `${title} (${time})`
}

function getScheduleAssignees (assignment?: IScheduleAssignment): string {
  if (!assignment) return ''
  if (assignment.stream) return '(Video Stream)'
  let assignees = getAssigneeName(assignment.assignee, '-')
  if (['initialCall', 'returnVisit', 'bibleStudy'].includes(assignment.type)) {
    assignees += ' / ' + getAssigneeName(assignment.assistant, '-')
  }
  return assignees
}

function createScheduleSubheader (text: string, fillColor: string): Content {
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

function createScheduleSeparator (pageStart = false): Content {
  return {
    id: pageStart ? 'PageStartSeparator' : null,
    margin: [0, 0, 0, 8],
    stack: [
      { canvas: [{ type: 'line', x1: -8, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
      { canvas: [{ type: 'line', x1: -8, y1: 3, x2: 515, y2: 3, lineWidth: 1 }] }
    ]
  }
}

function createScheduleTable (markerColor: string, rows: ScheduleTableRow[], expandAssigneeName = false): Content {
  const body = []
  for (const row of rows) {
    const bodyRow: Content[] = []
    body.push(bodyRow)
    if (!row) {
      bodyRow.push({ text: '', colSpan: 7 })
      continue
    }
    const [timeOn, title, assigneeTitle, assigneeName, timeOff] = row
    bodyRow.push(
      { text: timeOn || '' },
      { text: '•', fontSize: 24, color: markerColor, margin: [0, -8] },
      { text: title, paddingLeft: 0, colSpan: expandAssigneeName ? 1 : 2 }
    )
    if (!expandAssigneeName) bodyRow.push({ text: '' })
    bodyRow.push(
      { text: assigneeTitle || '', fontSize: 8, color: '#6F6F6F', alignment: 'right', margin: [0, 1, 0, 0] },
      { text: assigneeName || '', colSpan: expandAssigneeName ? 2 : 1 }
    )
    if (expandAssigneeName) bodyRow.push({ text: '' })
    bodyRow.push({ text: timeOff || '', alignment: 'right' })
  }
  return {
    margin: [0, 2, 0, 8],
    layout: {
      defaultBorder: false,
      fillColor: (rowIndex: number, node: CurrentNode, columnIndex: number) => {
        if (columnIndex > 1) {
          const row = rows[rowIndex]
          if (row && row[5]) return '#E3F2FD' // inherited flag
          if (rowIndex % 2 === 1) return '#DEDEDE' // alternate rows
        }
        return null
      },
      paddingLeft: (columnIndex: number) => columnIndex === 2 ? 0 : 2,
      paddingTop: () => 1,
      paddingBottom: () => 1
    },
    table: {
      widths: [20, 6, 234, 36, 72, 72, 20],
      body
    }
  }
}

export const generateSchedule: PDFGenerator = function (weeks, month) {
  const language = scheduleModule.language
  const translation = SCHEDULE_TRANSLATIONS[language]
  if (!translation) throw new Error('Translations not created for the selected language')
  const stack: Content[] = []
  const docDefinition: TDocumentDefinitions = {
    info: {
      title: 'OCLM Schedule ' + month,
      author: 'OCLM Planner',
      subject: 'OCLM Schedule'
    },
    // @ts-ignore This only accepts the enum which isn't transpiled at runtime
    pageSize: 'A4',
    pageMargins: [36, 62, 36, 44],
    pageBreakBefore: (node?: CurrentNode) => Boolean(node && node.id === 'PageStartSeparator'),
    defaultStyle: {
      fontSize: 9,
      noWrap: true
    },
    header: () => ({
      margin: [44, 36, 44, 0],
      stack: [
        {
          columns: [
            { text: translation.group, width: 160, margin: [0, 8, 0, 0], bold: true },
            { text: translation.header, alignment: 'right', fontSize: 17, bold: true }
          ]
        }
      ]
    }),
    footer (currentPage: number) {
      const startingWeek = currentPage * 2 - 1
      const text = startingWeek === weeks.length ? `${translation.week} ${startingWeek}` : `${translation.weeks} ${startingWeek} & ${startingWeek + 1}`
      return { text, margin: [0, 0, 44, 36], alignment: 'right', bold: true }
    },
    content: [
      { margin: [8, 0], stack }
    ]
  }

  stack.push(createScheduleSeparator(false))
  weeks.forEach((baseWeek: ScheduleWeek, index) => {
    const { date } = baseWeek
    const week = baseWeek[language]
    if (!week) throw new Error('Week not created for the selected language')
    const { type, weeklyBibleReading, songs = [], assignments, coTitle = '', coName = '' } = week

    // Week Title & Information
    if (index > 0 && index % 2 === 0) stack.push(createScheduleSeparator(true))
    const [, month, day] = date.split('-')
    const titleDay = day.charAt(0) === '0' ? day.charAt(1) : day
    const titleMonth = translation.months[+month - 1]
    let titleText = `${titleDay} ${titleMonth}`
    if (weeklyBibleReading) titleText += ` | ${translation.weeklyBibleReading}: ${weeklyBibleReading}`
    stack.push({ text: titleText, fontSize: 14, bold: true })

    // Just add a block of text for assembly weeks
    if (type === WEEK_TYPES.assembly.value || type === WEEK_TYPES.memorial.value) {
      const blockText = type === WEEK_TYPES.assembly.value ? translation.assemblyWeek : translation.memorialWeek
      stack.push({ text: translation.noMeeting, fontSize: 32, bold: true, alignment: 'center', margin: [0, 132, 0, 12] })
      stack.push({ text: blockText, fontSize: 18, alignment: 'center', margin: [0, 0, 0, 132] })
      stack.push(createScheduleSeparator())
      return
    }

    // If no assignments & not a special week then this isn't created
    if (!assignments) throw new Error('Week not created for the selected language')

    // Extract assignments from the correct language
    const baseAssignments = baseWeek.en.assignments
    const assignmentMap = ((Object.entries(assignments) as unknown) as [keyof IScheduleWeekAssignments, IScheduleAssignment][])
      .reduce((acc, [k, v]) => {
        if (!v) return acc
        const assignment: IScheduleAssignment = { ...v }
        if (assignment.inherit) {
          const baseAssignment = baseAssignments && baseAssignments[k]
          if (!baseAssignment) throw new Error('Could not inherit an assignment as it does not exist on the base schedule')
          const { assignee, assistant } = baseAssignment
          Object.assign(assignment, { assignee, assistant })
        }
        return Object.assign(acc, { [k]: assignment })
      }, {}) as IScheduleWeekAssignments
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
    } = assignmentMap

    stack.push({
      columns: [
        { width: '*', text: '' },
        { width: 28, text: translation.timeOff, bold: true, decoration: 'underline', alignment: 'center' }
      ]
    })

    // Introduction Section
    stack.push(createScheduleTable(COLORS.TREASURES, [
      [setTime(translation.startTime), songs[0], translation.prayer + ':', getScheduleAssignees(openingPrayer), addTime(5), openingPrayer.inherit],
      [timer, translation.openingComments + ' (3 min.)', translation.chairman + ':', getScheduleAssignees(chairman), addTime(3), chairman.inherit]
    ]))

    // TREASURES Section
    stack.push(createScheduleSubheader(translation.treasures, COLORS.TREASURES))
    const bibleReadingTitle = `${translation.bibleReading} (${bibleReading.time}): ${bibleReading.title}`
    stack.push(createScheduleTable(COLORS.MINISTRY, [
      [timer, getAssignmentTitle(highlights), null, getScheduleAssignees(highlights), addTime(highlights.time), highlights.inherit],
      [timer, translation.gems + ' (10 min.)', null, getScheduleAssignees(gems), addTime(gems.time), gems.inherit],
      [timer, bibleReadingTitle, null, getScheduleAssignees(bibleReading), addTime(bibleReading.time), bibleReading.inherit]
    ]))

    // MINISTRY Section
    stack.push(createScheduleSubheader(translation.ministry, COLORS.MINISTRY))
    const ministryTableRows: ScheduleTableRow[] = []
    for (let i = 1; i <= 4; i++) {
      const index = 'studentTalk' + i as 'studentTalk1' | 'studentTalk2' | 'studentTalk3' | 'studentTalk4'
      const studentTalk = assignmentMap[index]
      if (!studentTalk) {
        ministryTableRows.push(null)
        continue
      }
      let assigneeTitle = `${translation.student}/${translation.assistant}:`
      if (studentTalk.type === 'ministryVideo') assigneeTitle = ''
      if (studentTalk.type === 'studentTalk') assigneeTitle = translation.student + ':'
      ministryTableRows.push([timer, getAssignmentTitle(studentTalk), assigneeTitle, getScheduleAssignees(studentTalk), addTime(studentTalk.time), studentTalk.inherit])
    }
    stack.push(createScheduleTable(COLORS.MINISTRY, ministryTableRows, true))

    // LIVING Section
    stack.push(createScheduleSubheader(translation.living, COLORS.LIVING))
    setTime(translation.startTime)
    const livingTableRows: ScheduleTableRow[] = [
      [addTime(47), songs[1], null, null, addTime(5), chairman.inherit],
      [timer, getAssignmentTitle(serviceTalk1), null, getScheduleAssignees(serviceTalk1), addTime(serviceTalk1.time), serviceTalk1.inherit],
      null
    ]
    if (serviceTalk2) livingTableRows[2] = [timer, getAssignmentTitle(serviceTalk2), null, getScheduleAssignees(serviceTalk2), addTime(serviceTalk2.time), serviceTalk2.inherit]
    if (type === WEEK_TYPES.coVisit.value) {
      livingTableRows.push(
        [timer, translation.review + ' (3 min.)', translation.chairman + ':', getScheduleAssignees(chairman), addTime(3), chairman.inherit],
        [timer, coTitle + ' (30 min.)', translation.co + ':', coName, addTime(30), true],
        [timer, songs[2], translation.prayer + ':', getScheduleAssignees(closingPrayer), addTime(5), closingPrayer.inherit]
      )
    } else {
      livingTableRows.push(
        [timer, translation.cbs + ' (30 min.)', translation.conductor + ':', getScheduleAssignees(congregationBibleStudy), addTime(30), congregationBibleStudy.inherit],
        [null, congregationBibleStudy.title, translation.reader + ':', getScheduleAssignees(reader), null, reader.inherit],
        [timer, translation.review + ' (3 min.)', translation.chairman + ':', getScheduleAssignees(chairman), addTime(3), chairman.inherit],
        [timer, songs[2], translation.prayer + ':', getScheduleAssignees(closingPrayer), addTime(5), closingPrayer.inherit]
      )
    }
    const livingTable = createScheduleTable(COLORS.LIVING, livingTableRows)
    if (type !== WEEK_TYPES.coVisit.value) {
      const coTalk = livingTable.table && livingTable.table.body && livingTable.table.body[3] && livingTable.table.body[3][1]
      if (!coTalk) throw new Error('Could not reformat according to CO week')
      Object.assign(coTalk, { rowSpan: 2 })
    }
    stack.push(livingTable)
    stack.push(createScheduleSeparator())
  })

  return pdfMake.createPdf(docDefinition)
}

function createAssignmentInput (title: string, content?: string): Content {
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
          heights: [11],
          widths: ['*'],
          body: [[{
            text: content || '',
            border: [false, false, false, true]
          }]]
        }
      }
    ]
  }
}

function createAssignmentCheckbox (title: string, checked = false): Content {
  const checkbox = {
    width: 28,
    canvas: [{ type: 'rect', x: 12, y: 2, w: 8, h: 8, lineWidth: 1 }]
  }
  if (checked) {
    checkbox.canvas.push(
      // @ts-ignore Line types aren't added yet
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

function createSlip (translation: IAssignmentTranslationMap, assignment?: IScheduleAssignment, date = ''): Content {
  const { title = '', type = '', assignee = '', assistant = '', studyPoint = '' } = assignment || {}
  const [y, m, d] = date.split('-')
  const prettyDate = [d, translation.months[+m - 1], y].join(' ')
  return {
    width: '50%',
    margin: [32, translation.verticalPadding, 32, translation.verticalPadding],
    stack: [
      {
        text: translation.title,
        fontSize: 14,
        alignment: 'center',
        bold: true,
        margin: [0, 0, 0, 12]
      },
      createAssignmentInput(translation.name + ':', getAssigneeName(assignee)),
      createAssignmentInput(translation.assistant + ':', getAssigneeName(assistant)),
      createAssignmentInput(translation.date + ':', prettyDate),
      createAssignmentInput(translation.studyPoint + ':', studyPoint),
      {
        fontSize: 10,
        margin: [0, 8, 0, 16],
        columns: [
          {
            width: '55%',
            stack: [
              { text: translation.assignment + ':', bold: true, margin: [0, 0, 0, 1] },
              createAssignmentCheckbox(translation.bibleReading, type === 'bibleReading'),
              createAssignmentCheckbox(translation.initialCall, type === 'initialCall'),
              createAssignmentCheckbox(translation.firstReturnVisit, Boolean(type === 'returnVisit' && title && title.includes(translation.first))),
              createAssignmentCheckbox(translation.secondReturnVisit, Boolean(type === 'returnVisit' && title && title.includes(translation.second))),
              { text: translation.givenIn + ':', bold: true, margin: [0, 4, 0, 1] },
              createAssignmentCheckbox(translation.mainHall, assignment && translation.defaultRoom === 'mainHall'),
              createAssignmentCheckbox(translation.class1, assignment && translation.defaultRoom === 'class1'),
              createAssignmentCheckbox(translation.class2, assignment && translation.defaultRoom === 'class2')
            ]
          },
          {
            width: '45%',
            margin: [0, 12, 0, 0],
            stack: [
              createAssignmentCheckbox(translation.bibleStudy, type === 'bibleStudy'),
              createAssignmentCheckbox(translation.studentTalk, type === 'studentTalk'),
              createAssignmentCheckbox(translation.other)
            ]
          }
        ]
      },
      {
        fontSize: 9,
        alignment: 'justify',
        text: translation.note
      },
      {
        text: translation.footer,
        fontSize: 10,
        margin: [0, 8, 0, 0]
      }
    ]
  }
}

export const generateAssignmentSlips: PDFGenerator = function (weeks, month) {
  // variables for the cutting lines
  const pageWidth = 595
  const pageHeight = 842
  const midX = pageWidth / 2
  const midY = pageHeight / 2
  const lineLength = 36

  const content: Content[] = []
  const docDefinition: TDocumentDefinitions = {
    info: {
      title: 'Assignment Slips ' + month,
      author: 'OCLM Planner',
      subject: 'Assignment Slips'
    },
    pageMargins: [0, 0, 0, 0],
    // @ts-ignore This only accepts the enum which isn't transpiled at runtime
    pageSize: 'A4',
    pageBreakBefore: (node?: CurrentNode) => Boolean(node && node.id === 'TopSlips'),
    background: () => ({
      canvas: [
        // we don't go all the way to the edge otherwise it can overflow and not show anything
        { type: 'line', x1: 1, y1: midY, x2: lineLength, y2: midY, lineWidth: 0.5 }, // left
        { type: 'line', x1: midX, y1: 1, x2: midX, y2: lineLength, lineWidth: 0.5 }, // top
        { type: 'line', x1: pageWidth - lineLength, y1: midY, x2: pageWidth - 1, y2: midY, lineWidth: 0.5 }, // right
        { type: 'line', x1: midX, y1: pageHeight - lineLength, x2: midX, y2: pageHeight - 1, lineWidth: 0.5 } // bottom
      ]
    }),
    content
  }

  const slips = []
  const VALID_TYPES = ['bibleReading', 'initialCall', 'returnVisit', 'bibleStudy', 'studentTalk']
  const language = scheduleModule.language
  const translation = ASSIGNMENT_SLIP_TRANSLATIONS[language]
  if (!translation) throw new Error('Translations not created for the selected language')
  for (const baseWeek of weeks) {
    const { date } = baseWeek
    const week = baseWeek[language]
    if (!week) throw new Error('Week not created for the selected language')
    const { type, assignments } = week
    if (type === WEEK_TYPES.assembly.value || type === WEEK_TYPES.memorial.value) continue
    for (let i = 0; i <= 4; i++) {
      // treat index 0 as the bibleReading, else extract a student talk
      const index = i === 0 ? 'bibleReading' : 'studentTalk' + i as 'bibleReading' | 'studentTalk1' | 'studentTalk2' | 'studentTalk3' | 'studentTalk4'
      const talk: IScheduleAssignment | undefined = assignments[index]
      if (!talk || talk.inherit || !(VALID_TYPES.includes(talk.type))) continue
      slips.push(createSlip(translation, talk, date))
    }
  }

  // complete the last page so there aren't blank slips
  while (slips.length % 4 !== 0) {
    slips.push(createSlip(translation))
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
