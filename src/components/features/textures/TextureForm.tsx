/**
 * Texture Form Component
 * Create/Edit texture with material category multi-selection
 */

'use client'

import { FormSection } from '@/components/ui/Form/FormSection'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { MoodBCard } from '@/components/ui/Card'
import {
  useCreateTexture,
  useMaterialCategoriesLite,
  useTexture,
  useUpdateTexture,
  type CreateTextureInput,
  type UpdateTextureInput,
} from '@/hooks/useTextures'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  MultiSelect,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

// Form schema
const textureFormSchema = z.object({
  name: z.object({
    he: z.string().min(1, 'Hebrew name is required'),
    en: z.string().min(1, 'English name is required'),
  }),
  description: z.object({
    he: z.string().optional(),
    en: z.string().optional(),
  }).optional(),
  materialCategoryIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1, 'At least one category is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
})

type TextureFormData = z.infer<typeof textureFormSchema>

interface TextureFormProps {
  textureId?: string
  mode: 'create' | 'edit'
}

export function TextureForm({ textureId, mode }: TextureFormProps) {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Fetch data (using lightweight endpoint for better performance)
  const { data: categoriesData } = useMaterialCategoriesLite()
  const categories = categoriesData?.data || []

  const { data: existingTexture } = useTexture(textureId || '')

  // Mutations
  const createMutation = useCreateTexture()
  const updateMutation = useUpdateTexture()

  // Form
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<TextureFormData>({
    resolver: zodResolver(textureFormSchema),
    defaultValues: {
      name: { he: '', en: '' },
      description: { he: '', en: '' },
      materialCategoryIds: [],
      imageUrl: '',
      tags: [],
    },
  })

  // Load existing texture data
  useEffect(() => {
    if (existingTexture && mode === 'edit') {
      setValue('name', existingTexture.name)
      setValue('description', existingTexture.description)
      setValue(
        'materialCategoryIds',
        existingTexture.materialCategories.map((mc) => mc.materialCategoryId)
      )
      setValue('imageUrl', existingTexture.imageUrl || '')
      setValue('tags', existingTexture.tags || [])
    }
  }, [existingTexture, mode, setValue])

  // Category options for MultiSelect
  const categoryOptions = useMemo(() => {
    return categories.map((cat) => {
      const categoryName = locale === 'he' ? cat.name.he : cat.name.en
      return {
        value: cat.id,
        label: categoryName,
      }
    })
  }, [categories, locale])

  // Handle form submission
  const onSubmit = async (data: TextureFormData) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description,
          materialCategoryIds: data.materialCategoryIds,
          imageUrl: data.imageUrl || undefined,
          tags: data.tags,
        } as CreateTextureInput)
      } else if (textureId) {
        await updateMutation.mutateAsync({
          id: textureId,
          data: {
            name: data.name,
            description: data.description,
            materialCategoryIds: data.materialCategoryIds,
            imageUrl: data.imageUrl || undefined,
            tags: data.tags,
          } as UpdateTextureInput,
        })
      }

      router.push(`/${locale}/admin/materials/settings`)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // Collect validation errors
  useEffect(() => {
    const messages: string[] = []
    if (errors.name?.he?.message) messages.push(errors.name.he.message)
    if (errors.name?.en?.message) messages.push(errors.name.en.message)
    if (errors.materialCategoryIds?.message) messages.push(errors.materialCategoryIds.message)
    if (errors.imageUrl?.message) messages.push(errors.imageUrl.message)
    setValidationErrors(messages)
  }, [errors])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="lg">
        {/* Header */}
        <Group gap="md" align="center">
          <ActionIcon variant="subtle" onClick={() => router.back()}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={1} c="brand" style={{ flex: 1 }}>
            {mode === 'create'
              ? locale === 'he'
                ? 'יצירת טקסטורה חדשה'
                : 'Create New Texture'
              : locale === 'he'
                ? `עריכת טקסטורה: ${existingTexture?.name.he || ''}`
                : `Edit Texture: ${existingTexture?.name.en || ''}`}
          </Title>
          <Button type="submit" color="brand" variant="filled" loading={isSubmitting}>
            {locale === 'he' ? 'שמור' : 'Save'}
          </Button>
        </Group>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={locale === 'he' ? 'שגיאות בטופס' : 'Form Errors'}
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

        {/* Basic Info */}
        <MoodBCard>
          <Stack gap="md">
            <FormSection title={locale === 'he' ? 'מידע בסיסי' : 'Basic Information'}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  label={locale === 'he' ? 'שם (עברית)' : 'Name (Hebrew)'}
                  placeholder={locale === 'he' ? 'הזן שם בעברית' : 'Enter Hebrew name'}
                  {...register('name.he')}
                  error={errors.name?.he?.message}
                  required
                />
                <TextInput
                  label={locale === 'he' ? 'שם (אנגלית)' : 'Name (English)'}
                  placeholder={locale === 'he' ? 'הזן שם באנגלית' : 'Enter English name'}
                  {...register('name.en')}
                  error={errors.name?.en?.message}
                  required
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Textarea
                  label={locale === 'he' ? 'תיאור (עברית)' : 'Description (Hebrew)'}
                  placeholder={locale === 'he' ? 'תיאור אופציונלי' : 'Optional description'}
                  {...register('description.he')}
                  error={errors.description?.he?.message}
                  minRows={3}
                />
                <Textarea
                  label={locale === 'he' ? 'תיאור (אנגלית)' : 'Description (English)'}
                  placeholder={locale === 'he' ? 'תיאור אופציונלי' : 'Optional description'}
                  {...register('description.en')}
                  error={errors.description?.en?.message}
                  minRows={3}
                />
              </SimpleGrid>

              {/* Multi-Select for Material Categories */}
              <Controller
                name="materialCategoryIds"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    {...field}
                    label={locale === 'he' ? 'קטגוריות חומרים' : 'Material Categories'}
                    placeholder={locale === 'he' ? 'בחר קטגוריות (ניתן לבחור מספר)' : 'Select categories (can select multiple)'}
                    data={categoryOptions}
                    error={errors.materialCategoryIds?.message}
                    required
                    searchable
                    description={
                      locale === 'he'
                        ? 'ניתן לבחור מספר קטגוריות - הטקסטורה תופיע בכולן'
                        : 'You can select multiple categories - the texture will appear in all of them'
                    }
                  />
                )}
              />
            </FormSection>
          </Stack>
        </MoodBCard>

        {/* Image */}
        <MoodBCard>
          <Stack gap="md">
            <FormSection title={locale === 'he' ? 'תמונת טקסטורה' : 'Texture Image'}>
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    onChange={(urls) => field.onChange(urls[0] || '')}
                    entityType="texture"
                    entityId={textureId || ''}
                    maxImages={1}
                    multiple={false}
                    error={errors.imageUrl?.message}
                  />
                )}
              />
              <Text size="sm" c="dimmed">
                {locale === 'he'
                  ? 'העלה תמונת טקסטורה באיכות גבוהה המציגה את הגימור'
                  : 'Upload a high-quality texture image showing the finish'}
              </Text>
            </FormSection>
          </Stack>
        </MoodBCard>
      </Stack>
    </form>
  )
}
