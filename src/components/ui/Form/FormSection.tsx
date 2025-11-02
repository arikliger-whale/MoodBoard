'use client'

import { Stack, Title, Divider } from '@mantine/core'
import { ReactNode } from 'react'

interface FormSectionProps {
  title?: string
  children: ReactNode
}

export const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <Stack gap="md">
      {title && (
        <>
          <Title order={4} size="h5">
            {title}
          </Title>
          <Divider />
        </>
      )}
      <Stack gap="md">{children}</Stack>
    </Stack>
  )
}
