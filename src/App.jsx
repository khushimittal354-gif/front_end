import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AssetsPage from './pages/assets/AssetsPage'
import BankManagementPage from './pages/finance/BankManagementPage'
import CardManagementPage from './pages/finance/CardManagementPage'
import FinancePage from './pages/finance/FinancePage'
import HrPage from './pages/hr/HrPage'
import InsurancePage from './pages/insurance/InsurancePage'
import InvestmentManagementPage from './pages/finance/InvestmentManagementPage'
import LoginPage from './pages/login/LoginPage'
import MutualFundManagementPage from './pages/finance/MutualFundManagementPage'
import ProfilePage from './pages/profile/ProfilePage'
import ReportsPage from './pages/finance/ReportsPage'
import SalaryProcessingPage from './pages/finance/SalaryProcessingPage'
import EmployeeBankReviewPage from './pages/finance/EmployeeBankReviewPage'
import EmployeeInvestmentReviewPage from './pages/finance/EmployeeInvestmentReviewPage'
import TimesheetPage from './pages/timesheet/TimesheetPage'
import TrainingPage from './pages/training/TrainingPage'
import { ProtectedRoute, useAuth } from './Context/AuthContext'

function App() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex flex-1 flex-wrap gap-2">
            <Link to="/hr" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              HR
            </Link>
            <Link to="/finance" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              FINANCE
            </Link>
            <Link to="/training" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              TRAINING
            </Link>
            <Link to="/timesheet" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              TIMESHEET
            </Link>
            <Link to="/assets" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              ASSETS
            </Link>
            <Link to="/insurance" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              INSURANCE
            </Link>
            <Link to="/profile" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              PROFILE
            </Link>
          </nav>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">{user?.username || 'User'}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="hr"
            element={
              <ProtectedRoute>
                <HrPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance"
            element={
              <ProtectedRoute>
                <FinancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/bank-management"
            element={
              <ProtectedRoute>
                <BankManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/investment-management"
            element={
              <ProtectedRoute>
                <InvestmentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/mutual-fund-management"
            element={
              <ProtectedRoute>
                <MutualFundManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/card-management"
            element={
              <ProtectedRoute>
                <CardManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/salary-processing"
            element={
              <ProtectedRoute>
                <SalaryProcessingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/employee-bank-review"
            element={
              <ProtectedRoute>
                <EmployeeBankReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="finance/employee-investment-review"
            element={
              <ProtectedRoute>
                <EmployeeInvestmentReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="training"
            element={
              <ProtectedRoute>
                <TrainingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="timesheet"
            element={
              <ProtectedRoute>
                <TimesheetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="assets"
            element={
              <ProtectedRoute>
                <AssetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="insurance"
            element={
              <ProtectedRoute>
                <InsurancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/hr' : '/login'} replace />} />
        </Routes>
      </main>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  )
}

export default App
