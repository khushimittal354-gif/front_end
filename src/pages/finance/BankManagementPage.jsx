import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createBankAccount, getMyBankAccount, updateMyBankAccount } from '../../services/routes/generalRoutes'

export default function BankManagementPage() {
  const [updateCount, setUpdateCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasAccount, setHasAccount] = useState(false)
  const [addForm, setAddForm] = useState({
    bankId: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  })

  const [updateForm, setUpdateForm] = useState({
    bankId: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  })

  const [bankDetails, setBankDetails] = useState({
    empBankId: 'N/A',
    accountHolderName: 'Not registered',
    bankName: 'N/A',
    bankCode: 'N/A',
    accountNumberMasked: 'N/A',
    ifscCode: 'N/A',
    validationStatus: 'N/A',
    reviewNote: 'N/A',
    lastUpdated: 'N/A',
  })

  // Initialize and load update count from localStorage
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-IN')
    const storedData = localStorage.getItem('bankAccountUpdateCount')
    
    if (storedData) {
      try {
        const { count, date } = JSON.parse(storedData)
        // If it's a new day, reset counter
        if (date !== today) {
          setUpdateCount(0)
          localStorage.setItem('bankAccountUpdateCount', JSON.stringify({ count: 0, date: today }))
        } else {
          setUpdateCount(count)
          console.log('[BankManagementPage] Loaded update count from localStorage:', count)
        }
      } catch (error) {
        console.error('[BankManagementPage] Error loading update count:', error)
        setUpdateCount(0)
      }
    } else {
      setUpdateCount(0)
      localStorage.setItem('bankAccountUpdateCount', JSON.stringify({ count: 0, date: today }))
    }
  }, [])

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        setLoading(true)
        setError('')
        console.log('[BankManagementPage] Fetching bank account details...')

        const response = await getMyBankAccount()
        console.log('[BankManagementPage] Bank details fetched:', response)
        setBankDetails({
          empBankId: response.empBankId?.toString() || 'N/A',
          accountHolderName: response.accountHolderName || 'N/A',
          bankName: response.bankName || 'N/A',
          bankCode: response.bankCode || 'N/A',
          accountNumberMasked: response.accountNumberMasked || 'N/A',
          ifscCode: response.ifscCode || 'N/A',
          validationStatus: response.validationStatus || 'N/A',
          reviewNote: response.reviewNote || 'N/A',
          lastUpdated: response.createdAt ? new Date(response.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
        })
        
        // Populate update form with existing account data
        setUpdateForm({
          bankId: response.empBankId?.toString() || '',
          accountNumber: response.accountNumberMasked || '',
          ifscCode: response.ifscCode || '',
          accountHolderName: response.accountHolderName || '',
        })
        
        setHasAccount(true)
      } catch (err) {
        console.error('[BankManagementPage] Error fetching bank details:', err.message)
        const errorMsg = err.response?.data?.message || err.message || 'No bank account registered yet'
        console.log('[BankManagementPage] Error status:', err.response?.status)
        
        // If no account exists (404, 400, or "not found" error), allow adding
        if (err.response?.status === 404 || err.response?.status === 400 || err.response?.status === 204 ||
            errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('no account')) {
          console.log('[BankManagementPage] No account found, allowing add')
          setHasAccount(false)
          setError('')
        } else {
          setError(errorMsg)
          toast.error(errorMsg)
          setHasAccount(false)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBankDetails()
  }, [])

  // IFSC Code validation function
  const validateIFSC = (ifscCode) => {
    // Pattern: 4 uppercase letters + 0 + 6 alphanumeric characters (uppercase)
    // Example: ICIC0001234
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/
    return ifscPattern.test(ifscCode)
  }

  const handleUpdate = async (event) => {
    event.preventDefault()
    setUpdateMessage('')
    console.log('[BankManagementPage] Update Bank Account form submitted')

    const payload = {
      bankId: parseInt(updateForm.bankId),
      accountNumber: updateForm.accountNumber.trim(),
      ifscCode: updateForm.ifscCode.trim().toUpperCase(),
      accountHolderName: updateForm.accountHolderName.trim(),
    }
    console.log('[BankManagementPage] Update payload:', payload)

    if (!payload.bankId || !payload.accountNumber || !payload.ifscCode || !payload.accountHolderName) {
      const msg = 'Please fill all fields before updating.'
      console.warn('[BankManagementPage]', msg)
      setUpdateMessage(msg)
      toast.error(msg)
      return
    }

    if (!validateIFSC(payload.ifscCode)) {
      const msg = 'Invalid IFSC format. Expected format: 4 letters + 0 + 6 alphanumeric (e.g., ICIC0001234)'
      console.warn('[BankManagementPage]', msg)
      setUpdateMessage(msg)
      toast.error(msg)
      return
    }

    if (updateCount >= 3) {
      const msg = 'You have reached the maximum number of updates for today.'
      console.warn('[BankManagementPage]', msg)
      setUpdateMessage(msg)
      toast.error(msg)
      return
    }

    try {
      setUpdating(true)
      console.log('[BankManagementPage] Calling updateMyBankAccount API...')

      await updateMyBankAccount(payload)
      console.log('[BankManagementPage] API call successful!')

      // Fetch updated details after update
      const updatedDetails = await getMyBankAccount()
      setBankDetails({
        empBankId: updatedDetails.empBankId?.toString() || 'N/A',
        accountHolderName: updatedDetails.accountHolderName || 'N/A',
        bankName: updatedDetails.bankName || 'N/A',
        bankCode: updatedDetails.bankCode || 'N/A',
        accountNumberMasked: updatedDetails.accountNumberMasked || 'N/A',
        ifscCode: updatedDetails.ifscCode || 'N/A',
        validationStatus: updatedDetails.validationStatus || 'N/A',
        reviewNote: updatedDetails.reviewNote || 'N/A',
        lastUpdated: updatedDetails.createdAt ? new Date(updatedDetails.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      })
      
      // Increment and save update count to localStorage
      const today = new Date().toLocaleDateString('en-IN')
      const newCount = updateCount + 1
      setUpdateCount(newCount)
      localStorage.setItem('bankAccountUpdateCount', JSON.stringify({ count: newCount, date: today }))
      console.log('[BankManagementPage] Update count incremented to:', newCount)
      const successMsg = 'Bank account updated successfully.'
      console.log('[BankManagementPage]', successMsg)
      setUpdateMessage(successMsg)
      toast.success(successMsg)
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unable to update bank account.'
      console.error('[BankManagementPage] Error updating bank account:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      setUpdateMessage(errorMsg)
      toast.error(errorMsg)
    } finally {
      setUpdating(false)
    }
  }

  const handleAddBankAccount = async (event) => {
    event.preventDefault()
    setSaveMessage('')
    console.log('[BankManagementPage] Add Bank Account form submitted')

    const payload = {
      bankId: parseInt(addForm.bankId),
      accountNumber: addForm.accountNumber.trim(),
      ifscCode: addForm.ifscCode.trim().toUpperCase(),
      accountHolderName: addForm.accountHolderName.trim(),
    }
    console.log('[BankManagementPage] Form payload:', payload)

    if (!payload.bankId || !payload.accountNumber || !payload.ifscCode || !payload.accountHolderName) {
      const msg = 'Please fill all fields before saving.'
      console.warn('[BankManagementPage]', msg)
      setSaveMessage(msg)
      return
    }

    if (!validateIFSC(payload.ifscCode)) {
      const msg = 'Invalid IFSC format. Expected format: 4 letters + 0 + 6 alphanumeric (e.g., ICIC0001234)'
      console.warn('[BankManagementPage]', msg)
      setSaveMessage(msg)
      toast.error(msg)
      return
    }

    try {
      setSaving(true)
      console.log('[BankManagementPage] Calling createBankAccount API...')

      await createBankAccount(payload)
      console.log('[BankManagementPage] API call successful!')

      // Fetch updated details after save
      const updatedDetails = await getMyBankAccount()
      setBankDetails({
        empBankId: updatedDetails.empBankId?.toString() || 'N/A',
        accountHolderName: updatedDetails.accountHolderName || 'N/A',
        bankName: updatedDetails.bankName || 'N/A',
        bankCode: updatedDetails.bankCode || 'N/A',
        accountNumberMasked: updatedDetails.accountNumberMasked || 'N/A',
        ifscCode: updatedDetails.ifscCode || 'N/A',
        validationStatus: updatedDetails.validationStatus || 'PENDING',
        reviewNote: updatedDetails.reviewNote || 'N/A',
        lastUpdated: updatedDetails.createdAt ? new Date(updatedDetails.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      })
      
      // Populate update form with response data
      setUpdateForm({
        bankId: updatedDetails.empBankId?.toString() || '',
        accountNumber: updatedDetails.accountNumberMasked || '',
        ifscCode: updatedDetails.ifscCode || '',
        accountHolderName: updatedDetails.accountHolderName || '',
      })
      
      setAddForm({
        bankId: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
      })
      setHasAccount(true)
      const successMsg = 'Bank account saved successfully.'
      console.log('[BankManagementPage]', successMsg)
      setSaveMessage(successMsg)
      toast.success(successMsg)
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unable to save bank account.'
      console.error('[BankManagementPage] Error saving bank account:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      setSaveMessage(errorMsg)
      toast.error(errorMsg)
      
      // If account already exists, update UI
      if (error.response?.data?.message?.includes('already')) {
        console.log('[BankManagementPage] Account already registered, fetching details...')
        setHasAccount(true)
        // Fetch to update details
        fetchBankDetails()
      }
    } finally {
      setSaving(false)
    }
  }

  const fetchBankDetails = async () => {
    try {
      const response = await getMyBankAccount()
      console.log(response);
      
      setBankDetails({
        empBankId: response.empBankId?.toString() || 'N/A',
        accountHolderName: response.accountHolderName || 'N/A',
        bankName: response.bankName || 'N/A',
        bankCode: response.bankCode || 'N/A',
        accountNumberMasked: response.accountNumberMasked || 'N/A',
        ifscCode: response.ifscCode || 'N/A',
        validationStatus: response.validationStatus || 'N/A',
        reviewNote: response.reviewNote || 'N/A',
        lastUpdated: response.createdAt ? new Date(response.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      })
      setUpdateForm({
        bankId: response.empBankId?.toString() || '',
        accountNumber: response.accountNumberMasked || '',
        ifscCode: response.ifscCode || '',
        accountHolderName: response.accountHolderName || '',
      })
      setHasAccount(true)
    } catch (err) {
      console.error('[BankManagementPage] Error refetching bank details:', err.message)
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
        <h1 className="text-2xl font-semibold text-slate-900">Bank Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Add, update, and view bank account details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {!hasAccount ? (
          <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Add Bank Account</h2>
            <form className="space-y-3" onSubmit={handleAddBankAccount}>
              <input
                type="text"
                value={addForm.accountHolderName}
                onChange={(event) =>
                  setAddForm((previous) => ({
                    ...previous,
                    accountHolderName: event.target.value,
                  }))
                }
                placeholder="Account holder name"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
              />
              <input
                type="number"
                value={addForm.bankId}
                onChange={(event) =>
                  setAddForm((previous) => ({
                    ...previous,
                    bankId: event.target.value,
                  }))
                }
                placeholder="Bank ID"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
              />
              <input
                type="text"
                value={addForm.accountNumber}
                onChange={(event) =>
                  setAddForm((previous) => ({
                    ...previous,
                    accountNumber: event.target.value,
                  }))
                }
                placeholder="Account number"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
              />
              <div>
                <input
                  type="text"
                  value={addForm.ifscCode}
                  onChange={(event) =>
                    setAddForm((previous) => ({
                      ...previous,
                      ifscCode: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="IFSC code (e.g., ICIC0001234)"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Format: 4 letters + 0 + 6 alphanumeric (uppercase)</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? 'Saving...' : 'Save Account'}
              </button>

              {saveMessage ? <p className="text-sm text-slate-700">{saveMessage}</p> : null}
            </form>
          </section>
        ) : (
          <section className="rounded-lg border border-yellow-300 bg-yellow-50 p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-yellow-900">✓ Bank Account Registered</h2>
            <p className="text-sm text-yellow-800">
              Your bank account is already registered. You can update it using the form on the right, or contact support to make changes.
            </p>
          </section>
        )}

        {hasAccount && (
          <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Update Bank Account</h2>
            <p className="mb-4 text-sm text-slate-600">
              Updated today: {updateCount}/3
            </p>
            <form className="space-y-3" onSubmit={handleUpdate}>
            <input
              type="text"
              value={updateForm.accountHolderName}
              onChange={(event) =>
                setUpdateForm((previous) => ({
                  ...previous,
                  accountHolderName: event.target.value,
                }))
              }
              placeholder="Update account holder name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
            />
            <input
              type="number"
              value={updateForm.bankId}
              onChange={(event) =>
                setUpdateForm((previous) => ({
                  ...previous,
                  bankId: event.target.value,
                }))
              }
              placeholder="Update Bank ID"
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
            />
            <input
              type="text"
              value={updateForm.accountNumber}
              onChange={(event) =>
                setUpdateForm((previous) => ({
                  ...previous,
                  accountNumber: event.target.value,
                }))
              }
              placeholder="Update account number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
            />
            <div>
              <input
                type="text"
                value={updateForm.ifscCode}
                onChange={(event) =>
                  setUpdateForm((previous) => ({
                    ...previous,
                    ifscCode: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="Update IFSC code (e.g., ICIC0001234)"
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Format: 4 letters + 0 + 6 alphanumeric (uppercase)</p>
            </div>
            <button
              type="submit"
              disabled={updating || updateCount >= 3}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {updating ? 'Updating...' : updateCount >= 3 ? 'Limit Reached' : 'Update Account'}
            </button>

            {updateMessage ? <p className="text-sm text-slate-700">{updateMessage}</p> : null}
            </form>
          </section>
        )}
      </div>

      <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Bank Details</h2>

        {loading && (
          <p className="text-sm text-slate-600">Loading bank details...</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Bank ID</p>
              <p className="mt-1 font-medium text-slate-900">{bankDetails.empBankId}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Bank Name</p>
              <p className="mt-1 font-medium text-slate-900">{bankDetails.bankName}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Bank Code</p>
              <p className="mt-1 font-medium text-slate-900">{bankDetails.bankCode}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Account Holder Name</p>
              <p className="mt-1 font-medium text-slate-900">{bankDetails.accountHolderName}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Account Number (Masked)</p>
              <p className="mt-1 font-medium text-slate-900">{bankDetails.accountNumberMasked}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">IFSC Code</p>
              <p className="mt-1 font-medium text-slate-900">{bankDetails.ifscCode}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Validation Status</p>
              <p className={`mt-1 font-medium ${bankDetails.validationStatus === 'CONFIRMED' ? 'text-green-600' : 'text-yellow-600'}`}>
                {bankDetails.validationStatus}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Review Note</p>
              <p className="mt-1 font-medium text-slate-900">{bankDetails.reviewNote}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Last Updated</p>
              <p className="mt-1 font-medium text-slate-900">{bankDetails.lastUpdated}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}