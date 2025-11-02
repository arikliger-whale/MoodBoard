/**
 * Admin Material Create Page
 * Create new material with comprehensive form
 */

'use client'

import { FormSection, ImageUpload, MoodBCard } from '@/components/ui'
import { useAuth } from '@/hooks/use-auth/useAuth'
import { useColors } from '@/hooks/useColors'
import { useMaterialCategories, useMaterialTypes } from '@/hooks/useMaterialCategories'
import { useCreateMaterial } from '@/hooks/useMaterials'
import { createMaterialSchema, type CreateMaterial } from '@/lib/validations/material'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionIcon, Alert, Button, Container, Group, MultiSelect, NumberInput, Select, SimpleGrid, Stack, Switch, Text, TextInput, Title } from '@mantine/core'
import { IconAlertCircle, IconArrowLeft, IconPlus, IconX } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useUpdateMaterial } from '@/hooks/useMaterials'

export default function AdminMaterialNewPage() {
  const t = useTranslations('admin.materials.create')
  const tCommon = useTranslations('common')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const { organization } = useAuth()

  const createMutation = useCreateMaterial()
  const updateMutation = useUpdateMaterial()
  const { uploadImage } = useImageUpload()
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([])
  
  // Fetch colors for organization
  const { data: colorsData } = useColors({
    organizationId: organization?.id,
  })
  const colors = colorsData?.data || []
  
  // Fetch material categories
  const { data: categoriesData } = useMaterialCategories()
  const categories = categoriesData?.data || []

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateMaterial>({
    // @ts-expect-error - zodResolver type issue with nested schemas
    resolver: zodResolver(createMaterialSchema),
    defaultValues: {
      sku: '',
      name: {
        he: '',
        en: '',
      },
      categoryId: '',
      properties: {
        typeId: '',
        subType: '',
        finish: [],
        texture: '',
        colorIds: [],
        dimensions: {
          unit: 'mm',
        },
        technical: {
          durability: 5,
          maintenance: 5,
          sustainability: 5,
        },
      },
      pricing: {
        cost: 0,
        retail: 0,
        unit: 'sqm',
        currency: 'ILS',
        bulkDiscounts: [],
      },
      availability: {
        inStock: false,
        leadTime: 0,
        minOrder: 0,
      },
      assets: {
        thumbnail: '',
        images: [],
        texture: '',
        technicalSheet: '',
      },
    },
  })

  // Watch categoryId to filter types (must be after useForm)
  const categoryId = watch('categoryId')
  const { data: typesData } = useMaterialTypes('', categoryId)

  const { fields: finishFields, append: appendFinish, remove: removeFinish } = useFieldArray({
    control,
    name: 'properties.finish',
  })

  const { fields: discountFields, append: appendDiscount, remove: removeDiscount } = useFieldArray({
    control,
    name: 'pricing.bulkDiscounts',
  })

  const onSubmit = async (data: CreateMaterial) => {
    try {
      // Create material first
      const createdMaterial = await createMutation.mutateAsync(data)
      
      // Upload pending image files if any
      if (pendingImageFiles.length > 0) {
        const uploadedImages: string[] = []
        for (const file of pendingImageFiles) {
          try {
            const url = await uploadImage({
              file,
              entityType: 'material',
              entityId: createdMaterial.id,
            })
            uploadedImages.push(url)
          } catch (err) {
            console.error('Failed to upload image:', err)
          }
        }
        
        // Update material with uploaded images if any
        if (uploadedImages.length > 0) {
          const existingAssets = createdMaterial.assets || {}
          await updateMutation.mutateAsync({
            id: createdMaterial.id,
            data: {
              assets: {
                ...existingAssets,
                images: [...(existingAssets.images || []), ...uploadedImages],
              },
            },
          })
        }
      }
      
      router.push(`/${locale}/admin/materials`)
    } catch (error) {
      console.error('Error creating material:', error)
    }
  }

  // Prepare color options for MultiSelect
  const colorOptions = useMemo(() => {
    return colors.map((color) => ({
      value: color.id,
      label: `${color.name.he} (${color.name.en})`,
      hex: color.hex,
    }))
  }, [colors])

  // Prepare category options
  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: `${cat.name.he} (${cat.name.en})`,
    }))
  }, [categories])

  // Prepare type options filtered by category
  const typeOptions = useMemo(() => {
    const types = typesData?.data || []
    return types.map((type) => ({
      value: type.id,
      label: `${type.name.he} (${type.name.en})`,
    }))
  }, [typesData])

  const unitOptions = [
    { value: 'sqm', label: t('pricingUnits.sqm') },
    { value: 'unit', label: t('pricingUnits.unit') },
    { value: 'linear_m', label: t('pricingUnits.linearM') },
  ]

  const dimensionUnitOptions = [
    { value: 'mm', label: 'mm' },
    { value: 'cm', label: 'cm' },
    { value: 'm', label: 'm' },
  ]

  const currencyOptions = [
    { value: 'ILS', label: 'ILS (₪)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
  ]

  return (
    <Container size="xl" py="xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="lg">
          {/* Header */}
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={() => router.push(`/${locale}/admin/materials`)}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={1} c="brand">
              {t('title')}
            </Title>
          </Group>

          {/* Error Alert */}
          {createMutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={tCommon('error')}
              color="red"
            >
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : t('errorMessage')}
            </Alert>
          )}

          {/* Basic Information */}
          <MoodBCard>
            <FormSection title={t('basicInfo')}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  label={t('sku')}
                  placeholder={t('skuPlaceholder')}
                  {...register('sku')}
                  error={errors.sku?.message}
                  required
                />
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t('category')}
                      placeholder={t('categoryPlaceholder')}
                      data={categoryOptions}
                      {...field}
                      error={errors.categoryId?.message}
                      required
                      searchable
                    />
                  )}
                />
                <TextInput
                  label={t('nameHe')}
                  placeholder={t('nameHePlaceholder')}
                  {...register('name.he')}
                  error={errors.name?.he?.message}
                  required
                />
                <TextInput
                  label={t('nameEn')}
                  placeholder={t('nameEnPlaceholder')}
                  {...register('name.en')}
                  error={errors.name?.en?.message}
                  required
                />
              </SimpleGrid>
            </FormSection>
          </MoodBCard>

          {/* Properties */}
          <MoodBCard>
            <FormSection title={t('properties')}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Controller
                  name="properties.typeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t('type')}
                      placeholder={t('typePlaceholder')}
                      data={typeOptions}
                      {...field}
                      error={errors.properties?.typeId?.message}
                      required
                      disabled={!categoryId}
                      searchable
                    />
                  )}
                />
                <TextInput
                  label={t('subType')}
                  placeholder={t('subTypePlaceholder')}
                  {...register('properties.subType')}
                  error={errors.properties?.subType?.message}
                  required
                />
                <TextInput
                  label={t('texture')}
                  placeholder={t('texturePlaceholder')}
                  {...register('properties.texture')}
                  error={errors.properties?.texture?.message}
                  required
                />
              </SimpleGrid>

              {/* Colors - MultiSelect */}
              <div style={{ marginTop: '1rem' }}>
                <Controller
                  name="properties.colorIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      label={t('colors')}
                      placeholder={t('selectColors')}
                      data={colorOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.properties?.colorIds?.message}
                      required
                      searchable
                      renderOption={({ option }) => (
                        <Group gap="xs">
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              backgroundColor: option.hex,
                              border: '1px solid #ddd',
                              borderRadius: 2,
                            }}
                          />
                          <span>{option.label}</span>
                        </Group>
                      )}
                    />
                  )}
                />
              </div>

              {/* Finish */}
              <div style={{ marginTop: '1rem' }}>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>{t('finish')}</Text>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => appendFinish('')}
                  >
                    {t('addFinish')}
                  </Button>
                </Group>
                {finishFields.map((field, index) => (
                  <Group key={field.id} mb="xs">
                    <TextInput
                      placeholder={t('finishPlaceholder')}
                      {...register(`properties.finish.${index}`)}
                      style={{ flex: 1 }}
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeFinish(index)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ))}
              </div>

              {/* Dimensions */}
              <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md" mt="md">
                <NumberInput
                  label={t('width')}
                  placeholder={t('widthPlaceholder')}
                  {...register('properties.dimensions.width', { valueAsNumber: true })}
                  error={errors.properties?.dimensions?.width?.message}
                />
                <NumberInput
                  label={t('height')}
                  placeholder={t('heightPlaceholder')}
                  {...register('properties.dimensions.height', { valueAsNumber: true })}
                  error={errors.properties?.dimensions?.height?.message}
                />
                <NumberInput
                  label={t('thickness')}
                  placeholder={t('thicknessPlaceholder')}
                  {...register('properties.dimensions.thickness', { valueAsNumber: true })}
                  error={errors.properties?.dimensions?.thickness?.message}
                />
                <Controller
                  name="properties.dimensions.unit"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t('dimensionUnit')}
                      data={dimensionUnitOptions}
                      {...field}
                    />
                  )}
                />
              </SimpleGrid>

              {/* Technical Specs */}
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt="md">
                <NumberInput
                  label={t('durability')}
                  placeholder="1-10"
                  min={1}
                  max={10}
                  {...register('properties.technical.durability', { valueAsNumber: true })}
                  error={errors.properties?.technical?.durability?.message}
                  required
                />
                <NumberInput
                  label={t('maintenance')}
                  placeholder="1-10"
                  min={1}
                  max={10}
                  {...register('properties.technical.maintenance', { valueAsNumber: true })}
                  error={errors.properties?.technical?.maintenance?.message}
                  required
                />
                <NumberInput
                  label={t('sustainability')}
                  placeholder="1-10"
                  min={1}
                  max={10}
                  {...register('properties.technical.sustainability', { valueAsNumber: true })}
                  error={errors.properties?.technical?.sustainability?.message}
                  required
                />
              </SimpleGrid>
            </FormSection>
          </MoodBCard>

          {/* Pricing */}
          <MoodBCard>
            <FormSection title={t('pricing')}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <NumberInput
                  label={t('cost')}
                  placeholder={t('costPlaceholder')}
                  min={0}
                  {...register('pricing.cost', { valueAsNumber: true })}
                  error={errors.pricing?.cost?.message}
                  required
                />
                <NumberInput
                  label={t('retail')}
                  placeholder={t('retailPlaceholder')}
                  min={0}
                  {...register('pricing.retail', { valueAsNumber: true })}
                  error={errors.pricing?.retail?.message}
                  required
                />
                <Controller
                  name="pricing.unit"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t('pricingUnit')}
                      data={unitOptions}
                      {...field}
                      error={errors.pricing?.unit?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="pricing.currency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t('currency')}
                      data={currencyOptions}
                      {...field}
                      error={errors.pricing?.currency?.message}
                      required
                    />
                  )}
                />
              </SimpleGrid>

              {/* Bulk Discounts */}
              <div style={{ marginTop: '1rem' }}>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>{t('bulkDiscounts')}</Text>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => appendDiscount({ minQuantity: 1, discount: 0 })}
                  >
                    {t('addDiscount')}
                  </Button>
                </Group>
                {discountFields.map((field, index) => (
                  <Group key={field.id} mb="xs">
                    <NumberInput
                      label={t('minQuantity')}
                      placeholder={t('minQuantityPlaceholder')}
                      min={1}
                      {...register(`pricing.bulkDiscounts.${index}.minQuantity`, { valueAsNumber: true })}
                      style={{ flex: 1 }}
                    />
                    <NumberInput
                      label={t('discount')}
                      placeholder="%"
                      min={0}
                      max={100}
                      {...register(`pricing.bulkDiscounts.${index}.discount`, { valueAsNumber: true })}
                      style={{ flex: 1 }}
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeDiscount(index)}
                      style={{ marginTop: '1.5rem' }}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ))}
              </div>
            </FormSection>
          </MoodBCard>

          {/* Availability */}
          <MoodBCard>
            <FormSection title={t('availability')}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Controller
                  name="availability.inStock"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      label={t('inStock')}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.currentTarget.checked)}
                    />
                  )}
                />
                <NumberInput
                  label={t('leadTime')}
                  placeholder={t('leadTimePlaceholder')}
                  min={0}
                  {...register('availability.leadTime', { valueAsNumber: true })}
                  error={errors.availability?.leadTime?.message}
                  required
                />
                <NumberInput
                  label={t('minOrder')}
                  placeholder={t('minOrderPlaceholder')}
                  min={0}
                  {...register('availability.minOrder', { valueAsNumber: true })}
                  error={errors.availability?.minOrder?.message}
                  required
                />
              </SimpleGrid>
            </FormSection>
          </MoodBCard>

          {/* Image Gallery */}
          <MoodBCard>
            <FormSection title={t('imageGallery')}>
              <Controller
                name="assets.images"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    entityType="material"
                    entityId=""
                    value={field.value || []}
                    onChange={field.onChange}
                    onPendingFilesChange={setPendingImageFiles}
                    label={t('uploadImages')}
                    error={errors.assets?.images?.message}
                    maxImages={20}
                    multiple
                  />
                )}
              />
            </FormSection>
          </MoodBCard>

          {/* Submit */}
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => router.push(`/${locale}/admin/materials`)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              color="brand"
              loading={createMutation.isPending}
            >
              {t('submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  )
}

