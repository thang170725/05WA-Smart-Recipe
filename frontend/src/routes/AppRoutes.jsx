import { Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import Loading from "../components/Loading.jsx"

// Lazy load pages
const WorkoutRoadmap = lazy(() => import("../pages/WorkoutRoadmapPage.jsx"))
const HealthProfile = lazy(() => import("../pages/HealthProfilePage.jsx"))
const Home = lazy(() => import("../pages/HomePage.jsx"))
const Profile = lazy(() => import("../pages/ProfilePage.jsx"))
const Meals = lazy(() => import("../pages/MealsPage.jsx"))
const Docs = lazy(() => import("../pages/DocsPage.jsx"))
const Platform = lazy(() => import("../pages/PlatformPage.jsx"))
const Dashboard = lazy(() => import("../pages/DashboardPage.jsx"))
const Test = lazy(() => import("../pages/TestPage.jsx"))

export function AppRoutes({ user }) {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/health-center" element={<HealthProfile />} />
        <Route path="/workout-roadmap" element={<WorkoutRoadmap/>} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test" elment={<Test />} />
      </Routes>
    </Suspense>
  )
}
