import { useEffect, useState } from "react";
import { PasswordRegExp, EmailRegExp, } from "../components/RegExp"
import { checkEmailApi } from "../features/account/api/RegisterApi"

export function useLoginFormValidator(form){
    const [error, setError] = useState("")

    useEffect(() => {
        if (!form.email && !form.password) {
            setError("")
            return
        }

        try {
            if (!EmailRegExp().test(form.email)){
                throw new Error("Định dạng email không hợp lệ (VD: leducthang@gmail.com)")
            }    

            setError("");
        } catch (error) {
            setError(error.message)
        }
    }, [form])
    return [error, setError]
}