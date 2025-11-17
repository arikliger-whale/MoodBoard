import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/request'

export const dynamic = 'force-dynamic'

export default function RootPage() {
  redirect(`/${defaultLocale}`)
}

