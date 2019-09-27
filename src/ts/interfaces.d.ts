import { Genders, Appointments, Languages, Privileges } from './types'

export interface IScheduleWeekLanguage {
  scraped?: boolean
  weeklyBibleReading?: string
  type?: number
  songs?: string[]
  coTitle?: string
  coName?: string
  assignments: Partial<IScheduleWeekAssignments>
}

export interface IScheduleWeekAssignments {
  bibleReading: IScheduleAssignment
  chairman: IScheduleAssignment
  closingPrayer: IScheduleAssignment
  congregationBibleStudy: IScheduleAssignment
  gems: IScheduleAssignment
  highlights: IScheduleAssignment
  openingPrayer: IScheduleAssignment
  reader: IScheduleAssignment
  serviceTalk1: IScheduleAssignment
  serviceTalk2: IScheduleAssignment
  studentTalk1: IScheduleAssignment
  studentTalk2: IScheduleAssignment
  studentTalk3: IScheduleAssignment
  studentTalk4: IScheduleAssignment
}

export interface IScheduleAssignment {
  studyPoint: string
  text: string
  time: string
  title: string
  type: Privileges
  assignee?: string
  assistant?: string
  inherit?: boolean
  stream?: boolean
}

export interface IMemberAssignment {
  type: string
  date: string
}

export interface ICongregationMember {
  _id: string
  name: string
  gender: Genders
  appointment: Appointments
  languageGroup: Languages
  show: boolean
  privileges: {
    [key in Privileges]?: boolean
  }
  assignments?: IMemberAssignment[]
}

export interface IScheduleTranslationMap {
  startTime: string
  group: string
  header: string
  week: string
  weeks: string
  months: readonly string[]
  weeklyBibleReading: string
  assemblyWeek: string
  memorialWeek: string
  noMeeting: string
  timeOff: string
  prayer: string
  openingComments: string
  chairman: string
  treasures: string
  bibleReading: string
  gems: string
  ministry: string
  student: string
  assistant: string
  living: string
  review: string
  co: string
  cbs: string
  conductor: string
  reader: string
}

export interface IAssignmentTranslationMap {
  verticalPadding: number
  defaultRoom: string
  months: string[]
  title: string
  name: string
  assistant: string
  date: string
  studyPoint: string
  assignment: string
  bibleReading: string
  initialCall: string
  firstReturnVisit: string
  secondReturnVisit: string
  first: string
  second: string
  givenIn: string
  mainHall: string
  class1: string
  class2: string
  bibleStudy: string
  studentTalk: string
  other: string
  note: { text: string, bold?: boolean, italics?: boolean }[]
  footer: string
}
