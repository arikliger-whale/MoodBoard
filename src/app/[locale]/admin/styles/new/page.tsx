/**
 * Admin Style Create Page
 * Create new global style with full form
 */

'use client'

import { useState } from 'react'
import { Container, Title, Stack, Group, ActionIcon, Text, Button, Alert, Tabs, ScrollArea } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowLeft, IconAlertCircle, IconPlus, IconX, IconPalette, IconBox } from '@tabler/icons-react'
import { MoodBButton, MoodBCard, FormSection } from '@/components/ui'
import { createStyleSchema, type CreateStyle } from '@/lib/validations/style'
import { useCreateAdminStyle } from '@/hooks/useStyles'
import {
  TextInput,
  Select,
  SimpleGrid,
} from '@mantine/core'

export default function AdminStyleNewPage() {
  const t = useTranslations('admin.styles.create')
  const tCommon = useTranslations('common')
  const tCategories = useTranslations('admin.styles.categories')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const createMutation = useCreateAdminStyle()
  const [activeTab, setActiveTab] = useState<string | null>('basic')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateStyle>({
    // @ts-expect-error - zodResolver type issue with nested schemas
    resolver: zodResolver(createStyleSchema),
    defaultValues: {
      name: {
        he: '',
        en: '',
      },
      category: 'scandinavian',
      slug: '',
      palette: {
        neutrals: [{ name: '', hex: '#ffffff' }],
        accents: [{ name: '', hex: '#df2538' }],
      },
      materialSet: {
        defaults: [{ materialId: '', usageArea: '' }],
        alternatives: [],
      },
      roomProfiles: [],
      metadata: {
        tags: [],
      },
    },
  })

  const {
    fields: neutralFields,
    append: appendNeutral,
    remove: removeNeutral,
  } = useFieldArray({
    control,
    name: 'palette.neutrals',
  })

  const {
    fields: accentFields,
    append: appendAccent,
    remove: removeAccent,
  } = useFieldArray({
    control,
    name: 'palette.accents',
  })

  const {
    fields: defaultMaterialFields,
    append: appendDefaultMaterial,
    remove: removeDefaultMaterial,
  } = useFieldArray({
    control,
    name: 'materialSet.defaults',
  })

  const categoryOptions = [
    { value: 'scandinavian', label: tCategories('scandinavian') },
    { value: 'japandi', label: tCategories('japandi') },
    { value: 'industrial', label: tCategories('industrial') },
    { value: 'minimal', label: tCategories('minimal') },
    { value: 'mediterranean', label: tCategories('mediterranean') },
    { value: 'rustic', label: tCategories('rustic') },
    { value: 'classic', label: tCategories('classic') },
  ]

  const onSubmit = async (data: CreateStyle) => {
    try {
      await createMutation.mutateAsync(data)
      router.push(`/${locale}/admin/styles`)
    } catch (error) {
      console.error('Error creating style:', error)
    }
  }

  return (
    <Container size="xl" py="xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="lg">
          {/* Header */}
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={() => router.push(`/${locale}/admin/styles`)}
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
                : 'Failed to create style'}
            </Alert>
          )}

          {/* Form Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="basic" leftSection={<IconPalette size={16} />}>
                {t('basicInfo')}
              </Tabs.Tab>
              <Tabs.Tab value="palette" leftSection={<IconPalette size={16} />}>
                {t('palette')}
              </Tabs.Tab>
              <Tabs.Tab value="materials" leftSection={<IconBox size={16} />}>
                {t('materials')}
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
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label={t('category')}
                          placeholder={t('categoryPlaceholder')}
                          data={categoryOptions}
                          {...field}
                          error={errors.category?.message}
                          required
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
            </Tabs.Panel>

            {/* Palette Tab */}
            <Tabs.Panel value="palette" pt="lg">
              <ScrollArea h={600}>
                <Stack gap="md">
                  {/* Neutral Colors */}
                  <MoodBCard>
                    <Group justify="space-between" mb="md">
                      <Text fw={500}>{t('neutrals')}</Text>
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size={14} />}
                        onClick={() => appendNeutral({ name: '', hex: '#ffffff' })}
                      >
                        {t('addColor')}
                      </Button>
                    </Group>
                    <Stack gap="sm">
                      {neutralFields.map((field, index) => (
                        <Group key={field.id} align="flex-start">
                          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" style={{ flex: 1 }}>
                            <TextInput
                              placeholder={t('colorName')}
                              {...register(`palette.neutrals.${index}.name`)}
                              error={errors.palette?.neutrals?.[index]?.name?.message}
                            />
                            <TextInput
                              placeholder="#ffffff"
                              {...register(`palette.neutrals.${index}.hex`)}
                              error={errors.palette?.neutrals?.[index]?.hex?.message}
                            />
                            <TextInput
                              placeholder={t('colorPantone')}
                              {...register(`palette.neutrals.${index}.pantone`)}
                            />
                          </SimpleGrid>
                          {neutralFields.length > 1 && (
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => removeNeutral(index)}
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                      ))}
                      {errors.palette?.neutrals && (
                        <Text size="sm" c="red">
                          {errors.palette.neutrals.message}
                        </Text>
                      )}
                    </Stack>
                  </MoodBCard>

                  {/* Accent Colors */}
                  <MoodBCard>
                    <Group justify="space-between" mb="md">
                      <Text fw={500}>{t('accents')}</Text>
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size={14} />}
                        onClick={() => appendAccent({ name: '', hex: '#df2538' })}
                      >
                        {t('addColor')}
                      </Button>
                    </Group>
                    <Stack gap="sm">
                      {accentFields.map((field, index) => (
                        <Group key={field.id} align="flex-start">
                          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" style={{ flex: 1 }}>
                            <TextInput
                              placeholder={t('colorName')}
                              {...register(`palette.accents.${index}.name`)}
                              error={errors.palette?.accents?.[index]?.name?.message}
                            />
                            <TextInput
                              placeholder="#df2538"
                              {...register(`palette.accents.${index}.hex`)}
                              error={errors.palette?.accents?.[index]?.hex?.message}
                            />
                            <TextInput
                              placeholder={t('colorPantone')}
                              {...register(`palette.accents.${index}.pantone`)}
                            />
                          </SimpleGrid>
                          {accentFields.length > 1 && (
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => removeAccent(index)}
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                      ))}
                      {errors.palette?.accents && (
                        <Text size="sm" c="red">
                          {errors.palette.accents.message}
                        </Text>
                      )}
                    </Stack>
                  </MoodBCard>
                </Stack>
              </ScrollArea>
            </Tabs.Panel>

            {/* Materials Tab */}
            <Tabs.Panel value="materials" pt="lg">
              <ScrollArea h={600}>
                <MoodBCard>
                  <Group justify="space-between" mb="md">
                    <Text fw={500}>{t('defaultMaterials')}</Text>
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
                    {defaultMaterialFields.map((field, index) => (
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
                        {defaultMaterialFields.length > 1 && (
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => removeDefaultMaterial(index)}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    ))}
                    {errors.materialSet?.defaults && (
                      <Text size="sm" c="red">
                        {errors.materialSet.defaults.message}
                      </Text>
                    )}
                  </Stack>
                </MoodBCard>
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>

          {/* Submit Buttons */}
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => router.push(`/${locale}/admin/styles`)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              color="brand"
              variant="filled"
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
