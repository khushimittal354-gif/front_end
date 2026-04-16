import { useState, useEffect } from 'react'
import { getMySalaryRecords } from '../../services/routes/generalRoutes'
import { 
  scheduleSalaryJob, 
  getAllSalaryJobs, 
  processSalaryJob,
  getAllSalaryRecords,
  getSalaryProcessingLogs
} from '../../services/routes/financeRoutes'
import toast from 'react-hot-toast'

export default function SalaryProcessingPage() {
  // Get role from localStorage user object
  let userRole = 'EMPLOYEE'
  try {
    const userJson = localStorage.getItem('finsecure_user')
    if (userJson) {
      const user = JSON.parse(userJson)
      userRole = user?.role || 'EMPLOYEE'
      console.log('[SalaryProcessingPage] User role from localStorage:', userRole)
    }
  } catch (error) {
    console.error('[SalaryProcessingPage] Error getting user role:', error)
  }
  
  const isFinanceUser = userRole === 'FINANCE'
  console.log('[SalaryProcessingPage] Is FINANCE user:', isFinanceUser)

  // Salary Records State
  const [mySalaryRecords, setMySalaryRecords] = useState([])
  const [salaryRecordsLoading, setRecordsLoading] = useState(true)
  const [salaryRecordsPage, setSalaryRecordsPage] = useState(0)
  const [salaryRecordsTotalPages, setSalaryRecordsTotalPages] = useState(0)

  // Salary Jobs State (Finance only)
  const [salaryJobs, setSalaryJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsPage, setJobsPage] = useState(0)
  const [jobsTotalPages, setJobsTotalPages] = useState(0)
  const [processingJobId, setProcessingJobId] = useState(null)

  // Salary Processing Logs State (Finance only)
  const [selectedJobForLogs, setSelectedJobForLogs] = useState(null)
  const [salaryLogs, setSalaryLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsPage, setLogsPage] = useState(0)
  const [logsTotalPages, setLogsTotalPages] = useState(0)
  const [logsStatusFilter, setLogsStatusFilter] = useState('')

  // Schedule Job Form State (Finance only)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [schedulingJob, setSchedulingJob] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    jobName: '',
    scheduledDateTime: '',
    targetMonth: ''
  })

  // Fetch salary records
  useEffect(() => {
    fetchMySalaryRecords()
  }, [salaryRecordsPage])

  const fetchMySalaryRecords = async () => {
    try {
      setRecordsLoading(true)
      const response = await getMySalaryRecords(salaryRecordsPage, 10)
      console.log('[SalaryProcessingPage] Fetched salary records:', response)
      setMySalaryRecords(response.content || [])
      setSalaryRecordsTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error('[SalaryProcessingPage] Error fetching salary records:', error)
      toast.error(error.response?.data?.message || 'Failed to load salary records')
    } finally {
      setRecordsLoading(false)
    }
  }

  // Fetch salary jobs (Finance only)
  useEffect(() => {
    if (isFinanceUser) {
      fetchSalaryJobs()
    }
  }, [jobsPage, isFinanceUser])

  const fetchSalaryJobs = async () => {
    try {
      setJobsLoading(true)
      const response = await getAllSalaryJobs(jobsPage, 10)
      console.log('[SalaryProcessingPage] Fetched salary jobs:', response)
      setSalaryJobs(response.content || [])
      setJobsTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error('[SalaryProcessingPage] Error fetching salary jobs:', error)
      toast.error(error.response?.data?.message || 'Failed to load salary jobs')
    } finally {
      setJobsLoading(false)
    }
  }

  // Fetch salary processing logs
  const fetchSalaryLogs = async (jobId, page = 0) => {
    try {
      setLogsLoading(true)
      const response = await getSalaryProcessingLogs(jobId, page, 50, logsStatusFilter || null)
      console.log('[SalaryProcessingPage] Fetched salary logs for job', jobId, ':', response)
      setSalaryLogs(response.content || [])
      setLogsTotalPages(response.totalPages || 1)
      setLogsPage(page)
    } catch (error) {
      console.error('[SalaryProcessingPage] Error fetching salary logs:', error)
      toast.error(error.response?.data?.message || 'Failed to load salary logs')
    } finally {
      setLogsLoading(false)
    }
  }

  // Schedule new salary job
  const handleScheduleJob = async (e) => {
    e.preventDefault()
    
    if (!scheduleForm.jobName.trim()) {
      toast.error('Job name is required')
      return
    }
    if (!scheduleForm.scheduledDateTime) {
      toast.error('Scheduled date and time is required')
      return
    }
    if (!scheduleForm.targetMonth.trim()) {
      toast.error('Target month is required (format: YYYY-MM)')
      return
    }

    // Validate scheduled datetime is in the future
    const scheduledDate = new Date(scheduleForm.scheduledDateTime)
    const now = new Date()
    if (scheduledDate <= now) {
      toast.error('Scheduled date and time must be in the future')
      return
    }

    // Validate target month format (YYYY-MM)
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(scheduleForm.targetMonth)) {
      toast.error('Target month must be in YYYY-MM format (e.g., 2025-01)')
      return
    }

    try {
      setSchedulingJob(true)
      const response = await scheduleSalaryJob(scheduleForm)
      console.log('[SalaryProcessingPage] Job scheduled:', response)
      toast.success('Salary job scheduled successfully')
      
      // Reset form and refresh
      setScheduleForm({ jobName: '', scheduledDateTime: '', targetMonth: '' })
      setShowScheduleForm(false)
      setJobsPage(0)
      await fetchSalaryJobs()
    } catch (error) {
      console.error('[SalaryProcessingPage] Error scheduling job:', error)
      toast.error(error.response?.data?.message || 'Failed to schedule salary job')
    } finally {
      setSchedulingJob(false)
    }
  }

  // Process salary job manually
  const handleProcessJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to process this salary job?')) {
      return
    }

    try {
      setProcessingJobId(jobId)
      const response = await processSalaryJob(jobId)
      console.log('[SalaryProcessingPage] Job processed:', response)
      toast.success('Salary job processed successfully')
      
      // Refresh jobs list
      setJobsPage(0)
      await fetchSalaryJobs()
    } catch (error) {
      console.error('[SalaryProcessingPage] Error processing job:', error)
      toast.error(error.response?.data?.message || 'Failed to process salary job')
    } finally {
      setProcessingJobId(null)
    }
  }

  // Get status badge color
  const getJobStatusColor = (status) => {
    const colors = {
      'SCHEDULED': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CREDITED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'PROCESSING': 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getProcessingStatusColor = (status) => {
    const colors = {
      'SUCCESS': 'bg-green-100 text-green-800',
      'SKIPPED': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getSkipReasonDisplay = (reason) => {
    if (!reason) return '-'
    const reasonMap = {
      'ALREADY_PAID': 'Already Paid',
      'NO_BANK_ACCOUNT': 'No Bank Account',
      'BANK_ACCOUNT_PENDING': 'Bank Account Pending',
      'BANK_ACCOUNT_REJECTED': 'Bank Account Rejected',
      'BANK_BLACKLISTED': 'Bank Blacklisted',
      'EMPLOYEE_INACTIVE': 'Employee Inactive',
      'PROCESSING_ERROR': 'Processing Error',
      'EMAIL_FAILURE': 'Email Failure'
    }
    return reasonMap[reason] || reason
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Salary Processing</h1>
          <p className="text-gray-600 mt-2">Manage and track salary jobs and records</p>
        </div>

        {/* My Salary Records Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">My Salary Records</h2>
          </div>

          {salaryRecordsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading salary records...</p>
            </div>
          ) : mySalaryRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No salary records found</p>
              <p className="text-sm text-gray-500 mt-2">Salary records will appear here once your first salary is processed</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Salary Month</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Gross Salary</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Deductions</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Net Salary</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Credited Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySalaryRecords.map((record) => (
                      <tr key={record.salaryRecordId} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800">{record.salaryMonth}</td>
                        <td className="px-4 py-3 text-right text-gray-800">
                          ₹{record.grossSalary?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-800">
                          ₹{record.deductions?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-indigo-600">
                          ₹{record.netSalary?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(record.paymentStatus)}`}>
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
                  Page {salaryRecordsPage + 1} of {salaryRecordsTotalPages}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setSalaryRecordsPage(Math.max(0, salaryRecordsPage - 1))}
                    disabled={salaryRecordsPage === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setSalaryRecordsPage(salaryRecordsPage + 1)}
                    disabled={salaryRecordsPage >= salaryRecordsTotalPages - 1}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Finance Only - Salary Jobs Section */}
        {isFinanceUser && (
          <>
            {/* Schedule New Job Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Schedule Salary Job</h2>
                <button
                  onClick={() => setShowScheduleForm(!showScheduleForm)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  {showScheduleForm ? 'Cancel' : 'New Job'}
                </button>
              </div>

              {showScheduleForm && (
                <form onSubmit={handleScheduleJob} className="space-y-4 p-4 border rounded bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Name
                      </label>
                      <input
                        type="text"
                        value={scheduleForm.jobName}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, jobName: e.target.value })}
                        placeholder="e.g., January Salary Processing"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scheduled Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduleForm.scheduledDateTime}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDateTime: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be in the future</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Month (YYYY-MM)
                      </label>
                      <input
                        type="text"
                        value={scheduleForm.targetMonth}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, targetMonth: e.target.value })}
                        placeholder="e.g., 2025-01"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={schedulingJob}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      {schedulingJob ? 'Scheduling...' : 'Schedule Job'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Salary Jobs List Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Salary Jobs</h2>
              </div>

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
                          {/* <th className="px-4 py-3 text-center font-semibold text-gray-700">Success</th> */}
                          {/* <th className="px-4 py-3 text-center font-semibold text-gray-700">Failed</th> */}
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Scheduled Date</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaryJobs.map((job) => (
                          <tr key={job.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-800">{job.jobName}</td>
                            <td className="px-4 py-3 text-gray-800">{job.targetMonth}</td>
                            <td className="px-4 py-3 text-center text-gray-800">{job.totalEmployees}</td>
                            {/* <td className="px-4 py-3 text-center">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                {job.successCount}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                                {job.failureCount}
                              </span>
                            </td> */}
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobStatusColor(job.jobStatus)}`}>
                                {job.jobStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-800">
                              {new Date(job.scheduledDateTime).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {job.jobStatus === 'SCHEDULED' && (
                                <button
                                  onClick={() => handleProcessJob(job.id)}
                                  disabled={processingJobId === job.id}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                  {processingJobId === job.id ? 'Processing...' : 'Process'}
                                </button>
                              )}
                              {job.jobStatus !== 'SCHEDULED' && (
                                <button
                                  onClick={() => {
                                    setSelectedJobForLogs(job)
                                    setLogsPage(0)
                                    setLogsStatusFilter('')
                                    fetchSalaryLogs(job.id, 0)
                                  }}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                                >
                                  View Logs
                                </button>
                              )}
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
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setJobsPage(jobsPage + 1)}
                        disabled={jobsPage >= jobsTotalPages - 1}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Salary Processing Logs Section */}
            {selectedJobForLogs && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Salary Processing Logs</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Job: <span className="font-medium">{selectedJobForLogs.jobName}</span> | Target Month: <span className="font-medium">{selectedJobForLogs.targetMonth}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedJobForLogs(null)
                      setSalaryLogs([])
                      setLogsPage(0)
                      setLogsStatusFilter('')
                    }}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                  >
                    Close
                  </button>
                </div>

                {/* Logs Filter */}
                {/* <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                  <select
                    value={logsStatusFilter}
                    onChange={(e) => {
                      setLogsStatusFilter(e.target.value)
                      setLogsPage(0)
                      fetchSalaryLogs(selectedJobForLogs.id, 0)
                    }}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="SKIPPED">Skipped</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div> */}

                {logsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading salary logs...</p>
                  </div>
                ) : salaryLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No salary logs found</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Employee Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Employee Code</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Salary Month</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Skip Reason</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Details</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Logged Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salaryLogs.map((log) => (
                            <tr key={log.id} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-800">{log.employeeName}</td>
                              <td className="px-4 py-3 text-gray-800">{log.employeeCode}</td>
                              <td className="px-4 py-3 text-gray-800">{log.salaryMonth}</td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProcessingStatusColor(log.processingStatus)}`}>
                                  {log.processingStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-800">
                                {log.processingStatus === 'SKIPPED' ? getSkipReasonDisplay(log.skipReason) : '-'}
                              </td>
                              <td className="px-4 py-3 text-gray-800 max-w-xs truncate" title={log.details}>
                                {log.details || '-'}
                              </td>
                              <td className="px-4 py-3 text-gray-800">
                                {log.loggedAt ? new Date(log.loggedAt).toLocaleString('en-IN') : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Logs Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Page {logsPage + 1} of {logsTotalPages} | Total: {salaryLogs.length}
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => fetchSalaryLogs(selectedJobForLogs.id, Math.max(0, logsPage - 1))}
                          disabled={logsPage === 0}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => fetchSalaryLogs(selectedJobForLogs.id, logsPage + 1)}
                          disabled={logsPage >= logsTotalPages - 1}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
