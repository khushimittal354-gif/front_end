import { useState, useEffect } from 'react'
import { 
  getAllEmployeeBankAccounts, 
  getEmployeeBankAccountById,
  reviewEmployeeBankAccount
} from '../../services/routes/financeRoutes'
import toast from 'react-hot-toast'

export default function EmployeeBankReviewPage() {
  // Get role from localStorage user object
  let userRole = 'EMPLOYEE'
  try {
    const userJson = localStorage.getItem('finsecure_user')
    if (userJson) {
      const user = JSON.parse(userJson)
      userRole = user?.role || 'EMPLOYEE'
      console.log('[EmployeeBankReviewPage] User role from localStorage:', userRole)
    }
  } catch (error) {
    console.error('[EmployeeBankReviewPage] Error getting user role:', error)
  }
  
  const isFinanceUser = userRole === 'FINANCE'
  console.log('[EmployeeBankReviewPage] Is FINANCE user:', isFinanceUser)

  // Check access
  if (!isFinanceUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to review employee bank accounts. Only finance users can access this page.</p>
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

  // State
  const [bankAccounts, setBankAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    validationStatus: '',
    reviewNote: ''
  })

  // Fetch bank accounts
  useEffect(() => {
    fetchBankAccounts()
  }, [page, statusFilter])

  const fetchBankAccounts = async () => {
    try {
      setLoading(true)
      console.log('[EmployeeBankReviewPage] Fetching accounts with filter:', statusFilter || 'ALL')
      
      const response = await getAllEmployeeBankAccounts({
        page,
        size: 50,  // Increased from 10 to get more records
        status: statusFilter || undefined
      })
      console.log('[EmployeeBankReviewPage] API Response:', response)
      console.log('[EmployeeBankReviewPage] Total accounts returned:', response.content?.length || 0)
      console.log('[EmployeeBankReviewPage] Sample account data:', response.content?.[0])
      console.log('[EmployeeBankReviewPage] Total pages:', response.totalPages)
      
      setBankAccounts(response.content || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error('[EmployeeBankReviewPage] Error fetching accounts:', error)
      toast.error('Failed to load bank accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (account) => {
    console.log('[EmployeeBankReviewPage] Opening review modal for account:', account.empBankId)
    console.log('[EmployeeBankReviewPage] Current reviewNote value:', account.reviewNote)
    console.log('[EmployeeBankReviewPage] Current validationStatus:', account.validationStatus)
    
    setSelectedAccount(account)
    setReviewForm({
      validationStatus: account.validationStatus || '',
      reviewNote: (account.reviewNote && account.reviewNote !== 'N/A') ? account.reviewNote : ''
    })
    setShowReviewModal(true)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!reviewForm.validationStatus.trim()) {
      toast.error('Validation status is required')
      return
    }

    try {
      setReviewing(true)
      console.log('[EmployeeBankReviewPage] Submitting review for account:', selectedAccount.empBankId)
      console.log('[EmployeeBankReviewPage] Review payload:', {
        validationStatus: reviewForm.validationStatus,
        reviewNote: reviewForm.reviewNote
      })
      
      const payload = {
        validationStatus: reviewForm.validationStatus,
        reviewNote: reviewForm.reviewNote
      }

      const result = await reviewEmployeeBankAccount(selectedAccount.empBankId, payload)
      console.log('[EmployeeBankReviewPage] Review API response:', result)
      
      toast.success('Bank account review submitted successfully')
      setShowReviewModal(false)
      
      // Small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Refresh accounts with no filter to see all updated accounts
      console.log('[EmployeeBankReviewPage] Fetching latest accounts...')
      try {
        const response = await getAllEmployeeBankAccounts({
          page: 0,
          size: 50,
          status: undefined  // No filter - get all
        })
        console.log('[EmployeeBankReviewPage] Refreshed accounts count:', response.content?.length)
        setBankAccounts(response.content || [])
        setTotalPages(response.totalPages || 1)
        setPage(0)
        setStatusFilter('')
      } catch (refreshError) {
        console.error('[EmployeeBankReviewPage] Error refreshing accounts:', refreshError)
        toast.error('Review submitted but failed to refresh list')
      }
    } catch (error) {
      console.error('[EmployeeBankReviewPage] Error submitting review:', error)
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setReviewing(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'REVIEW': 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Employee Bank Accounts Review</h1>
          <p className="text-gray-600 mt-2">Review and validate employee bank account details</p>
        </div>


        {/* Bank Accounts Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Bank Accounts</h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading bank accounts...</p>
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No bank accounts found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* <th className="px-4 py-3 text-left font-semibold text-gray-700">Employee Name</th> */}
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Account Holder</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Bank</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Account (Masked)</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">IFSC</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Review Note</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankAccounts.map((account) => {
                      console.log('[EmployeeBankReviewPage] Rendering account:', {
                        id: account.empBankId,
                        holder: account.accountHolderName,
                        status: account.validationStatus,
                        reviewNote: account.reviewNote
                      })
                      return (
                        <tr key={account.empBankId} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-800">{account.accountHolderName}</td>
                          <td className="px-4 py-3 text-gray-800">{account.bankName || '-'}</td>
                          <td className="px-4 py-3 text-gray-800">{account.accountNumberMasked}</td>
                          <td className="px-4 py-3 text-gray-800">{account.ifscCode}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(account.validationStatus)}`}>
                              {account.validationStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-800 text-xs">
                            {(account.reviewNote && account.reviewNote !== 'N/A') ? account.reviewNote : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleReviewClick(account)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {page + 1} of {totalPages}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
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

      {/* Review Modal */}
      {showReviewModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Review Bank Account - {selectedAccount.accountHolderName}
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validation Status *
                </label>
                <select
                  value={reviewForm.validationStatus}
                  onChange={(e) => setReviewForm({ ...reviewForm, validationStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Note
                </label>
                <textarea
                  value={reviewForm.reviewNote}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewNote: e.target.value })}
                  placeholder="Enter your review notes..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {reviewing ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
