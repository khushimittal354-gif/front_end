import { Link } from 'react-router-dom'

function FinancePage() {
  // Get role from localStorage user object
  let userRole = 'EMPLOYEE'
  try {
    const userJson = localStorage.getItem('finsecure_user')
    if (userJson) {
      const user = JSON.parse(userJson)
      userRole = user?.role || 'EMPLOYEE'
      console.log('[FinancePage] User role from localStorage:', userRole)
    }
  } catch (error) {
    console.error('[FinancePage] Error getting user role:', error)
  }

  return (
    <div className="space-y-8 p-6">
      {/* General Operations */}
      <div className="rounded-md border border-slate-300 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          General Operations
        </h2>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/finance/bank-management"
            className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            Bank Management
          </Link>
          <Link
            to="/finance/investment-management"
            className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            Investment Management
          </Link>
          <Link
            to="/finance/card-management"
            className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            Card Management
          </Link>
        </div>
      </div>

      {/* Finance Operations (only for FINANCE role) */}
      {userRole === 'FINANCE' && (
        <>
          <div className="rounded-md border border-slate-300 bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Finance Operations
            </h2>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/finance/mutual-fund-management"
                className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Mutual Fund Management
              </Link>
              <Link
                to="/finance/salary-processing"
                className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Salary Processing
              </Link>
              <Link
                to="/finance/reports"
                className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Reports
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-slate-300 bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Employee Reviews
            </h2>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/finance/employee-bank-review"
                className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Review Bank Accounts
              </Link>
              <Link
                to="/finance/employee-investment-review"
                className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Review Investments
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FinancePage