'use client'

import { Textarea, TextareaProps } from '@mantine/core'
import { forwardRef } from 'react'

export const MoodBTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        radius="md"
        minRows={3}
        {...props}
      />
    )
  }
)

MoodBTextarea.displayName = 'MoodBTextarea'
