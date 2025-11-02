'use client'

import { signIn } from 'next-auth/react'
import { Container, Paper, Title, Text, Stack, Button, Loader, Center, Box } from '@mantine/core'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/layouts'
import { useTranslations } from 'next-intl'
import { IconBrandGoogle } from '@tabler/icons-react'

export default function SignUpPage() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const locale = pathname?.split('/')[1] || 'he'
  const t = useTranslations('auth')
  const [isSigningUp, setIsSigningUp] = useState(false)
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(`/${locale}/dashboard`)
    }
  }, [isAuthenticated, isLoading, router, locale])

  const handleSignUp = async () => {
    setIsSigningUp(true)
    try {
      await signIn('google', {
        callbackUrl: `/${locale}/onboarding`,
      })
    } catch (error) {
      console.error('Sign up error:', error)
      setIsSigningUp(false)
    }
  }

  if (isLoading) {
    return (
      <Center h="100vh" bg="#f7f7ed">
        <Loader size="lg" color="brand" />
      </Center>
    )
  }

  if (isAuthenticated) {
    return null
  }
  
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
            <Stack gap="md">
              <div>
                <Title order={2} ta="center" c="brand" mb="xs" fw={600} style={{ fontFamily: 'inherit' }}>
                  {t('signUp') || 'הירשם'}
                </Title>
                <Text c="dimmed" size="sm" ta="center" style={{ fontFamily: 'inherit' }}>
                  {t('createAccountMessage') || 'צור את החשבון שלך כדי להתחיל'}
                </Text>
              </div>

              <Button
                onClick={handleSignUp}
                leftSection={<IconBrandGoogle size={20} />}
                size="lg"
                fullWidth
                color="brand"
                variant="filled"
                loading={isSigningUp}
                style={{
                  backgroundColor: '#df2538',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: '#c51f2f',
                    },
                  },
                }}
              >
                {t('signUpWithGoogle') || 'הירשם באמצעות Google'}
              </Button>
            </Stack>
          </Paper>

          <Text size="sm" c="dimmed" ta="center">
            {t('alreadyHaveAccount') || 'יש לך כבר חשבון?'}{' '}
            <a 
              href={`/${locale}/sign-in`}
              style={{ 
                color: '#df2538', 
                textDecoration: 'none', 
                fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#c51f2f'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#df2538'}
            >
              {t('signIn') || 'התחבר'}
            </a>
          </Text>
        </Stack>
      </Container>
    </Box>
  )
}
