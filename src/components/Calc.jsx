import { useState } from 'react'

const fmt = (n) => Math.round(n).toLocaleString('en-US')

export default function Calc({ start = 'loan' }) {
  const [mode, setMode] = useState(start)
  const [amount, setAmount] = useState(10000)
  const [rate, setRate] = useState(start === 'loan' ? 12 : 8)
  const [months, setMonths] = useState(24)
  const loan = mode === 'loan'
  const r = rate / 1200
  const pay = r ? (amount * r) / (1 - (1 + r) ** -months) : amount / months
  const income = (amount * rate * months) / 1200

  const rows = [
    ['Amount', amount, 1000, 100000, 1000, setAmount],
    ['Yearly rate, %', rate, 1, 25, 0.5, setRate],
    ['Term, months', months, 3, 120, 1, setMonths],
  ]

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-5 inline-flex rounded-full bg-paper p-1 text-sm font-semibold">
        {['loan', 'deposit'].map((m) => (
          <button key={m} onClick={() => { setMode(m); setRate(m === 'loan' ? 12 : 8) }}
            className={`rounded-full px-5 py-1.5 transition ${mode === m ? 'bg-ink text-white' : 'text-ink/60'}`}>
            {m === 'loan' ? 'Loan' : 'Deposit'}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          {rows.map(([label, v, min, max, step, set]) => (
            <label key={label} className="block text-sm">
              <span className="flex justify-between font-semibold"><span>{label}</span><span>{v}</span></span>
              <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} />
            </label>
          ))}
        </div>
        <div className="flex flex-col justify-center rounded-xl bg-paper p-6">
          <p className="text-sm text-ink/60">{loan ? 'Monthly payment' : 'Interest earned'}</p>
          <p className="font-display text-4xl font-extrabold tabular-nums">{fmt(loan ? pay : income)}</p>
          <p className="mt-3 text-sm text-ink/60">{loan ? `Total to repay: ${fmt(pay * months)}` : `Balance at the end: ${fmt(amount + income * 0.9)} (after 10% tax)`}</p>
          <p className="mt-2 text-xs text-ink/40">Estimates only. Not a public offer.</p>
        </div>
      </div>
    </div>
  )
}
