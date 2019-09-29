/* eslint-disable @typescript-eslint/interface-name-prefix */
import { ICongregationMember, IScheduleAssignment } from './interfaces'
import { ScheduleWeek, Languages, Assignments } from './types'

interface APIResponseMessage { message: string }
interface APIResponse<T> { result: T }

export interface IWeekWithMembers {
  week: ScheduleWeek
  members: ICongregationMember[]
}

declare namespace APITypes {
  namespace Auth {
    namespace Login {
      interface Data { password: string }
      interface Result { token: string }
      type Response = APIResponse<Result>
    }
    namespace Logout {
      type Result = APIResponseMessage
      type Response = APIResponseMessage
    }
  }

  namespace Congregation {
    namespace GetMembers {
      type Result = ICongregationMember[]
      type Response = APIResponse<Result>
    }
    namespace AddMember {
      type Data = ICongregationMember
      type Result = ICongregationMember
      type Response = APIResponse<Result>
    }
    namespace UpdateMember {
      interface Data { memberID: string, member: ICongregationMember }
      type Result = ICongregationMember
      type Response = APIResponse<Result>
    }
    namespace DeleteMember {
      interface Data { memberID: string }
      type Result = APIResponseMessage
      type Response = APIResponseMessage
    }
  }

  namespace Schedule {
    namespace GetWeek {
      interface Data { date: string }
      type Result = ScheduleWeek
      type Response = APIResponse<Result>
    }
    namespace GetMonth {
      interface Data { month: string }
      type Result = ScheduleWeek[]
      type Response = APIResponse<Result>
    }
    namespace ScrapeWeek {
      interface Data { weekID: string, language: Languages }
      type Result = ScheduleWeek
      type Response = APIResponse<Result>
    }
    namespace UpdateAssignment {
      interface Data { weekID: string, language: Languages, name: Assignments, assignment: IScheduleAssignment }
      type Result = IWeekWithMembers
      type Response = APIResponse<Result>
    }
    namespace DeleteAssignment {
      interface Data { weekID: string, language: Languages, name: Assignments }
      type Result = IWeekWithMembers
      type Response = APIResponse<Result>
    }
    namespace UpdateWeekType {
      interface Data { weekID: string, language: Languages, type: number }
      type Result = IWeekWithMembers
      type Response = APIResponse<Result>
    }
    namespace UpdateCOName {
      interface Data { weekID: string, language: Languages, name: string }
      type Result = ScheduleWeek
      type Response = APIResponse<Result>
    }
    namespace UpdateCOTitle {
      interface Data { weekID: string, language: Languages, title: string }
      type Result = ScheduleWeek
      type Response = APIResponse<Result>
    }
  }
}
