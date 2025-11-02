// This file doesn't need to exist - dashboard page is at dashboard/page.tsx
// Keeping this file for potential future use, but redirecting to actual dashboard

import { redirect } from 'next/navigation'

export default async function DashboardRedirect({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/dashboard`)
}

