import JsonApi from "../../../services/JsonApi";
import { MockDataWeekPrograms } from "../../../mockdata/Workout"

export async function GetWeekProgramsApi(devMode, weekStart) {
    if (devMode === "dev") {
        const weekProgramsList = MockDataWeekPrograms()
        
        const week = weekProgramsList.find(
            w => w.week_start === weekStart
        )

        if (!week) {
          return {
            week_start: weekStart,
            week_menu: {
              Mon: [],
              Tue: [],
              Wed: [],
              Thu: [],
              Fri: [],
              Sat: [],
              Sun: []
            }
          }
        }

        return week
    }

    const response = await JsonApi(
      `/workout/get-week-programs?week_start=${weekStart}`,
      { method: "GET" }
    )

    if (!response) {
      return {
        week_start: weekStart,
        week_menu: {
          Mon: [],
          Tue: [],
          Wed: [],
          Thu: [],
          Fri: [],
          Sat: [],
          Sun: []
        }
      }
    }

  return response
}