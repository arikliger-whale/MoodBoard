'use client'

import { TextInput, TextInputProps } from '@mantine/core'
import { forwardRef } from 'react'

export const MoodBInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        radius="md"
        {...props}
      />
    )
  }
)

MoodBInput.displayName = 'MoodBInput'

