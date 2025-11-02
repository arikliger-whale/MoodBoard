'use client'

import { Stack, Text } from '@mantine/core'
import { ReactNode } from 'react'
import { FieldError } from 'react-hook-form'

interface FormFieldProps {
  label?: string
  error?: FieldError
  required?: boolean
  description?: string
  children: ReactNode
}

export const FormField = ({
  label,
  error,
  required,
  description,
  children
}: FormFieldProps) => {
  return (
    <Stack gap="xs">
      {label && (
        <Text size="sm" fw={500}>
          {label}
          {required && <Text component="span" c="red"> *</Text>}
        </Text>
      )}
      {description && (
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      )}
      {children}
      {error && (
        <Text size="xs" c="red">
          {error.message}
        </Text>
      )}
    </Stack>
  )
}
