import { useState, useEffect } from 'react'
import { 
  getEmployeeInvestments,
  getEmployeeInvestmentsByCompliance,
  getEmployeeInvestmentById,
  reviewEmployeeInvestment
} from '../../services/routes/financeRoutes'
import toast from 'react-hot-toast'

export default function EmployeeInvestmentReviewPage() {
  // Get role from localStorage user object
  let userRole = 'EMPLOYEE'
  try {
    const userJson = localStorage.getItem('finsecure_user')
    if (userJson) {
      const user = JSON.parse(userJson)
      userRole = user?.role || 'EMPLOYEE'
      console.log('[EmployeeInvestmentReviewPage] User role from localStorage:', userRole)
    }
  } catch (error) {
    console.error('[EmployeeInvestmentReviewPage] Error getting user role:', error)
  }
  
  const isFinanceUser = userRole === 'FINANCE'
  console.log('[EmployeeInvestmentReviewPage] Is FINANCE user:', isFinanceUser)

  // Check access
  if (!isFinanceUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to review employee investments. Only finance users can access this page.</p>
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
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [complianceFilter, setComplianceFilter] = useState('')
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    complianceStatus: '',
    reviewNote: ''
  })

  // Fetch investments
  useEffect(() => {
    console.log(investments);
    
    fetchInvestments()
  }, [page, complianceFilter])

  const fetchInvestments = async () => {
    try {
      setLoading(true)
      
      console.log('[EmployeeInvestmentReviewPage] Fetching investments with filter:', complianceFilter || 'ALL')
      
      let response
      const pageSize = 50  // Increased page size to get more records
      if (complianceFilter) {
        console.log('[EmployeeInvestmentReviewPage] Calling getEmployeeInvestments with status:', complianceFilter)
        response = await getEmployeeInvestments(page, pageSize, complianceFilter)
      } else {
        console.log('[EmployeeInvestmentReviewPage] Calling getEmployeeInvestments (no filter - ALL statuses)')
        response = await getEmployeeInvestments(page, pageSize, null)
      }
      
      console.log('[EmployeeInvestmentReviewPage] API Response:', response)
      console.log('[EmployeeInvestmentReviewPage] Total items returned:', response.content?.length || 0)
      console.log('[EmployeeInvestmentReviewPage] Total pages:', response.totalPages)
      console.log('[EmployeeInvestmentReviewPage] Raw response data:', JSON.stringify(response))
      
      setInvestments(response.content || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error('[EmployeeInvestmentReviewPage] Error fetching investments:', error)
      console.error('[EmployeeInvestmentReviewPage] Full error:', JSON.stringify(error))
      toast.error('Failed to load investments')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (investment) => {
    setSelectedInvestment(investment)
    setReviewForm({
      complianceStatus: investment.complianceStatus || '',
      reviewNote: investment.reviewNote || ''
    })
    setShowReviewModal(true)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!reviewForm.complianceStatus.trim()) {
      toast.error('Compliance status is required')
      return
    }

    try {
      setReviewing(true)
      console.log('[EmployeeInvestmentReviewPage] Submitting review for investment:', selectedInvestment.empInvestmentId)
      console.log('[EmployeeInvestmentReviewPage] Review payload:', {
        complianceStatus: reviewForm.complianceStatus,
        reviewNote: reviewForm.reviewNote
      })
      
      const payload = {
        complianceStatus: reviewForm.complianceStatus,
        reviewNote: reviewForm.reviewNote
      }

      const result = await reviewEmployeeInvestment(selectedInvestment.empInvestmentId, payload)
      console.log('[EmployeeInvestmentReviewPage] Review API response:', result)
      console.log('[EmployeeInvestmentReviewPage] Updated investment status:', result?.complianceStatus)
      
      toast.success('Investment review submitted successfully')
      setShowReviewModal(false)
      
      // Small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Refresh investments immediately - fetch all to see the updated status
      console.log('[EmployeeInvestmentReviewPage] Fetching latest investments from backend...')
      try {
        const allInvestments = await getEmployeeInvestments(0, 50, null)
        console.log('[EmployeeInvestmentReviewPage] Fetched fresh investments count:', allInvestments.content?.length)
        console.log('[EmployeeInvestmentReviewPage] Fresh investment data:', JSON.stringify(allInvestments.content, null, 2))
        
        // Verify the specific investment was updated
        const updatedInv = allInvestments.content?.find(inv => inv.empInvestmentId === selectedInvestment.empInvestmentId)
        if (updatedInv) {
          console.log('[EmployeeInvestmentReviewPage] Verified - Investment status updated to:', updatedInv.complianceStatus)
        } else {
          console.warn('[EmployeeInvestmentReviewPage] WARNING - Updated investment not found in fresh data')
        }
        
        // Update component state
        setInvestments(allInvestments.content || [])
        setTotalPages(allInvestments.totalPages || 1)
        setPage(0)
        setComplianceFilter('')
        
        console.log('[EmployeeInvestmentReviewPage] Component state updated with fresh data')
      } catch (refreshError) {
        console.error('[EmployeeInvestmentReviewPage] Error refreshing investments:', refreshError)
        toast.error('Review submitted but failed to refresh list')
      }
    } catch (error) {
      console.error('[EmployeeInvestmentReviewPage] Error submitting review:', error)
      console.error('[EmployeeInvestmentReviewPage] Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setReviewing(false)
    }
  }

  const getComplianceColor = (status) => {
    const colors = {
      'COMPLIANT': 'bg-green-100 text-green-800',
      'NON_COMPLIANT': 'bg-red-100 text-red-800',
      'PENDING_REVIEW': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Investments Review</h1>
          <p className="text-gray-600 mt-2">Review and manage employee investment compliance (Mutual Funds, Equities, Bonds)</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Compliance Status
              </label>
              <select
                value={complianceFilter}
                onChange={(e) => {
                  setComplianceFilter(e.target.value)
                  setPage(0)
                }}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Status</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="COMPLIANT">Compliant</option>
                <option value="NON_COMPLIANT">Non-Compliant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Investments Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Investments</h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading investments...</p>
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No investments found matching the filter</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Employee</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Investment Type</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Detail</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Review Note</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>

                    {console.log("hi" + investments)}
                    
                    {investments.map((investment) => {
                      
                      console.log('[EmployeeInvestmentReviewPage] Rendering investment:', {
                        id: investment.empInvestmentId,
                        employee: investment.employeeName,
                        type: investment.investmentType,
                        status: investment.complianceStatus
                      })
                      return (
                        <tr key={investment.empInvestmentId} className="border-t hover:bg-gray-50">
                         
                          <td className="px-4 py-3 text-gray-800">{investment.employeeName}</td>
                          <td className="px-4 py-3 text-gray-800">{investment.investmentType}</td>
                          <td className="px-4 py-3 text-right text-gray-800">
                            ₹{investment.declaredAmount?.toLocaleString('en-IN') || 0}
                          </td>
                          <td className="px-4 py-3 text-gray-800 text-xs">
                            {investment.fundName || investment.securityName || investment.companyName || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getComplianceColor(investment.complianceStatus)}`}>
                              {investment.complianceStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-800 text-xs">
                            {investment.reviewNote || '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleReviewClick(investment)}
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
      {showReviewModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Review Investment - {selectedInvestment.employeeName}
            </h3>

            <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
              <p className="font-medium text-gray-700">{selectedInvestment.investmentType}</p>
              <p className="text-gray-600">Amount: ₹{selectedInvestment.declaredAmount?.toLocaleString('en-IN')}</p>
              <p className="text-gray-600">Detail: {selectedInvestment.fundName || selectedInvestment.securityName || selectedInvestment.companyName || '-'}</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compliance Status *
                </label>
                <select
                  value={reviewForm.complianceStatus}
                  onChange={(e) => setReviewForm({ ...reviewForm, complianceStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="COMPLIANT">Compliant</option>
                  <option value="NON_COMPLIANT">Non-Compliant</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
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
