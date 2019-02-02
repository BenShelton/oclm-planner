// TODO: Probably just worth having one map of talks with all their information
export const ASSIGNMENT_TYPE_MAP = {
  chairman: 'CHAIRMAN',
  openingPrayer: 'PRAYER',
  highlights: 'HIGHLIGHTS',
  gems: 'GEMS',
  bibleReading: 'BIBLE_READING',
  serviceTalk1: 'SERVICE_TALK',
  serviceTalk2: 'SERVICE_TALK',
  congregationBibleStudy: 'CONGREGATION_BIBLE_STUDY',
  reader: 'READER',
  closingPrayer: 'PRAYER'
}

export const PRIVILEGES = [
  { name: 'Chairman', key: 'chairman' },
  { name: 'Highlights', key: 'highlights' },
  { name: 'Gems', key: 'gems' },
  { name: 'Service Talk', key: 'serviceTalk' },
  { name: 'Congregation Bible Study', key: 'congregationBibleStudy' },
  { name: 'Reader', key: 'reader' },
  { name: 'Prayer', key: 'prayer' },
  { name: 'Bible Reading', key: 'bibleReading' },
  { name: 'Ministry Video', key: 'ministryVideo' },
  { name: 'Initial Call', key: 'initialCall' },
  { name: 'Initial Call Assistant', key: 'initialCallAssist' },
  { name: 'Return Visit', key: 'returnVisit' },
  { name: 'Return Visit Assistant', key: 'returnVisitAssist' },
  { name: 'Bible Study', key: 'bibleStudy' },
  { name: 'Bible Study Assistant', key: 'bibleStudyAssist' },
  { name: 'Student Talk', key: 'studentTalk' }
]

export const COLORS = {
  TREASURES: '#5A6A70',
  MINISTRY: '#C18626',
  LIVING: '#961526'
}

export const APPOINTMENTS = ['None', 'Brother', 'Sister', 'Ministerial Servant', 'Elder']

export const GENDERS = ['Male', 'Female']

export const LANGUAGE_GROUPS = ['English', 'Portuguese']

export const WEEK_TYPES = {
  normal: { label: 'Normal', value: 0 },
  assembly: { label: 'Assembly', value: 1 },
  coVisit: { label: 'Circuit Overseer Visit', value: 2 },
  memorial: { label: 'Memorial', value: 3 }
}
