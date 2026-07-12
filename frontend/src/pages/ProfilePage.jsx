import ProfileForm from "../features/profile/components/ProfileForm"

export default function Profile() {
  const devMode = "dev"
  
  return (
    <ProfileForm devMode={devMode}/>
  )
}