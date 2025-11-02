import { MantineProvider } from "@/components/providers/MantineProvider";
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/request'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { QueryProvider } from '@/lib/providers/QueryProvider'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  // Determine direction based on locale
  const direction = locale === 'he' ? 'rtl' : 'ltr'

  return (
    <SessionProvider>
      <QueryProvider>
        <div lang={locale} dir={direction}>
          <NextIntlClientProvider messages={messages}>
            <MantineProvider locale={locale}>
              {children}
            </MantineProvider>
          </NextIntlClientProvider>
        </div>
      </QueryProvider>
    </SessionProvider>
  );
}

