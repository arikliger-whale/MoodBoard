/**
 * Room Category Form Component
 * Form for creating and editing room categories
 */

'use client'

import { FormSection } from '@/components/ui/Form/FormSection'
import { useCreateRoomCategory, useUpdateRoomCategory } from '@/hooks/useRoomCategories'
import { createRoomCategoryFormSchema } from '@/lib/validations/roomCategory'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, NumberInput, Stack, TextInput, Textarea } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

type RoomCategoryFormValues = z.infer<typeof createRoomCategoryFormSchema>

interface RoomCategoryFormProps {
  category?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function RoomCategoryForm({ category, onSuccess, onCancel }: RoomCategoryFormProps) {
  const t = useTranslations('admin.styleSystem.roomCategories')
  const tCommon = useTranslations('common')
  const params = useParams()
  const locale = params.locale as string

  const isEditMode = !!category
  const createMutation = useCreateRoomCategory()
  const updateMutation = useUpdateRoomCategory()

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RoomCategoryFormValues>({
    resolver: zodResolver(createRoomCategoryFormSchema),
    defaultValues: {
      name: { he: '', en: '' },
      slug: '',
      description: { he: '', en: '' },
      icon: '',
      order: 0,
      active: true,
    },
  })

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || { he: '', en: '' },
        icon: category.icon || '',
        order: category.order,
        active: category.active,
      })
    }
  }, [category, reset])

  const onSubmit = async (data: RoomCategoryFormValues) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: category.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onSuccess?.()
    } catch (error: any) {
      console.error('Submit error:', error)
      alert(error.message || 'Failed to save category')
    }
  }

  const generateSlug = () => {
    const enName = getValues('name.en')
    if (enName) {
      const slug = enName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setValue('slug', slug)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <FormSection title={t('form.basicInfo')}>
          <Stack gap="md">
            <Controller
              name="name.he"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label={t('form.nameHe')}
                  placeholder={t('form.nameHePlaceholder')}
                  required
                  error={errors.name?.he?.message}
                />
              )}
            />

            <Controller
              name="name.en"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label={t('form.nameEn')}
                  placeholder={t('form.nameEnPlaceholder')}
                  required
                  error={errors.name?.en?.message}
                  onBlur={() => {
                    field.onBlur()
                    if (!getValues('slug')) {
                      generateSlug()
                    }
                  }}
                />
              )}
            />

            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label={t('form.slug')}
                  placeholder={t('form.slugPlaceholder')}
                  required
                  error={errors.slug?.message}
                  rightSection={
                    <Button size="xs" variant="subtle" onClick={generateSlug}>
                      {tCommon('generate')}
                    </Button>
                  }
                />
              )}
            />

            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label={t('form.icon')}
                  placeholder={t('form.iconPlaceholder')}
                  error={errors.icon?.message}
                />
              )}
            />

            <Controller
              name="order"
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  label={t('form.order')}
                  placeholder={t('form.orderPlaceholder')}
                  min={0}
                  error={errors.order?.message}
                />
              )}
            />
          </Stack>
        </FormSection>

        <FormSection title={t('form.description')}>
          <Stack gap="md">
            <Controller
              name="description.he"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label={t('form.descriptionHe')}
                  placeholder={t('form.descriptionHePlaceholder')}
                  minRows={3}
                  error={errors.description?.he?.message}
                />
              )}
            />

            <Controller
              name="description.en"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label={t('form.descriptionEn')}
                  placeholder={t('form.descriptionEnPlaceholder')}
                  minRows={3}
                  error={errors.description?.en?.message}
                />
              )}
            />
          </Stack>
        </FormSection>

        <Stack gap="sm">
          <Button type="submit" color="brand" fullWidth loading={isSubmitting}>
            {isEditMode ? tCommon('save') : tCommon('create')}
          </Button>
          {onCancel && (
            <Button variant="subtle" fullWidth onClick={onCancel} disabled={isSubmitting}>
              {tCommon('cancel')}
            </Button>
          )}
        </Stack>
      </Stack>
    </form>
  )
}
