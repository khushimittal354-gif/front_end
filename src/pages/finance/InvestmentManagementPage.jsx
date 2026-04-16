import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMyInvestments, declareInvestment } from '../../services/routes/generalRoutes'

export default function InvestmentManagementPage() {
  const [loading, setLoading] = useState(true)
  const [declaring, setDeclaring] = useState(false)
  const [investments, setInvestments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const [declareForm, setDeclareForm] = useState({
    investmentType: 'MUTUAL_FUND',
    declaredAmount: '',
    fundId: '',
    companyId: '',
    securityName: '',
  })

  // Fetch investments on mount
  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true)
        setError('')
        console.log('[InvestmentManagementPage] Fetching investments with pagination...')

        const response = await getMyInvestments(0, 10)
        console.log('[InvestmentManagementPage] Investments fetched:', response)
        console.log('[InvestmentManagementPage] Response structure - content:', response.content, 'totalElements:', response.totalElements)

        // Extract content array from Page response
        const investmentsList = response.content || []
        console.log('[InvestmentManagementPage] Extracted investments list:', investmentsList)
        
        setInvestments(investmentsList)
      } catch (err) {
        console.error('[InvestmentManagementPage] Error fetching investments:', err.message)
        const errorMsg = err.response?.data?.message || err.message || 'Unable to fetch investments'
        setError(errorMsg)
        toast.error(errorMsg)
        setInvestments([])
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()
  }, [])

  const handleDeclareInvestment = async (event) => {
    event.preventDefault()
    setError('')
    console.log('[InvestmentManagementPage] Declare investment form submitted')

    // Validate required fields
    if (!declareForm.declaredAmount) {
      const msg = 'Please enter declared amount.'
      console.warn('[InvestmentManagementPage]', msg)
      toast.error(msg)
      return
    }

    if (declareForm.investmentType === 'MUTUAL_FUND' && !declareForm.fundId) {
      const msg = 'Please select a mutual fund.'
      console.warn('[InvestmentManagementPage]', msg)
      toast.error(msg)
      return
    }

    if ((declareForm.investmentType === 'DIRECT_EQUITY' || declareForm.investmentType === 'BONDS') &&
        (!declareForm.companyId || !declareForm.securityName)) {
      const msg = 'Please enter company ID and security name.'
      console.warn('[InvestmentManagementPage]', msg)
      toast.error(msg)
      return
    }

    const payload = {
      investmentType: declareForm.investmentType,
      declaredAmount: parseInt(declareForm.declaredAmount),
      ...(declareForm.investmentType === 'MUTUAL_FUND' && { fundId: parseInt(declareForm.fundId) }),
      ...(declareForm.investmentType !== 'MUTUAL_FUND' && {
        companyId: parseInt(declareForm.companyId),
        securityName: declareForm.securityName.trim(),
      }),
    }

    console.log('[InvestmentManagementPage] Payload:', payload)

    try {
      setDeclaring(true)
      console.log('[InvestmentManagementPage] Calling declareInvestment API...')

      const newInvestment = await declareInvestment(payload)
      console.log('[InvestmentManagementPage] API call successful!')

      setInvestments([newInvestment, ...investments])
      setDeclareForm({
        investmentType: 'MUTUAL_FUND',
        declaredAmount: '',
        fundId: '',
        companyId: '',
        securityName: '',
      })
      setShowForm(false)
      const successMsg = 'Investment declared successfully. Awaiting compliance review.'
      console.log('[InvestmentManagementPage]', successMsg)
      toast.success(successMsg)
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unable to declare investment.'
      console.error('[InvestmentManagementPage] Error declaring investment:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setDeclaring(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return 'text-green-600 bg-green-50'
      case 'NON_COMPLIANT':
        return 'text-red-600 bg-red-50'
      case 'PENDING_REVIEW':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-slate-600 bg-slate-50'
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
        <h1 className="text-2xl font-semibold text-slate-900">Investment Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Declare investments, view compliance status, and manage your portfolio.
        </p>
      </div>

      {/* Declare Form */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Declare New Investment
        </button>
      ) : (
        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Declare Investment</h2>
          <form className="space-y-4" onSubmit={handleDeclareInvestment}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Investment Type</label>
                <select
                  value={declareForm.investmentType}
                  onChange={(event) =>
                    setDeclareForm((previous) => ({
                      ...previous,
                      investmentType: event.target.value,
                      fundId: '',
                      companyId: '',
                      securityName: '',
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                >
                  <option value="MUTUAL_FUND">Mutual Fund</option>
                  <option value="DIRECT_EQUITY">Direct Equity</option>
                  <option value="BONDS">Bonds</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Declared Amount</label>
                <input
                  type="number"
                  value={declareForm.declaredAmount}
                  onChange={(event) =>
                    setDeclareForm((previous) => ({
                      ...previous,
                      declaredAmount: event.target.value,
                    }))
                  }
                  placeholder="Amount in rupees"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                />
              </div>
            </div>

            {declareForm.investmentType === 'MUTUAL_FUND' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Fund ID</label>
                <input
                  type="number"
                  value={declareForm.fundId}
                  onChange={(event) =>
                    setDeclareForm((previous) => ({
                      ...previous,
                      fundId: event.target.value,
                    }))
                  }
                  placeholder="Enter fund ID"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                />
              </div>
            )}

            {(declareForm.investmentType === 'DIRECT_EQUITY' || declareForm.investmentType === 'BONDS') && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Company ID</label>
                    <input
                      type="number"
                      value={declareForm.companyId}
                      onChange={(event) =>
                        setDeclareForm((previous) => ({
                          ...previous,
                          companyId: event.target.value,
                        }))
                      }
                      placeholder="Enter company ID"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Security Name</label>
                    <input
                      type="text"
                      value={declareForm.securityName}
                      onChange={(event) =>
                        setDeclareForm((previous) => ({
                          ...previous,
                          securityName: event.target.value,
                        }))
                      }
                      placeholder="Enter security name"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={declaring}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {declaring ? 'Declaring...' : 'Declare Investment'}
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

      {/* Investments List */}
      <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Investments</h2>

        {loading && <p className="text-sm text-slate-600">Loading investments...</p>}

        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && investments.length === 0 && (
          <p className="text-sm text-slate-600">No investments declared yet. Declare your first investment!</p>
        )}

        {!loading && !error && investments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Amount</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Details</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Declared At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {investments.map((inv) => (
                  <tr key={inv.empInvestmentId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{inv.investmentType}</td>
                    <td className="px-4 py-3 text-slate-900">₹{inv.declaredAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {inv.fundName && (
                        <div>
                          <p>{inv.fundName}</p>
                          <p className="text-xs text-slate-500">{inv.fundCode}</p>
                        </div>
                      )}
                      {inv.companyName && (
                        <div>
                          <p>{inv.companyName}</p>
                          <p className="text-xs text-slate-500">{inv.securityName}</p>
                        </div>
                      )}
                    </td>
                    <td className={`px-4 py-3 rounded ${getStatusColor(inv.complianceStatus)}`}>
                      {inv.complianceStatus}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(inv.declaredAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
