'use client'

declare global {
  interface Window { Razorpay: any }
}

interface Props {
  plan: 'starter' | 'growth'
  label: string
  onSuccess?: () => void
}

export default function RazorpayButton({ plan, label, onSuccess }: Props) {
  async function handlePayment() {
    const res = await fetch('/api/billing/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { orderId, amount, name } = await res.json()

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    document.body.appendChild(script)
    script.onload = () => {
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'PromoKit',
        description: name,
        order_id: orderId,
        handler: async (response: any) => {
          const verify = await fetch('/api/billing/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, plan }),
          })
          if (verify.ok) {
            onSuccess?.()
          } else {
            const err = await verify.json().catch(() => ({}))
            alert(`Payment recorded but plan activation failed. Please contact support.\nRef: ${response.razorpay_payment_id}\nError: ${err.error ?? 'Unknown'}`)
          }
        },
        theme: { color: '#FF6B1A' },
      })
      rzp.open()
    }
  }

  return (
    <button onClick={handlePayment} className="btn-primary px-6 py-3 font-bold rounded-xl text-sm w-full">
      {label}
    </button>
  )
}
