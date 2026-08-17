import { Content } from "../features/platform/components/Content"

export default function ForumPlatformPage() {
  const devMode = "production"

  return (
      <Content devMode={devMode}/>        
  );
}