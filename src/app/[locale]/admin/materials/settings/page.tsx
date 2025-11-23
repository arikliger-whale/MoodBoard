/**
 * Admin Material Settings Page
 * Manage material categories and types
 */

'use client'

import { useState } from 'react'
import { Container, Title, Stack, Tabs, Text } from '@mantine/core'
import { useTranslations } from 'next-intl'
import { IconBox, IconCategory, IconTexture } from '@tabler/icons-react'
import { MaterialCategoriesTab } from '@/components/features/materials/MaterialCategoriesTab'
import { MaterialTypesTab } from '@/components/features/materials/MaterialTypesTab'
import { TextureList } from '@/components/features/textures/TextureList'
import { useParams } from 'next/navigation'

export default function AdminMaterialSettingsPage() {
  const t = useTranslations('admin.materials.settings')
  const tCommon = useTranslations('common')
  const params = useParams()
  const locale = params.locale as string

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={1} c="brand" mb="sm">
            {t('title')}
          </Title>
          <Text c="dimmed" size="lg">
            {t('description')}
          </Text>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="categories">
          <Tabs.List>
            <Tabs.Tab value="categories" leftSection={<IconCategory size={16} />}>
              {t('categoriesTab')}
            </Tabs.Tab>
            <Tabs.Tab value="types" leftSection={<IconBox size={16} />}>
              {t('typesTab')}
            </Tabs.Tab>
            <Tabs.Tab value="textures" leftSection={<IconTexture size={16} />}>
              {locale === 'he' ? 'טקסטורות' : 'Textures'}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="categories" pt="lg">
            <MaterialCategoriesTab />
          </Tabs.Panel>

          <Tabs.Panel value="types" pt="lg">
            <MaterialTypesTab />
          </Tabs.Panel>

          <Tabs.Panel value="textures" pt="lg">
            <TextureList />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

