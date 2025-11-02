/**
 * Material Item/Detail Component
 * Reusable component for displaying detailed material information
 */

'use client'

import { ConfirmDialog, ErrorState, ImageUpload, LoadingState, MoodBBadge, MoodBCard } from '@/components/ui'
import { useAuth } from '@/hooks/use-auth/useAuth'
import { useColors } from '@/hooks/useColors'
import { useDeleteMaterial, useMaterial, type Material } from '@/hooks/useMaterials'
import { Badge, Button, Divider, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

interface MaterialItemProps {
  materialId: string
  showActions?: boolean
  onEdit?: (material: Material) => void
  onDelete?: (materialId: string) => void
}

export function MaterialItem({ materialId, showActions = true, onEdit, onDelete }: MaterialItemProps) {
  const t = useTranslations('admin.materials')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const { organization } = useAuth()

  const { data: material, isLoading, error } = useMaterial(materialId)
  const deleteMutation = useDeleteMaterial()
  const [deleteOpened, setDeleteOpened] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch colors for the material's colorIds
  const colorIds = material?.properties.colorIds || []
  const { data: colorsData } = useColors({})
  const allColors = colorsData?.data || []
  const materialColors = useMemo(() => {
    return allColors.filter((color) => colorIds.includes(color.id))
  }, [allColors, colorIds])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(materialId)
      setDeleteOpened(false)
      if (onDelete) {
        onDelete(materialId)
      } else {
        router.push(`/${locale}/admin/materials`)
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !material) {
    return <ErrorState message={tCommon('error')} />
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      {showActions && (
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push(`/${locale}/admin/materials`)}
          >
            {tCommon('back')}
          </Button>
          <Group ml="auto">
            <Button
              variant="light"
              leftSection={<IconEdit size={16} />}
              onClick={() => {
                if (onEdit) {
                  onEdit(material)
                } else {
                  router.push(`/${locale}/admin/materials/${material.id}/edit`)
                }
              }}
            >
              {tCommon('edit')}
            </Button>
            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => setDeleteOpened(true)}
            >
              {tCommon('delete')}
            </Button>
          </Group>
        </Group>
      )}

      {/* Basic Information */}
      <MoodBCard>
        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Text size="xl" fw={700} c="brand">
                {material.name.he}
              </Text>
              <Text size="sm" c="dimmed">
                {material.name.en}
              </Text>
            </div>
            <MoodBBadge color={material.availability.inStock ? 'green' : 'red'} size="lg">
              {material.availability.inStock ? t('inStock') : t('outOfStock')}
            </MoodBBadge>
          </Group>

          <Divider />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {t('detail.sku')}
              </Text>
              <Text fw={500} ff="monospace">
                {material.sku}
              </Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {t('detail.category')}
              </Text>
              <Text fw={500}>{material.categoryId}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {t('detail.type')}
              </Text>
              <MoodBBadge>{material.properties.typeId}</MoodBBadge>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {t('detail.subType')}
              </Text>
              <Text fw={500}>{material.properties.subType}</Text>
            </div>
          </SimpleGrid>
        </Stack>
      </MoodBCard>

      {/* Properties */}
      <MoodBCard>
        <Text size="lg" fw={600} mb="md">
          {t('detail.properties')}
        </Text>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {t('detail.colors')}
              </Text>
              <Group gap="xs">
                {materialColors.length > 0 ? (
                  materialColors.map((color) => (
                    <Group key={color.id} gap="xs">
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: color.hex,
                          border: '1px solid #ddd',
                          borderRadius: 4,
                        }}
                      />
                      <Text fw={500} size="sm">
                        {color.name.he}
                      </Text>
                      {color.pantone && (
                        <Text size="xs" c="dimmed">
                          ({color.pantone})
                        </Text>
                      )}
                    </Group>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">
                    {t('detail.noColors')}
                  </Text>
                )}
              </Group>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {t('detail.texture')}
              </Text>
              <Text fw={500}>{material.properties.texture}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {t('detail.finish')}
              </Text>
              <Group gap="xs">
                {material.properties.finish.length > 0 ? (
                  material.properties.finish.map((finish, idx) => (
                    <Badge key={idx} variant="light">
                      {finish}
                    </Badge>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">
                    {t('detail.noFinish')}
                  </Text>
                )}
              </Group>
            </div>
          </SimpleGrid>

          {/* Technical Specs */}
          <Divider />
          <Text size="md" fw={600} mb="sm">
            {t('detail.technicalSpecs')}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {t('detail.durability')}
              </Text>
              <Text fw={500}>{material.properties.technical.durability}/10</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {t('detail.maintenance')}
              </Text>
              <Text fw={500}>{material.properties.technical.maintenance}/10</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {t('detail.sustainability')}
              </Text>
              <Text fw={500}>{material.properties.technical.sustainability}/10</Text>
            </div>
          </SimpleGrid>
        </Stack>
      </MoodBCard>

      {/* Pricing */}
      <MoodBCard>
        <Text size="lg" fw={600} mb="md">
          {t('detail.pricing')}
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <div>
            <Text size="sm" c="dimmed" mb={4}>
              {t('detail.cost')}
            </Text>
            <Text size="xl" fw={700}>
              {material.pricing.cost} {material.pricing.currency}
            </Text>
            <Text size="sm" c="dimmed">
              / {material.pricing.unit}
            </Text>
          </div>
          <div>
            <Text size="sm" c="dimmed" mb={4}>
              {t('detail.retail')}
            </Text>
            <Text size="xl" fw={700}>
              {material.pricing.retail} {material.pricing.currency}
            </Text>
            <Text size="sm" c="dimmed">
              / {material.pricing.unit}
            </Text>
          </div>
        </SimpleGrid>
      </MoodBCard>

      {/* Availability */}
      <MoodBCard>
        <Text size="lg" fw={600} mb="md">
          {t('detail.availability')}
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <div>
            <Text size="sm" c="dimmed" mb={4}>
              {t('detail.leadTime')}
            </Text>
            <Text fw={500}>{material.availability.leadTime} {t('detail.days')}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed" mb={4}>
              {t('detail.minOrder')}
            </Text>
            <Text fw={500}>{material.availability.minOrder} {material.pricing.unit}</Text>
          </div>
        </SimpleGrid>
      </MoodBCard>

      {/* Image Gallery */}
      <MoodBCard>
        <Text size="lg" fw={600} mb="md">
          {t('detail.imageGallery')}
        </Text>
        <ImageUpload
          entityType="material"
          entityId={material.id}
          value={material.assets.images || []}
          onChange={(images) => {
            // This will be handled by the parent component or API update
            // For now, just display the images
          }}
          maxImages={20}
          multiple
          disabled={!showActions}
        />
      </MoodBCard>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        opened={deleteOpened}
        onClose={() => setDeleteOpened(false)}
        onConfirm={handleDelete}
        title={t('deleteMaterial')}
        message={t('deleteMaterialMessage')}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        loading={isDeleting}
      />
    </Stack>
  )
}

