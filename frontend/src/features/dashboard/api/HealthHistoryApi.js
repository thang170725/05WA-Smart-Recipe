import JsonApi from "../../../services/JsonApi";
import { MockDataHealthHistory } from "../../../mockdata/DashBoard";

export async function GetHealthHistoryApi (devMode) {
    if (devMode === "dev" ) {
        const response = MockDataHealthHistory()
        
        console.log("MOCK DATA HEALTH HISTORY: ", response)
        return response
    }

    return JsonApi("/dashboard/get-health-history", {
        method:"GET"
    })
}