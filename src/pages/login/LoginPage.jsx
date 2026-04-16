import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { login, authLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectPath = location.state?.from?.pathname || '/hr'

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    try {
      await login(username, password)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'Login failed. Please try again.')
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-slate-900">LOGIN</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none"
            required
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none"
            required
          />
        </label>

        {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={authLoading}
          className="rounded border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {authLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}
