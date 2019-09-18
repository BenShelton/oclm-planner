import { Genders, Appointments, Languages, Privileges } from './types'

export interface IScheduleWeekLanguage {
  scraped: boolean
  weeklyBibleReading: string
  type: number
  songs: string[]
  assignments: {
    bibleReading: IScheduleAssignment
    chairman: IScheduleAssignment
    closingPrayer: IScheduleAssignment
    congregationBibleStudy: IScheduleAssignment
    gems: IScheduleAssignment
    highlights: IScheduleAssignment
    openingPrayer: IScheduleAssignment
    reader: IScheduleAssignment
    serviceTalk1: IScheduleAssignment
    serviceTalk2?: IScheduleAssignment
    studentTalk1: IScheduleAssignment
    studentTalk2: IScheduleAssignment
    studentTalk3?: IScheduleAssignment
    studentTalk4?: IScheduleAssignment
  }
}

export interface IScheduleAssignment {
  inherit: boolean
  studyPoint: string
  text: string
  time: string
  title: string
  type: Privileges
  assignee: string
}

export interface IMemberAssignment {
  type: String
  date: String
}

export interface ICongregationMember {
  _id: string
  name: string
  gender: Genders
  appointment: Appointments
  languageGroup: Languages
  show: boolean
  privileges: {
    [key in Privileges]: boolean
  }
  assignments: IMemberAssignment[]
}
