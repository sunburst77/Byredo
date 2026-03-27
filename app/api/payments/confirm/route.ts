import { NextRequest, NextResponse } from 'next/server'

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm'

type ConfirmRequestBody = {
  paymentKey: string
  orderId: string
  amount: number
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.TOSS_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ message: 'Payment secret key is not configured.' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const { paymentKey, orderId, amount } = body as Partial<ConfirmRequestBody>

  if (!paymentKey || !orderId || typeof amount !== 'number') {
    return NextResponse.json(
      { message: 'paymentKey, orderId, amount are required.' },
      { status: 400 },
    )
  }

  const credentials = Buffer.from(`${secretKey}:`).toString('base64')

  const tossResponse = await fetch(TOSS_CONFIRM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  })

  const data: unknown = await tossResponse.json()

  if (!tossResponse.ok) {
    return NextResponse.json(data, { status: tossResponse.status })
  }

  return NextResponse.json(data, { status: 200 })
}
