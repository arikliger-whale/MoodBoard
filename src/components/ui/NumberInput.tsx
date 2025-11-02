'use client'

import { NumberInput, NumberInputProps } from '@mantine/core'
import { forwardRef } from 'react'

export const MoodBNumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ ...props }, ref) => {
    return (
      <NumberInput
        ref={ref}
        radius="md"
        {...props}
      />
    )
  }
)

MoodBNumberInput.displayName = 'MoodBNumberInput'
