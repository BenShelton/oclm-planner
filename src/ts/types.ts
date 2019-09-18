import { GENDERS, APPOINTMENTS, SUPPORTED_LANGUAGES, PRIVILEGES } from '@/constants'
import { IScheduleWeekLanguage } from './interfaces'

export type Genders = typeof GENDERS[number]
export type Appointments = typeof APPOINTMENTS[number]
export type Languages = typeof SUPPORTED_LANGUAGES[number]['value']
export type Privileges = typeof PRIVILEGES[number]['key']

export type ScheduleWeek = {
  [key in Languages]: IScheduleWeekLanguage
} & {
  _id: string
  date: string
}
