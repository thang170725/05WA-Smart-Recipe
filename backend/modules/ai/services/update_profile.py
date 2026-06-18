def handle_update_profile(user, data, db):
    if data.address is not None:
        user.address = data.address
    if data.phone is not None:
        user.phone = data.phone
    if data.age is not None:
        user.age = data.age

    db.commit()