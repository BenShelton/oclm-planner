import * as settings from '@/settings'
import { GENDERS, APPOINTMENTS, SUPPORTED_LANGUAGES, PRIVILEGES, COLORS } from '@/constants'
import { IScheduleWeekLanguage, IScheduleWeekAssignments } from './interfaces'
import { TCreatedPdf } from 'pdfmake/build/pdfmake'
import { ObjectID } from 'mongodb'

export type Slug = keyof typeof settings
export type Genders = typeof GENDERS[number]
export type Appointments = typeof APPOINTMENTS[number]
export type Languages = typeof SUPPORTED_LANGUAGES[number]['value']
export type Privileges = typeof PRIVILEGES[number]['key']
export type Colors = keyof typeof COLORS

export type ScheduleWeek = {
  [key in Languages]: IScheduleWeekLanguage
} & {
  _id: string
  date: string
}

export type Assignments = keyof IScheduleWeekAssignments
export type AssignmentTypes = 'chairman' | 'openingPrayer' | 'closingPrayer' | 'gems' | 'reader' | 'highlights' | 'bibleReading' | 'studentTalk' | 'serviceTalk' | 'congregationBibleStudy'

export type PDFGenerator = (weeks: ScheduleWeek[], month: string) => TCreatedPdf

export type MongoInterface<T> = Omit<T, '_id'> & { _id?: string | ObjectID }
