import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { addMutualFund, updateMutualFundStatus, getMutualFundById } from '../../services/routes/financeRoutes'
import { getAllMutualFunds } from '../../services/routes/generalRoutes'

export default function MutualFundManagementPage() {
  // Get role from localStorage user object
  let userRole = 'EMPLOYEE'
  try {
    const userJson = localStorage.getItem('finsecure_user')
    if (userJson) {
      const user = JSON.parse(userJson)
      userRole = user?.role || 'EMPLOYEE'
      console.log('[MutualFundManagementPage] User role from localStorage:', userRole)
    }
  } catch (error) {
    console.error('[MutualFundManagementPage] Error getting user role:', error)
  }
  
  const isFinanceUser = userRole === 'FINANCE'
  console.log('[MutualFundManagementPage] Is FINANCE user:', isFinanceUser)

  // Check access
  if (!isFinanceUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to manage mutual funds. Only finance users can access this page.</p>
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
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [funds, setFunds] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const [addForm, setAddForm] = useState({
    fundName: '',
    fundCode: '',
    category: '',
    status: 'WHITELISTED',
  })

  // Fetch mutual funds
  const fetchFunds = async (pageNum = 0) => {
    try {
      setLoading(true)
      setError('')
      console.log('[MutualFundManagementPage] Fetching funds with filters:', {
        page: pageNum,
        status: filterStatus || 'none',
        category: filterCategory || 'none',
      })

      const response = await getAllMutualFunds(pageNum, 10, filterStatus || null, filterCategory || null)
      console.log('[MutualFundManagementPage] Funds fetched:', response)

      setFunds(response.content || response)
      setTotalPages(response.totalPages || 1)
      setPage(pageNum)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Unable to fetch funds'
      console.error('[MutualFundManagementPage] Error fetching funds:', errorMsg)
      setError(errorMsg)
      toast.error(errorMsg)
      setFunds([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFunds(0)
  }, [filterStatus, filterCategory])

  const handleAddFund = async (event) => {
    event.preventDefault()
    setError('')
    console.log('[MutualFundManagementPage] Add fund form submitted')

    if (!addForm.fundName.trim()) {
      const msg = 'Please enter fund name.'
      console.warn('[MutualFundManagementPage]', msg)
      toast.error(msg)
      return
    }

    if (!addForm.fundCode.trim()) {
      const msg = 'Please enter fund code.'
      console.warn('[MutualFundManagementPage]', msg)
      toast.error(msg)
      return
    }

    if (!addForm.category.trim()) {
      const msg = 'Please enter category.'
      console.warn('[MutualFundManagementPage]', msg)
      toast.error(msg)
      return
    }

    const payload = {
      fundName: addForm.fundName.trim(),
      fundCode: addForm.fundCode.trim(),
      category: addForm.category.trim(),
      status: addForm.status,
    }

    console.log('[MutualFundManagementPage] Payload:', payload)

    try {
      setAdding(true)
      console.log('[MutualFundManagementPage] Calling addMutualFund API...')

      const newFund = await addMutualFund(payload)
      console.log('[MutualFundManagementPage] API call successful! New fund:', newFund)

      setFunds([newFund, ...funds])
      setAddForm({
        fundName: '',
        fundCode: '',
        category: '',
        status: 'WHITELISTED',
      })
      setShowForm(false)
      const successMsg = 'Mutual fund added successfully!'
      console.log('[MutualFundManagementPage]', successMsg)
      toast.success(successMsg)
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unable to add mutual fund.'
      console.error('[MutualFundManagementPage] Error adding fund:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setAdding(false)
    }
  }

  const handleUpdateStatus = async (fundId, newStatus) => {
    console.log('[MutualFundManagementPage] Update status - fundId:', fundId, 'newStatus:', newStatus)

    try {
      const updatedFund = await updateMutualFundStatus(fundId, newStatus)
      console.log('[MutualFundManagementPage] Status updated successfully:', updatedFund)

      setFunds(funds.map(f => f.investmentId === fundId ? updatedFund : f))
      const successMsg = `Fund status updated to ${newStatus}`
      console.log('[MutualFundManagementPage]', successMsg)
      toast.success(successMsg)
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unable to update fund status.'
      console.error('[MutualFundManagementPage] Error updating status:', errorMsg)
      toast.error(errorMsg)
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'WHITELISTED':
        return 'bg-green-100 text-green-800'
      case 'BLACKLISTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-8 p-6">
      <Link
        to="/finance"
        className="inline-block rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
      >
        Back to Finance Home
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mutual Fund Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Add, view, and manage company mutual funds and their investment status.
        </p>
      </div>

      {/* Add Fund Form */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Mutual Fund
        </button>
      ) : (
        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Add New Mutual Fund</h2>
          <form className="space-y-4" onSubmit={handleAddFund}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Fund Name</label>
                <input
                  type="text"
                  value={addForm.fundName}
                  onChange={(event) =>
                    setAddForm((previous) => ({
                      ...previous,
                      fundName: event.target.value,
                    }))
                  }
                  placeholder="E.g., Blue Chip Growth Fund"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Fund Code</label>
                <input
                  type="text"
                  value={addForm.fundCode}
                  onChange={(event) =>
                    setAddForm((previous) => ({
                      ...previous,
                      fundCode: event.target.value,
                    }))
                  }
                  placeholder="E.g., BCG001"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                <input
                  type="text"
                  value={addForm.category}
                  onChange={(event) =>
                    setAddForm((previous) => ({
                      ...previous,
                      category: event.target.value,
                    }))
                  }
                  placeholder="E.g., Large Cap, Small Cap, Hybrid"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={addForm.status}
                  onChange={(event) =>
                    setAddForm((previous) => ({
                      ...previous,
                      status: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                >
                  <option value="WHITELISTED">Whitelisted</option>
                  <option value="BLACKLISTED">Blacklisted</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={adding}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {adding ? 'Adding...' : 'Add Fund'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filters */}
      <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-slate-700">Filters</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">Status</label>
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
            >
              <option value="">All Statuses</option>
              <option value="WHITELISTED">Whitelisted</option>
              <option value="BLACKLISTED">Blacklisted</option>
            </select>
          </div>

          {/* <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">Category</label>
            <input
              type="text"
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
              placeholder="Filter by category..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
            />
          </div> */}
        </div>
      </section>

      {/* Mutual Funds List */}
      <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Mutual Funds</h2>

        {loading && <p className="text-sm text-slate-600">Loading funds...</p>}

        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && funds.length === 0 && (
          <p className="text-sm text-slate-600">No mutual funds found. Create your first fund!</p>
        )}

        {!loading && !error && funds.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Fund Name</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Code</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Category</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {funds.map((fund) => (
                  <tr key={fund.investmentId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{fund.fundName}</td>
                    <td className="px-4 py-3 text-slate-600">{fund.fundCode}</td>
                    <td className="px-4 py-3 text-slate-600">{fund.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(fund.status)}`}>
                        {fund.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {fund.status !== 'WHITELISTED' && (
                          <button
                            onClick={() => handleUpdateStatus(fund.investmentId, 'WHITELISTED')}
                            className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                          >
                            Whitelist
                          </button>
                        )}
                        {fund.status !== 'BLACKLISTED' && (
                          <button
                            onClick={() => handleUpdateStatus(fund.investmentId, 'BLACKLISTED')}
                            className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Blacklist
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-600">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchFunds(page - 1)}
                disabled={page === 0}
                className="rounded border border-slate-300 px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchFunds(page + 1)}
                disabled={page >= totalPages - 1}
                className="rounded border border-slate-300 px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
