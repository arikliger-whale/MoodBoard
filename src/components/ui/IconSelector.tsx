'use client'

import { ActionIcon, Group, Modal, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import * as TablerIcons from '@tabler/icons-react'
import { IconSearch, IconX } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface IconSelectorProps {
  value?: string
  onChange?: (iconName: string) => void
  label?: string
  placeholder?: string
  error?: string
  description?: string
}

// Common icon names from Tabler Icons
const COMMON_ICONS = [
  'IconBox',
  'IconCategory',
  'IconPalette',
  'IconPaint',
  'IconTools',
  'IconHammer',
  'IconWood',
  'IconBrick',
  'IconCube',
  'IconCubeUnfolded',
  'IconDeviceDesktop',
  'IconHome',
  'IconBuilding',
  'IconTiles',
  'IconRuler',
  'IconWall',
  'IconWindow',
  'IconDoor',
  'IconLamp',
  'IconArmchair',
  'IconSofa',
  'IconBed',
  'IconTable',
  'IconShoppingCart',
  'IconPackage',
  'IconStack',
  'IconLayers',
  'IconGrid3x3',
  'IconBrandTabler',
  'IconStar',
  'IconHeart',
  'IconTag',
  'IconTags',
  'IconFile',
  'IconFolder',
  'IconColorSwatch',
  'IconColorPicker',
  'IconBrush',
  'IconBucket',
  'IconDroplet',
  'IconFlame',
  'IconLeaf',
  'IconMountain',
  'IconWave',
  'IconCloud',
  'IconSun',
  'IconMoon',
  'IconEye',
  'IconEyeOff',
  'IconCheck',
  'IconX',
  'IconPlus',
  'IconMinus',
  'IconEdit',
  'IconTrash',
  'IconSettings',
  'IconCog',
  'IconLayout',
  'IconComponents',
  'IconBoxMultiple',
  'IconBoxes',
] as const

type IconName = (typeof COMMON_ICONS)[number]

export function IconSelector({
  value,
  onChange,
  label,
  placeholder,
  error,
  description,
}: IconSelectorProps) {
  const t = useTranslations('common')
  const [opened, setOpened] = useState(false)
  const [search, setSearch] = useState('')
  
  const defaultPlaceholder = placeholder || t('selectIcon', { defaultValue: 'Select an icon' })

  const IconComponent = value && TablerIcons[value as IconName] 
    ? TablerIcons[value as IconName] 
    : TablerIcons.IconBox

  const filteredIcons = COMMON_ICONS.filter((iconName) =>
    iconName.toLowerCase().replace('icon', '').includes(search.toLowerCase())
  )

  const handleSelect = (iconName: string) => {
    onChange?.(iconName)
    setOpened(false)
    setSearch('')
  }

  return (
    <>
      <Stack gap="xs">
        {label && <Text size="sm" fw={500}>{label}</Text>}
        <Group gap="xs">
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => setOpened(true)}
            style={{ border: '1px solid #ddd' }}
          >
            <IconComponent size={20} />
          </ActionIcon>
          <Select
            placeholder={defaultPlaceholder}
            value={value || null}
            onChange={(val) => onChange?.(val || '')}
            data={COMMON_ICONS
              .filter((icon) => TablerIcons[icon as IconName] !== undefined)
              .map((icon) => ({
                value: icon,
                label: icon.replace('Icon', ''),
              }))}
            searchable
            style={{ flex: 1 }}
            error={error}
            rightSection={
              value ? (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange?.('')
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
          />
        </Group>
        {description && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
      </Stack>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false)
          setSearch('')
        }}
        title={t('selectIcon', { defaultValue: 'Select Icon' })}
        size="xl"
      >
        <Stack gap="md">
          <TextInput
            placeholder={t('searchIcons', { defaultValue: 'Search icons...' })}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SimpleGrid cols={8} spacing="md">
            {filteredIcons
              .filter((iconName) => {
                // Only include icons that actually exist in TablerIcons
                return TablerIcons[iconName as IconName] !== undefined
              })
              .map((iconName) => {
                const Icon = TablerIcons[iconName as IconName]
                const isSelected = value === iconName
                
                // Double-check Icon exists before rendering
                if (!Icon) return null
                
                return (
                  <ActionIcon
                    key={iconName}
                    variant={isSelected ? 'filled' : 'light'}
                    size="xl"
                    color={isSelected ? 'brand' : 'gray'}
                    onClick={() => handleSelect(iconName)}
                    title={iconName.replace('Icon', '')}
                    style={{
                      border: isSelected ? '2px solid #df2538' : '1px solid #ddd',
                    }}
                  >
                    <Icon size={24} />
                  </ActionIcon>
                )
              })}
          </SimpleGrid>
        </Stack>
      </Modal>
    </>
  )
}

