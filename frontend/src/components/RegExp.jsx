// FULLNAME
export function FullNameRegExp() {
    return /^[\p{L}]+(?:[\s]+[\p{L}]+)*$/u
}

// PASSWORD
export function PasswordRegExp () {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
}

// PHONE
export function PhoneRegExp () {
    return /^(03|05|07|08|09)[0-9]{8}$/
}

// EMAIL 
export function EmailRegExp () {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
}

// AGE (Từ 17 đến 99)
export function AgeRegExp () {
    return /^(1[7-9]|[2-9][0-9])$/
}

// HEIGHT (50cm - 250cm, chấp nhận số thập phân)
export function HeightRegExp() {
    return /^(?:[5-9]\d|1\d\d|2[0-4]\d|250)(?:\.\d{1,2})?$/
}

// WEIGHT (20kg - 300kg, chấp nhận số thập phân)
export function WeightRegExp() {
    return /^(?:[2-9]\d|[12]\d\d|300)(?:\.\d{1,2})?$/
}

export function CalculateAge(dateOfBirth) {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()

    let age = today.getFullYear() - birthDate.getFullYear()

    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--
    }

    return age
}