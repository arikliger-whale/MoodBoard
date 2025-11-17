/**
 * Shared StyleForm Component
 * Handles both create and edit modes for style forms
 */

'use client'

// FIX: Replaced barrel import with direct imports to improve compilation speed
// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)
// Direct imports only compile what's needed
import { FormSection } from '@/components/ui/Form/FormSection'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { MoodBCard } from '@/components/ui/Card'
import { useCategories, useSubCategories } from '@/hooks/useCategories'
import { useColors } from '@/hooks/useColors'
import { useApproaches } from '@/hooks/useApproaches'
import { useRoomTypes } from '@/hooks/useRoomTypes'
import { createStyleFormSchema, updateStyleSchema, type CreateStyle, type UpdateStyle } from '@/lib/validations/style'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionIcon, Alert, Badge, Button, Card, Group, MultiSelect, Paper, Select, SimpleGrid, Stack, Text, Textarea, TextInput, Title } from '@mantine/core'
import { IconAlertCircle, IconArrowLeft, IconPlus, IconTrash } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

interface StyleFormProps {
  mode: 'create' | 'edit'
  locale: string
  initialData?: any
  onSubmit: (data: CreateStyle | UpdateStyle) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  error?: Error | null
  title?: string
}

const objectIdRegex = /^[0-9a-fA-F]{24}$/

const sanitizeImages = (images: string[] | undefined) =>
  (images || []).filter((url) => {
    if (typeof url !== 'string') return false
    if (url.startsWith('blob:')) return false
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  })

const cleanMetadata = (metadata: any) =>
  metadata
    ? {
        ...metadata,
        approvalStatus: metadata.approvalStatus ?? undefined,
        approvedBy: metadata.approvedBy ?? undefined,
        approvedAt: metadata.approvedAt ? new Date(metadata.approvedAt) : undefined,
        rejectionReason: metadata.rejectionReason ?? undefined,
        rating: metadata.rating ?? undefined,
      }
    : undefined

export function StyleForm({
  mode,
  locale,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting: externalIsSubmitting,
  error: externalError,
  title,
}: StyleFormProps) {
  const t = useTranslations('admin.styles.create')
  const tCommon = useTranslations('common')

  const formRef = useRef<HTMLFormElement>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const { data: categoriesData } = useCategories()
  const categories = categoriesData?.data || []

  const { data: colorsData } = useColors({ page: 1, limit: 200 })
  const colors = colorsData?.data || []

  const { data: approachesData } = useApproaches()
  const approaches = approachesData?.data || []

  const { data: roomTypesData } = useRoomTypes()
  const roomTypes = roomTypesData?.data || []

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<CreateStyle | UpdateStyle>({
    // @ts-expect-error resolver types (create/update share shape)
    resolver: zodResolver(mode === 'create' ? createStyleFormSchema : updateStyleSchema),
    mode: 'onChange',
    defaultValues: {
      name: { he: '', en: '' },
      description: { he: '', en: '' },
      categoryId: '',
      subCategoryId: '',
      approachId: '',
      slug: '',
      colorId: '',
      images: [],
      roomProfiles: [],
      metadata: {},
    },
  })

  const isSubmitting = externalIsSubmitting ?? formIsSubmitting

  const categoryId = watch('categoryId')

  const { data: subCategoriesData } = useSubCategories(categoryId || undefined)
  const subCategories = subCategoriesData?.data || []

  useEffect(() => {
    if (mode === 'edit' && initialData?.id) {
      reset(
        {
          name: initialData.name || { he: '', en: '' },
          description: initialData.description || { he: '', en: '' },
          categoryId: initialData.categoryId || '',
          subCategoryId: initialData.subCategoryId || '',
          approachId: initialData.approachId || '',
          slug: initialData.slug || '',
          colorId: initialData.colorId || '',
          images: sanitizeImages(initialData.images),
          roomProfiles: initialData.roomProfiles || [],
          metadata: cleanMetadata(initialData.metadata),
        },
        { keepDefaultValues: false }
      )
    }
  }, [initialData, mode, reset])

  useEffect(() => {
    if (categoryId && initialData?.categoryId !== categoryId) {
      setValue('subCategoryId', '')
    }
  }, [categoryId, initialData?.categoryId, setValue])

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        value: cat.id,
        label: locale === 'he' ? cat.name.he : cat.name.en,
      })),
    [categories, locale]
  )

  const subCategoryOptions = useMemo(
    () =>
      subCategories.map((subCat) => ({
        value: subCat.id,
        label: locale === 'he' ? subCat.name.he : subCat.name.en,
      })),
    [subCategories, locale]
  )

  const colorOptions = useMemo(
    () =>
      colors.map((color) => ({
        value: color.id,
        label: `${locale === 'he' ? color.name.he : color.name.en} (${color.hex})`,
        hex: color.hex,
      })),
    [colors, locale]
  )

  const approachOptions = useMemo(
    () =>
      approaches.map((approach) => ({
        value: approach.id,
        label: locale === 'he' ? approach.name.he : approach.name.en,
      })),
    [approaches, locale]
  )

  const roomTypeOptions = useMemo(
    () =>
      roomTypes.map((roomType) => ({
        value: roomType.id,
        label: locale === 'he' ? roomType.name.he : roomType.name.en,
      })),
    [roomTypes, locale]
  )

  const roomProfiles = watch('roomProfiles') || []

  const addRoomProfile = () => {
    const currentProfiles = watch('roomProfiles') || []
    setValue('roomProfiles', [
      ...currentProfiles,
      {
        roomTypeId: '',
        description: { he: '', en: '' },
        colors: [], // Array of color IDs
        textures: [],
        materials: [],
        products: [],
        images: [],
        constraints: null,
      },
    ])
  }

  const removeRoomProfile = (index: number) => {
    const currentProfiles = watch('roomProfiles') || []
    setValue(
      'roomProfiles',
      currentProfiles.filter((_, i) => i !== index)
    )
  }

  useEffect(() => {
    const messages: string[] = []
    if (errors.name?.he?.message) messages.push(errors.name.he.message)
    if (errors.name?.en?.message) messages.push(errors.name.en.message)
    if (errors.description?.he?.message) messages.push(errors.description.he.message)
    if (errors.description?.en?.message) messages.push(errors.description.en.message)
    if (errors.categoryId?.message) messages.push(errors.categoryId.message)
    if (errors.subCategoryId?.message) messages.push(errors.subCategoryId.message)
    if (errors.approachId?.message) messages.push(errors.approachId.message)
    if (errors.slug?.message) messages.push(errors.slug.message)
    if (errors.colorId?.message) messages.push(errors.colorId.message)
    if (errors.images?.message) messages.push(errors.images.message)

    setValidationErrors(messages)
  }, [errors])

  const handleFormSubmit = async (data: CreateStyle | UpdateStyle) => {
    const cleanedData: CreateStyle | UpdateStyle = {
      ...data,
      images: mode === 'edit' ? data.images : sanitizeImages(data.images),
      metadata: cleanMetadata(data.metadata),
    }

    await onSubmit(cleanedData)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack gap="lg">
        <Group gap="md" align="center">
          <ActionIcon variant="subtle" onClick={onCancel}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={1} c="brand" style={{ flex: 1 }}>
            {title || (mode === 'create' ? t('title') : `${t('title')} - ${initialData?.name?.he || ''}`)}
          </Title>
          <Button type="submit" color="brand" variant="filled" loading={isSubmitting} disabled={isSubmitting}>
            {tCommon('save')}
          </Button>
        </Group>

        {validationErrors.length > 0 && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={tCommon('error')}
            color="red"
            onClose={() => setValidationErrors([])}
            withCloseButton
          >
            <Stack gap={4}>
              {validationErrors.map((err, index) => (
                <Text size="sm" key={index}>
                  • {err}
                </Text>
              ))}
            </Stack>
          </Alert>
        )}

        {externalError && (
          <Alert icon={<IconAlertCircle size={16} />} title={tCommon('error')} color="red">
            {externalError instanceof Error
              ? externalError.message
              : locale === 'he'
                ? 'שגיאה בשמירת הסגנון'
                : 'Failed to save style'}
          </Alert>
        )}

        <MoodBCard>
          <Stack gap="md">
            <FormSection title={t('basicInfo')}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  label={t('nameHe')}
                  placeholder={t('nameHe')}
                  {...register('name.he')}
                  error={errors.name?.he?.message}
                  required
                />
                <TextInput
                  label={t('nameEn')}
                  placeholder={t('nameEn')}
                  {...register('name.en')}
                  error={errors.name?.en?.message}
                  required
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Textarea
                  label={t('descriptionHe')}
                  placeholder={t('descriptionPlaceholder')}
                  {...register('description.he')}
                  error={errors.description?.he?.message}
                  minRows={3}
                />
                <Textarea
                  label={t('descriptionEn')}
                  placeholder={t('descriptionPlaceholder')}
                  {...register('description.en')}
                  error={errors.description?.en?.message}
                  minRows={3}
                />
              </SimpleGrid>

              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={t('category')}
                    placeholder={t('categoryPlaceholder')}
                    data={categoryOptions}
                    error={errors.categoryId?.message}
                    required
                    searchable
                  />
                )}
              />

              <Controller
                name="subCategoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={t('subCategory')}
                    placeholder={t('subCategoryPlaceholder')}
                    data={subCategoryOptions}
                    error={errors.subCategoryId?.message}
                    required
                    disabled={!categoryId}
                    searchable
                  />
                )}
              />

              <Controller
                name="approachId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={t('approach')}
                    placeholder={t('approachPlaceholder')}
                    data={approachOptions}
                    error={errors.approachId?.message}
                    required
                    searchable
                  />
                )}
              />

              <TextInput
                label={t('slug')}
                placeholder={t('slugPlaceholder')}
                {...register('slug')}
                error={errors.slug?.message}
                description={t('slugInvalid')}
              />
            </FormSection>
          </Stack>
        </MoodBCard>

        <MoodBCard>
          <Stack gap="md">
            <FormSection title={t('selectColor')}>
              <Controller
                name="colorId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={t('color')}
                    placeholder={t('colorPlaceholder')}
                    data={colorOptions.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    error={errors.colorId?.message}
                    required
                    searchable
                  />
                )}
              />
            </FormSection>
          </Stack>
        </MoodBCard>

        <MoodBCard>
          <Stack gap="md">
            <FormSection title={t('images')}>
              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value || []}
                    onChange={(newImages) => field.onChange(newImages)}
                    entityType="style"
                    entityId={mode === 'edit' ? initialData?.id : ''}
                    maxImages={20}
                    multiple
                    error={errors.images?.message}
                  />
                )}
              />
            </FormSection>
          </Stack>
        </MoodBCard>

        <MoodBCard>
          <Stack gap="md">
            <FormSection title={t('roomProfiles')}>
              <Text size="sm" c="dimmed" mb="md">
                {t('roomProfilesDescription')}
              </Text>

              {roomProfiles.length === 0 ? (
                <Paper p="xl" radius="md" withBorder style={{ borderStyle: 'dashed' }}>
                  <Stack align="center" gap="sm">
                    <Text size="sm" c="dimmed">
                      {t('noRoomProfiles')}
                    </Text>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      variant="light"
                      color="brand"
                      onClick={addRoomProfile}
                    >
                      {t('addRoomProfile')}
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <Stack gap="md">
                  {roomProfiles.map((_, index) => (
                    <Card key={index} withBorder padding="md" radius="md">
                      <Stack gap="md">
                        <Group justify="space-between" align="center">
                          <Badge color="brand" variant="light">
                            {locale === 'he' ? `חדר ${index + 1}` : `Room ${index + 1}`}
                          </Badge>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => removeRoomProfile(index)}
                            aria-label={locale === 'he' ? 'מחק חדר' : 'Remove room'}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>

                        <Controller
                          name={`roomProfiles.${index}.roomTypeId` as any}
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              label={t('roomType')}
                              placeholder={t('roomType')}
                              data={roomTypeOptions}
                              searchable
                              required
                            />
                          )}
                        />

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                          <Textarea
                            label={t('descriptionHe')}
                            placeholder={t('descriptionPlaceholder')}
                            {...register(`roomProfiles.${index}.description.he` as any)}
                            minRows={2}
                          />
                          <Textarea
                            label={t('descriptionEn')}
                            placeholder={t('descriptionPlaceholder')}
                            {...register(`roomProfiles.${index}.description.en` as any)}
                            minRows={2}
                          />
                        </SimpleGrid>

                        <Controller
                          name={`roomProfiles.${index}.colors` as any}
                          control={control}
                          render={({ field }) => (
                            <MultiSelect
                              {...field}
                              label={locale === 'he' ? 'צבעים לחדר' : 'Room Colors'}
                              placeholder={locale === 'he' ? 'בחר צבעים' : 'Select colors'}
                              data={colorOptions.map((option) => ({
                                value: option.value,
                                label: option.label,
                              }))}
                              searchable
                              clearable
                              value={field.value || []}
                              onChange={(values) => field.onChange(values)}
                            />
                          )}
                        />

                        <Controller
                          name={`roomProfiles.${index}.images` as any}
                          control={control}
                          render={({ field }) => (
                            <ImageUpload
                              value={field.value || []}
                              onChange={(newImages) => field.onChange(newImages)}
                              entityType="room-profile"
                              entityId={mode === 'edit' && initialData?.id ? `${initialData.id}-room-${index}` : ''}
                              maxImages={10}
                              multiple
                            />
                          )}
                        />

                        <Text size="xs" c="dimmed">
                          {locale === 'he'
                            ? 'ניתן להוסיף חומרים, צבעים ומוצרים ספציפיים לחדר זה לאחר יצירת הסגנון'
                            : 'You can add specific materials, colors and products for this room after creating the style'}
                        </Text>
                      </Stack>
                    </Card>
                  ))}

                  <Button
                    leftSection={<IconPlus size={16} />}
                    variant="light"
                    color="brand"
                    onClick={addRoomProfile}
                  >
                    {t('addRoomProfile')}
                  </Button>
                </Stack>
              )}
            </FormSection>
          </Stack>
        </MoodBCard>
      </Stack>
    </form>
  )
}