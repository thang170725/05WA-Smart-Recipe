import Header from "../features/platform/components/Header"
import Content from "../features/platform/components/Content"

export default function ForumPlatform() {
  const devMode = "production"

  return (
    <div className="page-shell relative">
      {/* HEADER */}
      <Header 
        devMode={devMode}
      />

      <Content devMode={devMode}/>
    </div>
  );
}