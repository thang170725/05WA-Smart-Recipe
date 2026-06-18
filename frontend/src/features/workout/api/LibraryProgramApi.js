import JsonApi from "../../../services/JsonApi";
import { MockDataLibraryProgram } from "../../../mockdata/Workout"

export async function GetExcercisesLibraryApi(devMode) {
    if (devMode === "dev") {
        const library = MockDataLibraryProgram()
        return library
    }

    return await JsonApi(
        "/workout/get-exercises-library", {
        method: "GET", 
    });
}

