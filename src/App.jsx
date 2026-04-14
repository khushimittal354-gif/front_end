import { NavLink, Navigate, Route, Routes } from 'react-router-dom'

import AssetsPage from './pages/assets/AssetsPage'
import FinancePage from './pages/finance/FinancePage'
import HrPage from './pages/hr/HrPage'
import InsurancePage from './pages/insurance/InsurancePage'
import LoginPage from './pages/login/LoginPage'
import ProfilePage from './pages/profile/ProfilePage'
import TimesheetPage from './pages/timesheet/TimesheetPage'
import TrainingPage from './pages/training/TrainingPage'
import { modules } from './data/modules'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex flex-1 flex-wrap gap-2">
            {modules.map((module) => (
              <NavLink
                key={module.path}
                to={`/${module.path}`}
                className={({ isActive }) =>
                  [
                    'rounded border px-3 py-2 text-sm font-medium',
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700',
                  ].join(' ')
                }
              >
                {module.label}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/login"
            className="rounded border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Login
          </NavLink>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="hr" element={<HrPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="timesheet" element={<TimesheetPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="insurance" element={<InsurancePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/hr" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
