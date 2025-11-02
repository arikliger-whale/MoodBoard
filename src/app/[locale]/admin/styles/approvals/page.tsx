/**
 * Admin Style Approvals Page
 * Review and approve/reject public styles submitted by organizations
 */

'use client'

import { useState } from 'react'
import { Container, Title, Group, Stack, Select, Pagination, ActionIcon, Badge, Text, Modal, Button } from '@mantine/core'
import { MoodBTextarea } from '@/components/ui'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { IconCheck, IconX, IconDots, IconEye } from '@tabler/icons-react'
import { MoodBCard, MoodBTable, MoodBTableHead, MoodBTableBody, MoodBTableRow, MoodBTableHeader, MoodBTableCell, MoodBBadge, EmptyState, LoadingState, ErrorState } from '@/components/ui'
import { useStyleApprovals, useApproveStyle } from '@/hooks/useStyles'
import Link from 'next/link'

export default function AdminStyleApprovalsPage() {
  const t = useTranslations('admin.approvals')
  const tCommon = useTranslations('common')
  const params = useParams()
  const locale = params.locale as string

  // Filters
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)

  // Approval modal
  const [approveModalOpened, setApproveModalOpened] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)

  // Fetch pending approvals
  const { data, isLoading, error } = useStyleApprovals(status, page)

  // Approve/reject mutation
  const approveMutation = useApproveStyle()

  const handleOpenReject = (style: any) => {
    setSelectedStyle(style)
    setRejectionReason('')
    setApprovalAction('reject')
    setApproveModalOpened(true)
  }

  const handleApprove = async (approved: boolean) => {
    if (!selectedStyle) return

    setIsProcessing(true)
    try {
      await approveMutation.mutateAsync({
        id: selectedStyle.id,
        data: {
          approved,
          rejectionReason: approved ? undefined : rejectionReason,
        },
      })
      setApproveModalOpened(false)
      setSelectedStyle(null)
      setRejectionReason('')
      setApprovalAction(null)
    } catch (error) {
      console.error('Approve error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuickApprove = async (style: any) => {
    setIsProcessing(true)
    try {
      await approveMutation.mutateAsync({
        id: style.id,
        data: {
          approved: true,
        },
      })
    } catch (error) {
      console.error('Approve error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Status options
  const statusOptions = [
    { value: 'pending', label: t('status.pending') },
    { value: 'approved', label: t('status.approved') },
    { value: "rejected", label: t('status.rejected') },
  ]

  // Get approval status badge color
  const getApprovalStatusColor = (approvalStatus: string) => {
    const colors: Record<string, string> = {
      pending: 'yellow',
      approved: 'green',
      rejected: 'red',
    }
    return colors[approvalStatus] || 'gray'
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={1}>{t('title')}</Title>
          <Select
            data={statusOptions}
            value={status}
            onChange={(value) => {
              setStatus(value || 'pending')
              setPage(1)
            }}
            style={{ width: 200 }}
          />
        </Group>

        {/* Table */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={tCommon('error')} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            title={t('noApprovals')}
            description={t('noApprovalsDescription')}
          />
        ) : (
          <>
            <MoodBCard>
              <MoodBTable>
                <MoodBTableHead>
                  <MoodBTableRow>
                    <MoodBTableHeader>{t('table.styleName')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.organization')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.category')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.status')}</MoodBTableHeader>
                    <MoodBTableHeader>{t('table.submittedAt')}</MoodBTableHeader>
                    <MoodBTableHeader style={{ width: 150 }}>{t('table.actions')}</MoodBTableHeader>
                  </MoodBTableRow>
                </MoodBTableHead>
                <MoodBTableBody>
                  {data.data.map((style) => (
                    <MoodBTableRow key={style.id}>
                      <MoodBTableCell>
                        <Stack gap={4}>
                          <Text fw={500}>{style.name.he}</Text>
                          <Text size="xs" c="dimmed">
                            {style.name.en}
                          </Text>
                        </Stack>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">{style.organization?.name || '-'}</Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <MoodBBadge variant="light">{style.category}</MoodBBadge>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Badge
                          color={getApprovalStatusColor(style.metadata.approvalStatus || 'pending')}
                          variant="light"
                        >
                          {t(`status.${style.metadata.approvalStatus || 'pending'}`)}
                        </Badge>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Text size="sm">
                          {new Date(style.createdAt).toLocaleDateString(locale)}
                        </Text>
                      </MoodBTableCell>
                      <MoodBTableCell>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="brand"
                            component={Link}
                            href={`/${locale}/admin/styles/${style.id}`}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          {style.metadata.approvalStatus === 'pending' && (
                            <>
                              <ActionIcon
                                variant="subtle"
                                color="green"
                                onClick={() => handleQuickApprove(style)}
                                title={t('approve')}
                                disabled={isProcessing}
                              >
                                <IconCheck size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleOpenReject(style)}
                                title={t('reject')}
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </>
                          )}
                        </Group>
                      </MoodBTableCell>
                    </MoodBTableRow>
                  ))}
                </MoodBTableBody>
              </MoodBTable>
            </MoodBCard>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <Group justify="center">
                <Pagination
                  value={page}
                  onChange={setPage}
                  total={data.pagination.totalPages}
                />
              </Group>
            )}
          </>
        )}

        {/* Rejection Modal */}
        <Modal
          opened={approveModalOpened && approvalAction === 'reject'}
          onClose={() => {
            setApproveModalOpened(false)
            setSelectedStyle(null)
            setRejectionReason('')
            setApprovalAction(null)
          }}
          title={selectedStyle ? t('rejectStyle') : ''}
          size="md"
        >
          <Stack gap="md">
            {selectedStyle && (
              <>
                <Text size="sm" c="dimmed">
                  {t('rejectStyleMessage', { name: selectedStyle.name.he })}
                </Text>
                <MoodBTextarea
                  label={t('rejectionReason')}
                  placeholder={t('rejectionReasonPlaceholder')}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  minRows={3}
                  required
                />
                <Group justify="flex-end" mt="md">
                  <Button
                    variant="subtle"
                    onClick={() => {
                      setApproveModalOpened(false)
                      setSelectedStyle(null)
                      setRejectionReason('')
                      setApprovalAction(null)
                    }}
                  >
                    {tCommon('cancel')}
                  </Button>
                  <Button
                    color="red"
                    leftSection={<IconX size={16} />}
                    onClick={() => handleApprove(false)}
                    loading={isProcessing}
                    disabled={!rejectionReason.trim()}
                  >
                    {t('reject')}
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Modal>
      </Stack>
    </Container>
  )
}

