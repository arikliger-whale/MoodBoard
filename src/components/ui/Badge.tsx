'use client'

import { Badge, BadgeProps } from '@mantine/core'
import { forwardRef } from 'react'

interface MoodBBadgeProps extends BadgeProps {
  status?: 'success' | 'warning' | 'error' | 'info' | 'default'
}

export const MoodBBadge = forwardRef<HTMLDivElement, MoodBBadgeProps>(
  ({ status, color, variant = 'light', ...props }, ref) => {
    let badgeColor = color

    if (status && !color) {
      switch (status) {
        case 'success':
          badgeColor = 'green'
          break
        case 'warning':
          badgeColor = 'yellow'
          break
        case 'error':
          badgeColor = 'red'
          break
        case 'info':
          badgeColor = 'blue'
          break
        case 'default':
          badgeColor = 'gray'
          break
      }
    }

    return (
      <Badge
        ref={ref}
        color={badgeColor}
        variant={variant}
        radius="md"
        {...props}
      />
    )
  }
)

MoodBBadge.displayName = 'MoodBBadge'
