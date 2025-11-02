'use client'

import { Checkbox, CheckboxProps } from '@mantine/core'
import { forwardRef } from 'react'

export const MoodBCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ ...props }, ref) => {
    return (
      <Checkbox
        ref={ref}
        color="brand"
        {...props}
      />
    )
  }
)

MoodBCheckbox.displayName = 'MoodBCheckbox'
