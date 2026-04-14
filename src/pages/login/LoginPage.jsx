export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-slate-900">LOGIN</h1>
      <form className="mt-6 space-y-4">
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Username</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Password</span>
          <input
            type="password"
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none"
          />
        </label>
        <button
          type="button"
          className="rounded border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Sign in
        </button>
      </form>
    </section>
  )
}
