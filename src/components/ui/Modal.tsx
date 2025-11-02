'use client'

import { Modal, ModalProps } from '@mantine/core'
import { ReactNode } from 'react'

interface MoodBModalProps extends Omit<ModalProps, 'children'> {
  children: ReactNode
}

export const MoodBModal = ({ children, ...props }: MoodBModalProps) => {
  return (
    <Modal
      radius="md"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      {...props}
    >
      {children}
    </Modal>
  )
}
