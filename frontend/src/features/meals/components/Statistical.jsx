import { useState } from "react"
import { StatisticalToDay } from "./StatisticalToDay"
import { MealToDayApi } from "../api/MealToDayApi"
import StatisticalToWeek from "./StatisticalToWeek"

export function Statistical ({ today }) {
    const [statistical, setStatiscal] = useState(null)
    const [result, SetResult] = useState(null)

    const handleSendToDay = async () => {
        const r = await MealToDayApi(today)
        SetResult(r)
    }

    return (
        <div className="text-gray-300 mt-10">
            <div className="text-sm flex gap-1 mb-6">
                <button 
                    className="bg-gray-300/30 p-2 text-white cursor-pointer rounded-lg"
                    onClick={() => {
                        setStatiscal('day')
                        handleSendToDay()
                    }}
                >
                    Thống kê theo ngày
                </button>

                <button 
                    className="bg-gray-300/30 p-2 text-white cursor-pointer rounded-lg"
                    onClick={() => setStatiscal('week')}
                >
                    Thống kê theo tuần
                </button>
            </div>

            {statistical === null && <div>Hãy để AI phân tích chi tiết thực đơn của bạn</div>} 
            {statistical === 'day' && <StatisticalToDay payload={result}/>}
            {statistical === 'week' && <StatisticalToWeek payload={result}/>}
        </div>
    )
}