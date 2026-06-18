import { useState, useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import { Sidebar } from "./layouts/Sidebar.jsx"
import Main from "./layouts/Main.jsx"
import { GetProfile } from "./features/profile/api/ProfileApi.js"
import { AppRoutes } from "./routes/AppRoutes.jsx"
import AI from "./layouts/AI.jsx"
import Footer from "./layouts/Footer.jsx"

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const user = await GetProfile()
        setUser(user)
      } catch (error){
        localStorage.removeItem("token")
        setUser(null)
      }
    }

    fetchProfile();
  }, []);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen w-full font-ui">
        {/* Background */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&q=80')",
          }}
        />

        {/* Overlay gradient */}
        <div className="fixed inset-0 -z-9 bg-linear-to-br from-slate-950/85 via-slate-900/75 to-slate-950/90 backdrop-blur-[2px]" />

        {/* Layout */}
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex-1 flex flex-col min-w-0 lg:ml-65">
            <Main
              user={user}
              setUser={setUser}
              defaultOpen={false}
            >
              <AppRoutes user={user} />
            </Main>
            <Footer />
          </div>

          <AI />
        </div>
      </div>
    </BrowserRouter>
  )
}
