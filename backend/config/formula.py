def calc_calories_by_met(met, weight, duration):
    '''
    Duration=float: đơn vị seconds
    '''
    duration_minutes = duration / 60

    return met*3.5*weight*duration_minutes/200

# tính bmi dựa vào cân nặng và chiều cao
def calc_bmi(weight, height_cm) -> tuple[float, str]:

    bmi = round(weight / ((height_cm / 100) ** 2), 2)

    label = ""

    if bmi < 16:
        label = "rất gầy"

    elif bmi < 18.5:
        label = "gầy"

    elif bmi < 25:
        label = "cân đối"

    elif bmi < 30:
        label = "béo"

    else:
        label = "rất béo"

    return bmi, label


# tính body fat dựa vào bmi, gender, age
def calc_body_fat(bmi, gender, age):

    sex = 1 if gender == "male" else 0

    return (1.2 * bmi + 0.23 * age - 10.8 * sex - 5.4)


# tính bmr dựa vào weight, height, age, gender
def calc_bmr(weight, height_cm, age, gender):

    if gender == "male":

        return (
            (10 * weight)
            + (6.25 * height_cm)
            - (5 * age)
            + 5
        )

    else:

        return (
            (10 * weight)
            + (6.25 * height_cm)
            - (5 * age)
            - 161
        )


# calc tdee
def calc_tdee(bmr, activity_level):

    activity_levels = {

        "sedentary": 1.2,

        "light": 1.375,

        "moderate": 1.55,

        "active": 1.725,

        "very_active": 1.9
    }

    activity_factor = activity_levels[activity_level]

    return bmr * activity_factor