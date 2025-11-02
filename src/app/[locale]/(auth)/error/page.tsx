'use client'

import { Container, Paper, Title, Text, Stack, Button, Box } from '@mantine/core'
import { useSearchParams, usePathname } from 'next/navigation'
import { Logo } from '@/components/layouts'
import { useTranslations } from 'next-intl'
import { IconAlertCircle } from '@tabler/icons-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const t = useTranslations('auth')
  const locale = pathname?.split('/')[1] || 'he'

  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'Access denied. You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    OAuthSignin: 'Error in constructing an authorization URL.',
    OAuthCallback: 'Error in handling the response from the OAuth provider.',
    OAuthCreateAccount: 'Could not create OAuth provider user in the database.',
    EmailCreateAccount: 'Could not create email provider user in the database.',
    Callback: 'Error in the OAuth callback handler route.',
    OAuthAccountNotLinked: 'Email already exists with a different provider.',
    EmailSignin: 'Check your email address.',
    CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'Unable to sign in.',
  }

  const errorMessage = error ? (errorMessages[error] || errorMessages.Default) : errorMessages.Default

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f7ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <Container size="sm" w="100%" style={{ maxWidth: '450px' }}>
        <Stack gap="xl" align="center">
          <Logo />

          <Paper
            shadow="xl"
            p="xl"
            radius="md"
            withBorder
            style={{
              width: '100%',
              backgroundColor: '#ffffff'
            }}
          >
            <Stack gap="md" align="center">
              <IconAlertCircle size={48} color="#df2538" />

              <div style={{ textAlign: 'center' }}>
                <Title order={2} c="brand" mb="xs" fw={600} style={{ fontFamily: 'inherit' }}>
                  {t('error') || 'שגיאה באימות'}
                </Title>
                <Text c="dimmed" size="sm" style={{ fontFamily: 'inherit' }}>
                  {errorMessage}
                </Text>
                {error && (
                  <Text c="dimmed" size="xs" mt="xs" style={{ fontFamily: 'inherit' }}>
                    Error code: {error}
                  </Text>
                )}
              </div>

              <Button
                component={Link}
                href={`/${locale}/sign-in`}
                size="lg"
                fullWidth
                color="brand"
                variant="filled"
                styles={{
                  root: {
                    backgroundColor: '#df2538',
                    '&:hover': {
                      backgroundColor: '#c51f2f',
                    },
                  },
                }}
              >
                {t('tryAgain') || 'נסה שוב'}
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}
