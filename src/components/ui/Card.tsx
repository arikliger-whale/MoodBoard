'use client'

import { Card, CardProps } from '@mantine/core'
import { forwardRef } from 'react'

export const MoodBCard = forwardRef<HTMLDivElement, CardProps>(
  ({ children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        {...props}
      >
        {children}
      </Card>
    )
  }
)

MoodBCard.displayName = 'MoodBCard'

