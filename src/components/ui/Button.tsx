'use client'

import { Button, ButtonProps } from '@mantine/core'
import { forwardRef } from 'react'

interface MoodBButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle'
}

export const MoodBButton = forwardRef<HTMLButtonElement, MoodBButtonProps>(
  ({ variant = 'primary', color, ...props }, ref) => {
    const buttonProps: ButtonProps = {
      ...props,
      ref,
    }

    switch (variant) {
      case 'primary':
        buttonProps.color = 'brand'
        buttonProps.variant = 'filled'
        break
      case 'secondary':
        buttonProps.color = 'gray'
        buttonProps.variant = 'filled'
        break
      case 'outline':
        buttonProps.color = color || 'brand'
        buttonProps.variant = 'outline'
        break
      case 'subtle':
        buttonProps.color = color || 'gray'
        buttonProps.variant = 'subtle'
        break
    }

    return <Button {...buttonProps} />
  }
)

MoodBButton.displayName = 'MoodBButton'

