import { useEffect, useState } from "react";
import {
    PasswordRegExp, PhoneRegExp, EmailRegExp, 
    FullNameRegExp, AgeRegExp, 
} from "../components/RegExp"
import { checkEmailApi } from "../features/account/api/RegisterApi"

export function useRegisterFormValidator(form){
    const [error, setError] = useState("")

    useEffect(() => {
        try {
            if (!FullNameRegExp().test(form.fullname)) throw new Error("Tên không hợp lệ (VD: Lê Đức Thắng)")
            if (!form.birth_date) throw new Error("Ngày sinh không được để trống")
            if (!AgeRegExp().test(String(form.age))) throw new Error("Độ tuổi cho phép đăng ký là từ lớn hơn 17 tuổi")
            if (!PasswordRegExp().test(form.password)) throw new Error("Password ≥8 ký tự, gồm chữ, số, ký tự đặc biệt và ký tự in hoa")
            if (!PhoneRegExp().test(form.phone)) throw new Error("Số điện thoại không hợp lệ")
            if (!form.gender) throw new Error("Vui lòng chọn giới tính")
            if (!form.address.trim()) throw new Error("Vui lòng nhập địa chỉ (Xã Hoài Đức, Hà Nội, Việt Nam)")  
            if (!EmailRegExp().test(form.email)) throw new Error("Định dạng email không hợp lệ (VD: leducthang@gmail.com)")    
                
            setError("");
        } catch (error) {
            setError(error.message)
        }
    }, [form])
    return [error, setError]
}

export function useEmailChecker(devMode, error, email) {
    console.log("useEmailChecker:", {
        error,
        email
    });

    const [emailError, setEmailError] = useState("");
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(false);

    const checkEmail = async (email) => {
        

        try {
            setCheckingEmail(true);
            setEmailError("");
            setEmailAvailable(false);

            const response = await checkEmailApi(devMode, email);

            

            if (response) {
                setEmailError("Email này đã được đăng ký");
                setEmailAvailable(false);
            } else {
                setEmailError("");
                setEmailAvailable(true);
            }

        } catch (error) {
            setEmailError("Không thể kiểm tra email");

            console.error("checkEmail error:", error);

            setEmailAvailable(false);

        } finally {
            setCheckingEmail(false);
        }
    };

    useEffect(() => {
        

        // Form vẫn còn lỗi → không check email
        if (error) {
            setEmailError("");
            setEmailAvailable(false);
            return;
        }

        // Email rỗng → không check
        if (!email.trim()) {
            setEmailError("");
            setEmailAvailable(false);
            return;
        }


        const timer = setTimeout(() => {
            checkEmail(email);
        }, 500);

        return () => {
            clearTimeout(timer);
        };

    }, [error, email]);

    return [
        emailError,
        emailAvailable,
        setEmailError,
        setEmailAvailable
    ];
}