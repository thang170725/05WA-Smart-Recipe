import { Content } from "../features/platform/components/Content"

export default function ForumPlatformPage() {
  const devMode = "production"

  return (
    <div className="w-[90%] ml-20 my-20">
      <Content devMode={devMode}/>   
    </div>
     
  );
}