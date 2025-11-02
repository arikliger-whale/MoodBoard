import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/request'

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/dashboard`)
}

