import { Genders, Appointments, Languages, Privileges } from './types'

export type ScheduleWeek = {
  [key in Languages]: ScheduleWeekLanguage
} & {
  _id: string
  date: string
}

export interface ScheduleWeekLanguage {
  scraped: boolean
  weeklyBibleReading: string
  type: number
  songs: string[]
  assignments: {
    bibleReading: ScheduleAssignment
    chairman: ScheduleAssignment
    closingPrayer: ScheduleAssignment
    congregationBibleStudy: ScheduleAssignment
    gems: ScheduleAssignment
    highlights: ScheduleAssignment
    openingPrayer: ScheduleAssignment
    reader: ScheduleAssignment
    serviceTalk1: ScheduleAssignment
    serviceTalk2?: ScheduleAssignment
    studentTalk1: ScheduleAssignment
    studentTalk2: ScheduleAssignment
    studentTalk3?: ScheduleAssignment
    studentTalk4?: ScheduleAssignment
  }
}

export interface ScheduleAssignment {
  inherit: boolean
  studyPoint: string
  text: string
  time: string
  title: string
  type: Privileges
  assignee: string
}

export interface MemberAssignment {
  type: String
  date: String
}

export interface CongregationMember {
  _id: string
  name: string
  gender: Genders
  appointment: Appointments
  languageGroup: Languages
  show: boolean
  privileges: {
    [key in Privileges]: boolean
  }
  assignments: MemberAssignment[]
}
