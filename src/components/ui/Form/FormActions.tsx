'use client'

import { Group, Button } from '@mantine/core'

interface FormActionsProps {
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  loading?: boolean
  disabled?: boolean
}

export const FormActions = ({
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  loading = false,
  disabled = false
}: FormActionsProps) => {
  return (
    <Group justify="flex-end" gap="sm" mt="xl">
      {onCancel && (
        <Button
          variant="subtle"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        loading={loading}
        disabled={disabled}
        color="brand"
      >
        {submitLabel}
      </Button>
    </Group>
  )
}
