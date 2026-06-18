import { BMIDocs } from "../features/docs/components/BMIDocs"
import { FoodsDocs } from "../features/docs/components/FoodsDocs"

export default function Docs () {
    return (
        <div className="page-shell h-auto text-white">
            <BMIDocs />
            <FoodsDocs />
        </div>  
    )
}