/**
 * Admin Style Edit Page
 * Edit global style with full form and image upload support
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Container, Title, Stack, Group, ActionIcon, Text, Button, Alert, Tabs, ScrollArea, Paper, Badge } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowLeft, IconAlertCircle, IconPlus, IconX, IconPalette, IconBox, IconHome } from '@tabler/icons-react'
import { MoodBButton, MoodBCard, FormSection, ImageUpload, LoadingState, ErrorState } from '@/components/ui'
import { updateStyleSchema, type UpdateStyle } from '@/lib/validations/style'
import { useUpdateAdminStyle, useAdminStyle } from '@/hooks/useStyles'
import { useCategories, useSubCategories } from '@/hooks/useCategories'
import { useColors } from '@/hooks/useColors'
import { ROOM_TYPES } from '@/lib/validations/room'
import {
  TextInput,
  Select,
  SimpleGrid,
} from '@mantine/core'

export default function AdminStyleEditPage() {
  const t = useTranslations('admin.styles.create')
  const tCommon = useTranslations('common')
  const tRoomTypes = useTranslations('projects.form.roomTypes')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const styleId = params.id as string

  const { data: style, isLoading, error } = useAdminStyle(styleId)
  const updateMutation = useUpdateAdminStyle()
  const [activeTab, setActiveTab] = useState<string | null>('basic')

  // Fetch categories and sub-categories
  const { data: categoriesData } = useCategories()
  const categories = categoriesData?.data || []
  
  // Fetch colors
  const { data: colorsData } = useColors({ limit: 100 })
  const colors = colorsData?.data || []

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<UpdateStyle>({
    // @ts-expect-error - zodResolver type issue with nested schemas
    resolver: zodResolver(updateStyleSchema),
    defaultValues: {
      name: {
        he: '',
        en: '',
      },
      categoryId: '',
      subCategoryId: '',
      slug: '',
      colorId: '',
      materialSet: {
        defaults: [],
        alternatives: [],
      },
      images: [],
      roomProfiles: [],
      metadata: {
        tags: [],
      },
    },
  })

  // Load style data into form
  useEffect(() => {
    if (style) {
      reset({
        name: style.name,
        categoryId: style.categoryId,
        subCategoryId: style.subCategoryId,
        slug: style.slug,
        colorId: style.colorId,
        images: style.images || [],
        materialSet: style.materialSet || {
          defaults: [],
          alternatives: [],
        },
        roomProfiles: style.roomProfiles || [],
        metadata: style.metadata || {
          tags: [],
        },
      })
    }
  }, [style, reset])

  const categoryId = watch('categoryId')
  const subCategoryId = watch('subCategoryId')
  const roomProfiles = watch('roomProfiles')
  const images = watch('images')

  // Fetch sub-categories when category is selected
  const { data: subCategoriesData } = useSubCategories(categoryId || undefined)
  const subCategories = subCategoriesData?.data || []

  // Category options
  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: locale === 'he' ? cat.name.he : cat.name.en,
    }))
  }, [categories, locale])

  // Sub-category options
  const subCategoryOptions = useMemo(() => {
    return subCategories.map((subCat) => ({
      value: subCat.id,
      label: locale === 'he' ? subCat.name.he : subCat.name.en,
    }))
  }, [subCategories, locale])

  // Color options
  const colorOptions = useMemo(() => {
    return colors.map((color) => ({
      value: color.id,
      label: `${locale === 'he' ? color.name.he : color.name.en} (${color.hex})`,
      color: color.hex,
    }))
  }, [colors, locale])

  // Room type options
  const roomTypeOptions = useMemo(() => {
    return ROOM_TYPES.map((type) => ({
      value: type,
      label: tRoomTypes(type),
    }))
  }, [tRoomTypes])

  // Reset sub-category when category changes
  useEffect(() => {
    if (categoryId && style?.categoryId !== categoryId) {
      setValue('subCategoryId', '')
    }
  }, [categoryId, setValue, style?.categoryId])

  const {
    fields: defaultMaterialFields,
    append: appendDefaultMaterial,
    remove: removeDefaultMaterial,
  } = useFieldArray({
    control,
    name: 'materialSet.defaults',
  })

  const {
    fields: roomProfileFields,
    append: appendRoomProfile,
    remove: removeRoomProfile,
  } = useFieldArray({
    control,
    name: 'roomProfiles',
  })

  // Get available room types (not already added)
  const availableRoomTypes = useMemo(() => {
    const usedTypes = new Set(roomProfiles?.map((rp) => rp.roomType) || [])
    return roomTypeOptions.filter((opt) => !usedTypes.has(opt.value))
  }, [roomTypeOptions, roomProfiles])

  const onSubmit = async (data: UpdateStyle) => {
    try {
      await updateMutation.mutateAsync({ id: styleId, data })
      router.push(`/${locale}/admin/styles/${styleId}`)
    } catch (error) {
      console.error('Error updating style:', error)
    }
  }

  const handleAddRoomProfile = () => {
    if (availableRoomTypes.length > 0) {
      appendRoomProfile({
        roomType: availableRoomTypes[0].value,
        materials: [],
        images: [],
      })
    }
  }

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <LoadingState />
      </Container>
    )
  }

  if (error || !style) {
    return (
      <Container size="xl" py="xl">
        <ErrorState message={tCommon('error')} />
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="lg">
          {/* Header */}
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={() => router.push(`/${locale}/admin/styles/${styleId}`)}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={1} c="brand">
              {t('title')} - {style.name.he}
            </Title>
          </Group>

          {/* Error Alert */}
          {updateMutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={tCommon('error')}
              color="red"
            >
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : 'Failed to update style'}
            </Alert>
          )}

          {/* Form Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="basic" leftSection={<IconPalette size={16} />}>
                {t('basicInfo')}
              </Tabs.Tab>
              <Tabs.Tab value="color" leftSection={<IconPalette size={16} />}>
                {t('color')}
              </Tabs.Tab>
              <Tabs.Tab value="materials" leftSection={<IconBox size={16} />}>
                {t('materials')}
              </Tabs.Tab>
              <Tabs.Tab value="rooms" leftSection={<IconHome size={16} />}>
                {t('rooms')}
              </Tabs.Tab>
            </Tabs.List>

            {/* Basic Info Tab */}
            <Tabs.Panel value="basic" pt="lg">
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

                    <Controller
                      name="subCategoryId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label={t('subCategory')}
                          placeholder={t('subCategoryPlaceholder')}
                          data={subCategoryOptions}
                          {...field}
                          error={errors.subCategoryId?.message}
                          required
                          disabled={!categoryId}
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

                    {/* Style Images */}
                    <Paper p="md" withBorder>
                      <Text fw={500} size="sm" mb="xs">
                        {t('images') || 'Images'}
                      </Text>
                      <Controller
                        name="images"
                        control={control}
                        render={({ field }) => (
                          <ImageUpload
                            value={field.value || []}
                            onChange={(newImages) => {
                              field.onChange(newImages)
                              setValue('images', newImages, { shouldDirty: true })
                            }}
                            entityType="style"
                            entityId={styleId}
                            maxImages={20}
                            multiple
                            error={errors.images?.message}
                          />
                        )}
                      />
                    </Paper>
                  </FormSection>
                </Stack>
              </MoodBCard>
            </Tabs.Panel>

            {/* Color Tab */}
            <Tabs.Panel value="color" pt="lg">
              <MoodBCard>
                <Stack gap="md">
                  <FormSection title={t('selectColor')}>
                    <Controller
                      name="colorId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label={t('color')}
                          placeholder={t('colorPlaceholder')}
                          data={colorOptions}
                          {...field}
                          error={errors.colorId?.message}
                          required
                          searchable
                          renderOption={({ option }) => (
                            <Group gap="xs">
                              <div
                                style={{
                                  width: 20,
                                  height: 20,
                                  backgroundColor: option.color,
                                  borderRadius: 4,
                                  border: '1px solid #ddd',
                                }}
                              />
                              <Text>{option.label}</Text>
                            </Group>
                          )}
                        />
                      )}
                    />
                    {watch('colorId') && (
                      <Paper p="sm" withBorder>
                        <Group gap="xs">
                          <Text size="sm" fw={500}>{t('selectedColor')}:</Text>
                          {(() => {
                            const selectedColor = colors.find((c) => c.id === watch('colorId'))
                            return selectedColor ? (
                              <Group gap="xs">
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    backgroundColor: selectedColor.hex,
                                    borderRadius: 4,
                                    border: '1px solid #ddd',
                                  }}
                                />
                                <Text size="sm">
                                  {locale === 'he' ? selectedColor.name.he : selectedColor.name.en}
                                </Text>
                                <Badge size="sm" variant="light">{selectedColor.hex}</Badge>
                              </Group>
                            ) : null
                          })()}
                        </Group>
                      </Paper>
                    )}
                  </FormSection>
                </Stack>
              </MoodBCard>
            </Tabs.Panel>

            {/* Materials Tab */}
            <Tabs.Panel value="materials" pt="lg">
              <ScrollArea h={600}>
                <Stack gap="md">
                  {/* General Materials */}
                  <MoodBCard>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={500}>{t('generalMaterials')}</Text>
                        <Text size="sm" c="dimmed">{t('generalMaterialsDescription')}</Text>
                      </div>
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size={14} />}
                        onClick={() => appendDefaultMaterial({ materialId: '', usageArea: '' })}
                      >
                        {t('addDefaultMaterial')}
                      </Button>
                    </Group>
                    <Stack gap="sm">
                      {defaultMaterialFields.length === 0 ? (
                        <Text size="sm" c="dimmed" ta="center" py="md">
                          {t('noGeneralMaterials')}
                        </Text>
                      ) : (
                        defaultMaterialFields.map((field, index) => (
                          <Group key={field.id} align="flex-start">
                            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" style={{ flex: 1 }}>
                              <TextInput
                                placeholder={t('materialId')}
                                {...register(`materialSet.defaults.${index}.materialId`)}
                                error={errors.materialSet?.defaults?.[index]?.materialId?.message}
                              />
                              <TextInput
                                placeholder={t('usageArea')}
                                {...register(`materialSet.defaults.${index}.usageArea`)}
                                error={errors.materialSet?.defaults?.[index]?.usageArea?.message}
                              />
                              <TextInput
                                placeholder={t('finish')}
                                {...register(`materialSet.defaults.${index}.defaultFinish`)}
                              />
                            </SimpleGrid>
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => removeDefaultMaterial(index)}
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          </Group>
                        ))
                      )}
                    </Stack>
                  </MoodBCard>
                </Stack>
              </ScrollArea>
            </Tabs.Panel>

            {/* Rooms Tab */}
            <Tabs.Panel value="rooms" pt="lg">
              <ScrollArea h={600}>
                <Stack gap="md">
                  <MoodBCard>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={500}>{t('roomProfiles')}</Text>
                        <Text size="sm" c="dimmed">{t('roomProfilesDescription')}</Text>
                      </div>
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size={14} />}
                        onClick={handleAddRoomProfile}
                        disabled={availableRoomTypes.length === 0}
                      >
                        {t('addRoomProfile')}
                      </Button>
                    </Group>

                    {roomProfileFields.length === 0 ? (
                      <Text size="sm" c="dimmed" ta="center" py="md">
                        {t('noRoomProfiles')}
                      </Text>
                    ) : (
                      <Stack gap="md">
                        {roomProfileFields.map((field, index) => {
                          const roomProfile = roomProfiles?.[index]
                          const roomMaterials = roomProfile?.materials || []
                          const roomImages = roomProfile?.images || []
                          
                          return (
                            <Paper key={field.id} p="md" withBorder>
                              <Stack gap="sm">
                                <Group justify="space-between">
                                  <Text fw={500}>
                                    {tRoomTypes(roomProfile?.roomType || '')}
                                  </Text>
                                  <ActionIcon
                                    color="red"
                                    variant="subtle"
                                    onClick={() => removeRoomProfile(index)}
                                  >
                                    <IconX size={16} />
                                  </ActionIcon>
                                </Group>

                                <Controller
                                  name={`roomProfiles.${index}.roomType`}
                                  control={control}
                                  render={({ field: roomTypeField }) => (
                                    <Select
                                      label={t('roomType')}
                                      data={roomTypeOptions.filter(
                                        (opt) => opt.value === roomProfile?.roomType || !roomProfiles?.some((rp, i) => i !== index && rp.roomType === opt.value)
                                      )}
                                      {...roomTypeField}
                                      error={errors.roomProfiles?.[index]?.roomType?.message}
                                    />
                                  )}
                                />

                                <div>
                                  <Text size="sm" fw={500} mb="xs">
                                    {t('roomSpecificMaterials')}
                                  </Text>
                                  <Text size="xs" c="dimmed" mb="sm">
                                    {t('roomSpecificMaterialsDescription')}
                                  </Text>
                                  {/* Room-specific materials would go here - for now just showing the structure */}
                                  <Paper p="sm" withBorder bg="gray.0">
                                    <Text size="sm" c="dimmed">
                                      {roomMaterials.length === 0
                                        ? t('noRoomMaterials')
                                        : `${roomMaterials.length} ${t('materialsAdded')}`}
                                    </Text>
                                  </Paper>
                                </div>

                                {/* Room Profile Images */}
                                <Paper p="md" withBorder>
                                  <Text fw={500} size="sm" mb="xs">
                                    {t('images') || 'Images'} ({tRoomTypes(roomProfile?.roomType || '')})
                                  </Text>
                                  <Controller
                                    name={`roomProfiles.${index}.images`}
                                    control={control}
                                    render={({ field }) => (
                                      <ImageUpload
                                        value={field.value || []}
                                        onChange={(newImages) => {
                                          field.onChange(newImages)
                                          const updatedProfiles = [...(roomProfiles || [])]
                                          updatedProfiles[index] = {
                                            ...updatedProfiles[index],
                                            images: newImages,
                                          }
                                          setValue('roomProfiles', updatedProfiles, { shouldDirty: true })
                                        }}
                                        entityType="style"
                                        entityId={styleId}
                                        roomType={roomProfile?.roomType}
                                        maxImages={20}
                                        multiple
                                        error={errors.roomProfiles?.[index]?.images?.message}
                                      />
                                    )}
                                  />
                                </Paper>
                              </Stack>
                            </Paper>
                          )
                        })}
                      </Stack>
                    )}
                  </MoodBCard>
                </Stack>
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>

          {/* Submit Buttons */}
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => router.push(`/${locale}/admin/styles/${styleId}`)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              color="brand"
              variant="filled"
              loading={updateMutation.isPending}
            >
              {tCommon('save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  )
}
