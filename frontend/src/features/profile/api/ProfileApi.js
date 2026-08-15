import JsonApi from "../../../services/JsonApi";
import FormDataApi from "../../../services/FormDataApi"

// =====================================================
// ======= GET ======== 
// =====================================================
export async function GetProfile() {
  return await JsonApi("/user/get-profile", {
    method: "GET"
  }); 
}

// lấy profile + weigt/height
export async function GetAllProfile() {
  return await JsonApi("/user/get-all-profile", {
    method: "GET"
  }); 
}

// =====================================================
// ======= POST / UPDATE / PUT======== 
// =====================================================
export async function UpdateProfileApi(devMode, profile) {
  console.log("UpdateProfileApi: ", profile)
  return await JsonApi("/user/update-profile", {
      method: "PUT",
      body: profile,
    }); 
}

export async function UpdatePassword(password) {
    return await JsonApi("/user/update-password", {
      method: "PUT",
      body: password,
    }); 
}

export async function UploadAvatarApi (formData) {
  return await FormDataApi("/user/upload-avatar", {
    method: "POST",
    body: formData,
  })
}