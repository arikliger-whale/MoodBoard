'use client'

import { Select, SelectProps } from '@mantine/core'
import { forwardRef } from 'react'

export const MoodBSelect = forwardRef<HTMLInputElement, SelectProps>(
  ({ ...props }, ref) => {
    return (
      <Select
        ref={ref}
        radius="md"
        {...props}
      />
    )
  }
)

MoodBSelect.displayName = 'MoodBSelect'
