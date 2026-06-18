import Header from "./Header.jsx"

export default function RightAssistantLayout({ user, setUser, children }) {

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3 border-b border-white/8 bg-slate-950/40 backdrop-blur-xl">
        <Header />
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
