export default function RightAssistantLayout({ user, setUser, children }) {

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
