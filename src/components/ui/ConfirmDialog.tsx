'use client'

import { Modal, Stack, Text, Group, Button } from '@mantine/core'
import { ReactNode } from 'react'

interface ConfirmDialogProps {
  opened: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
}

export const ConfirmDialog = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false
}: ConfirmDialogProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      radius="md"
    >
      <Stack gap="lg">
        <Text size="sm">{message}</Text>
        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            color={danger ? 'red' : 'brand'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
