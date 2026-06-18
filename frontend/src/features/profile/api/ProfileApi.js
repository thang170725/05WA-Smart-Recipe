import JsonApi from "../../../services/JsonApi";
import FormDataApi from "../../../services/FormDataApi"

export async function GetProfile() {
  return await JsonApi("/user/get-profile", {
    method: "GET"
  }); 
}

export async function UpdateProfile(profile) {
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