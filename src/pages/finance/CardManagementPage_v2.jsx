import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMyCards, addCard, updateCardStatus } from '../../services/routes/generalRoutes'

export default function CardManagementPage() {
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [cards, setCards] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const [addForm, setAddForm] = useState({
    cardType: 'DEBIT',
    cardNumber: '',
    expiryDate: '',
  })

  // Fetch my cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        setError('')
        console.log('[CardManagementPage] Fetching my cards...')

        const response = await getMyCards()
        console.log('[CardManagementPage] Cards fetched:', response)

        setCards(Array.isArray(response) ? response : [])
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Unable to fetch cards'
        console.error('[CardManagementPage] Error fetching cards:', errorMsg)
        setError(errorMsg)
        toast.error(errorMsg)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  const handleAddCard = async (event) => {
    event.preventDefault()
    setError('')
    console.log('[CardManagementPage] Add card form submitted')

    // Validation
    if (!addForm.cardNumber.trim()) {
      const msg = 'Please enter card number.'
      console.warn('[CardManagementPage]', msg)
      toast.error(msg)
      return
    }

    if (!addForm.expiryDate.trim()) {
      const msg = 'Please enter expiry date (MM-yyyy format).'
      console.warn('[CardManagementPage]', msg)
      toast.error(msg)
      return
    }

    // Check for existing ACTIVE card of same type
    const hasActiveCard = cards.some(
      (card) => card.cardType === addForm.cardType && card.cardStatus === 'ACTIVE'
    )
    if (hasActiveCard) {
      const msg = `You already have an ACTIVE ${addForm.cardType} card. Block the existing card before registering a new one.`
      console.warn('[CardManagementPage]', msg)
      toast.error(msg)
      return
    }

    const payload = {
      cardType: addForm.cardType,
      cardNumber: addForm.cardNumber.trim(),
      expiryDate: addForm.expiryDate.trim(),
    }

    console.log('[CardManagementPage] Payload:', { ...payload, cardNumber: '****' })

    try {
      setAdding(true)
      console.log('[CardManagementPage] Calling addCard API...')

      const newCard = await addCard(payload)
      console.log('[CardManagementPage] API call successful! New card:', newCard)

      setCards([newCard, ...cards])
      setAddForm({
        cardType: 'DEBIT',
        cardNumber: '',
        expiryDate: '',
      })
      setShowForm(false)
      const successMsg = 'Card registered successfully!'
      console.log('[CardManagementPage]', successMsg)
      toast.success(successMsg)
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unable to register card.'
      console.error('[CardManagementPage] Error adding card:', {
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

  const handleUpdateStatus = async (cardId, newStatus) => {
    console.log('[CardManagementPage] Update status - cardId:', cardId, 'newStatus:', newStatus)

    try {
      const updatedCard = await updateCardStatus(cardId, newStatus)
      console.log('[CardManagementPage] Status updated successfully:', updatedCard)

      setCards(cards.map((c) => (c.id === cardId ? updatedCard : c)))
      const successMsg = `Card status updated to ${newStatus}`
      console.log('[CardManagementPage]', successMsg)
      toast.success(successMsg)
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unable to update card status.'
      console.error('[CardManagementPage] Error updating status:', errorMsg)
      toast.error(errorMsg)
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'BLOCKED':
        return 'bg-yellow-100 text-yellow-800'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const canUnblock = (card) => {
    // BLOCKED card can be unblocked if:
    // 1. It's currently BLOCKED
    // 2. No other ACTIVE card of same type exists
    if (card.cardStatus !== 'BLOCKED') return false
    return !cards.some((c) => c.cardType === card.cardType && c.cardStatus === 'ACTIVE' && c.id !== card.id)
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
        <h1 className="text-2xl font-semibold text-slate-900">Card Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Register and manage your debit and credit cards.
        </p>
      </div>

      {/* Add Card Form */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Register New Card
        </button>
      ) : (
        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Register New Card</h2>
          <form className="space-y-4" onSubmit={handleAddCard}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Card Type</label>
                <select
                  value={addForm.cardType}
                  onChange={(event) =>
                    setAddForm((previous) => ({
                      ...previous,
                      cardType: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                >
                  <option value="DEBIT">Debit Card</option>
                  <option value="CREDIT">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Card Number</label>
                <input
                  type="text"
                  value={addForm.cardNumber}
                  onChange={(event) =>
                    setAddForm((previous) => ({
                      ...previous,
                      cardNumber: event.target.value,
                    }))
                  }
                  placeholder="Enter 16-digit card number"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Expiry Date</label>
                <input
                  type="text"
                  value={addForm.expiryDate}
                  onChange={(event) =>
                    setAddForm((previous) => ({
                      ...previous,
                      expiryDate: event.target.value,
                    }))
                  }
                  placeholder="MM-yyyy (e.g., 12-2025)"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={adding}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {adding ? 'Registering...' : 'Register Card'}
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

      {/* Cards List */}
      <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Cards</h2>

        {loading && <p className="text-sm text-slate-600">Loading cards...</p>}

        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && cards.length === 0 && (
          <p className="text-sm text-slate-600">No cards registered yet. Register your first card!</p>
        )}

        {!loading && !error && cards.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Card Number</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Expiry</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Issued</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{card.cardNumberMasked}</td>
                    <td className="px-4 py-3 text-slate-600">{card.cardType}</td>
                    <td className="px-4 py-3 text-slate-600">{card.expiryDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(card.cardStatus)}`}>
                        {card.cardStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {card.issuedAt && new Date(card.issuedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {card.cardStatus === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(card.id, 'BLOCKED')}
                            className="rounded px-2 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-50"
                          >
                            Block
                          </button>
                        )}
                        {card.cardStatus === 'BLOCKED' && canUnblock(card) && (
                          <button
                            onClick={() => handleUpdateStatus(card.id, 'ACTIVE')}
                            className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                          >
                            Unblock
                          </button>
                        )}
                        {card.cardStatus === 'BLOCKED' && !canUnblock(card) && (
                          <span className="text-xs text-slate-500">Cannot unblock (another ACTIVE card exists)</span>
                        )}
                      </div>
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
