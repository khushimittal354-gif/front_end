import { useState, useEffect } from 'react'
import { 
  getSalaryRegisterReport, 
  getComplianceReport, 
  getBankAccountStatusReport,
  getSalaryJobReport
} from '../../services/routes/financeRoutes'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  // Get role from localStorage user object
  let userRole = 'EMPLOYEE'
  try {
    const userJson = localStorage.getItem('finsecure_user')
    if (userJson) {
      const user = JSON.parse(userJson)
      userRole = user?.role || 'EMPLOYEE'
      console.log('[ReportsPage] User role from localStorage:', userRole)
    }
  } catch (error) {
    console.error('[ReportsPage] Error getting user role:', error)
  }
  
  const isFinanceUser = userRole === 'FINANCE'
  console.log('[ReportsPage] Is FINANCE user:', isFinanceUser)

  // Check access
  if (!isFinanceUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to view finance reports. Only finance users can access this page.</p>
            <a
              href="/finance"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Back to Finance
            </a>
          </div>
        </div>
      </div>
    )
  }
  // Salary Register Report
  const [salaryRecords, setSalaryRecords] = useState([])
  const [salaryLoading, setSalaryLoading] = useState(true)
  const [salaryPage, setSalaryPage] = useState(0)
  const [salaryTotalPages, setSalaryTotalPages] = useState(0)
  const [salaryMonth, setSalaryMonth] = useState('')

  // Compliance Report
  const [complianceData, setComplianceData] = useState([])
  const [complianceLoading, setComplianceLoading] = useState(true)
  const [compliancePage, setCompliancePage] = useState(0)
  const [complianceTotalPages, setComplianceTotalPages] = useState(0)

  // Bank Status Report
  const [bankStatus, setBankStatus] = useState(null)
  const [bankLoading, setBankLoading] = useState(true)

  // Salary Jobs Report
  const [salaryJobs, setSalaryJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsPage, setJobsPage] = useState(0)
  const [jobsTotalPages, setJobsTotalPages] = useState(0)

  // Fetch Salary Register
  useEffect(() => {
    fetchSalaryRegister()
  }, [salaryPage, salaryMonth])

  const fetchSalaryRegister = async () => {
    try {
      setSalaryLoading(true)
      const response = await getSalaryRegisterReport(salaryMonth, salaryPage, 10)
      setSalaryRecords(response.content || [])
      setSalaryTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error('[ReportsPage] Error fetching salary register:', error)
      toast.error('Failed to load salary register')
    } finally {
      setSalaryLoading(false)
    }
  }

  // Fetch Compliance Report
  useEffect(() => {
    fetchComplianceReport()
  }, [compliancePage])

  const fetchComplianceReport = async () => {
    try {
      setComplianceLoading(true)
      const response = await getComplianceReport(compliancePage, 10)
      setComplianceData(response.content || [])
      setComplianceTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error('[ReportsPage] Error fetching compliance report:', error)
      toast.error('Failed to load compliance report')
    } finally {
      setComplianceLoading(false)
    }
  }

  // Fetch Bank Status
  useEffect(() => {
    fetchBankStatus()
  }, [])

  const fetchBankStatus = async () => {
    try {
      setBankLoading(true)
      const response = await getBankAccountStatusReport()
      setBankStatus(response)
    } catch (error) {
      console.error('[ReportsPage] Error fetching bank status:', error)
      toast.error('Failed to load bank status report')
    } finally {
      setBankLoading(false)
    }
  }

  // Fetch Salary Jobs
  useEffect(() => {
    fetchSalaryJobs()
  }, [jobsPage])

  const fetchSalaryJobs = async () => {
    try {
      setJobsLoading(true)
      const response = await getSalaryJobReport(jobsPage, 10)
      setSalaryJobs(response.content || [])
      setJobsTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error('[ReportsPage] Error fetching salary jobs:', error)
      toast.error('Failed to load salary jobs report')
    } finally {
      setJobsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Finance Reports</h1>
          <p className="text-gray-600 mt-2">Salary, compliance, banking, and job processing reports</p>
        </div>

        {/* Report 1: Salary Register */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {/* <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Salary Register</h2>
            <input
              type="text"
              value={salaryMonth}
              onChange={(e) => {
                setSalaryMonth(e.target.value)
                setSalaryPage(0)
              }}
              placeholder="Filter by month (YYYY-MM)"
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div> */}

          {salaryLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading salary register...</p>
            </div>
          ) : salaryRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No salary records found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Employee Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Salary Month</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Gross Salary</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Net Salary</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Bank</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Credited Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryRecords.map((record) => (
                      <tr key={record.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800">{record.employeeName}</td>
                        <td className="px-4 py-3 text-gray-800">{record.salaryMonth}</td>
                        <td className="px-4 py-3 text-right text-gray-800">
                          ₹{record.grossSalary?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-indigo-600">
                          ₹{record.netSalary?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-4 py-3 text-gray-800">{record.bankName || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            record.paymentStatus === 'CREDITED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {record.creditedAt ? new Date(record.creditedAt).toLocaleDateString('en-IN') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {salaryPage + 1} of {salaryTotalPages}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setSalaryPage(Math.max(0, salaryPage - 1))}
                    disabled={salaryPage === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setSalaryPage(salaryPage + 1)}
                    disabled={salaryPage >= salaryTotalPages - 1}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Report 2: Bank Status Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Bank Account Status Summary</h2>

          {bankLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading bank status...</p>
            </div>
          ) : bankStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <p className="text-gray-600 text-sm">Total Accounts</p>
                <p className="text-3xl font-bold text-blue-600">{bankStatus.total || 0}</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{bankStatus.pending || 0}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-3xl font-bold text-green-600">{bankStatus.approved || 0}</p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{bankStatus.rejected || 0}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Report 3: Compliance Report */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Non-Compliant Investments</h2>

          {complianceLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading compliance report...</p>
            </div>
          ) : complianceData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">All investments are compliant!</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Employee Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Investment Type</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Detail</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Review Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceData.map((investment) => (
                      <tr key={investment.empInvestmentId} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800">{investment.employeeName}</td>
                        <td className="px-4 py-3 text-gray-800">{investment.investmentType}</td>
                        <td className="px-4 py-3 text-right text-gray-800">
                          ₹{investment.declaredAmount?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {investment.fundName || investment.securityName || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            {investment.complianceStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800 text-xs">{investment.reviewNote || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {compliancePage + 1} of {complianceTotalPages}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setCompliancePage(Math.max(0, compliancePage - 1))}
                    disabled={compliancePage === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCompliancePage(compliancePage + 1)}
                    disabled={compliancePage >= complianceTotalPages - 1}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Report 4: Salary Jobs History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Salary Job Processing History</h2>

          {jobsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading salary jobs...</p>
            </div>
          ) : salaryJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No salary jobs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Job Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Target Month</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Total Employees</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Success</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Failed</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Scheduled Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryJobs.map((job) => (
                      <tr key={job.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800">{job.jobName}</td>
                        <td className="px-4 py-3 text-gray-800">{job.targetMonth}</td>
                        <td className="px-4 py-3 text-center text-gray-800">{job.totalEmployees}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            {job.successCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            {job.failureCount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            job.jobStatus === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : job.jobStatus === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-800'
                              : job.jobStatus === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.jobStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {new Date(job.scheduledDateTime).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {jobsPage + 1} of {jobsTotalPages}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setJobsPage(Math.max(0, jobsPage - 1))}
                    disabled={jobsPage === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setJobsPage(jobsPage + 1)}
                    disabled={jobsPage >= jobsTotalPages - 1}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
