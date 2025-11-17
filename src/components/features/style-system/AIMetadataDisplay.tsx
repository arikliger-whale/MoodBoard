'use client'

import { Badge, Box, Card, Group, Progress, Stack, Text, Tooltip } from '@mantine/core'
import { IconRobot, IconBulb, IconBrain } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'

interface AISelection {
  approachConfidence: number
  reasoning: {
    he: string
    en: string
  }
}

interface AIMetadataDisplayProps {
  aiGenerated?: boolean
  aiSelection?: AISelection | null
  variant?: 'compact' | 'full'
  locale?: string
}

export function AIMetadataDisplay({
  aiGenerated = false,
  aiSelection,
  variant = 'full',
  locale = 'he',
}: AIMetadataDisplayProps) {
  const t = useTranslations('admin.styles')

  // If not AI generated, show nothing in compact mode
  if (!aiGenerated && variant === 'compact') {
    return null
  }

  // Compact badge for table lists
  if (variant === 'compact') {
    return (
      <Badge
        leftSection={<IconRobot size={14} />}
        color="violet"
        variant="light"
        size="sm"
      >
        AI
      </Badge>
    )
  }

  // Full display for detail pages
  if (!aiGenerated) {
    return (
      <Card withBorder>
        <Group gap="xs">
          <IconBrain size={20} color="gray" />
          <Text size="sm" c="dimmed">
            {t('manually_created')}
          </Text>
        </Group>
      </Card>
    )
  }

  const confidence = aiSelection?.approachConfidence ?? 0
  const confidencePercent = Math.round(confidence * 100)
  const reasoning = aiSelection?.reasoning?.[locale as 'he' | 'en'] ?? ''

  // Confidence color logic
  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return 'green'
    if (conf >= 0.6) return 'yellow'
    return 'orange'
  }

  return (
    <Card withBorder p="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconRobot size={24} color="#7950f2" />
            <Text size="lg" fw={600}>
              {t('ai_generated')}
            </Text>
          </Group>
          <Badge
            color="violet"
            variant="light"
            size="lg"
            leftSection={<IconBrain size={14} />}
          >
            {t('ai_powered')}
          </Badge>
        </Group>

        {/* Confidence Score */}
        {aiSelection && (
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                {t('ai_confidence')}
              </Text>
              <Tooltip label={t('ai_confidence_tooltip')}>
                <Text size="sm" fw={600} c={getConfidenceColor(confidence)}>
                  {confidencePercent}%
                </Text>
              </Tooltip>
            </Group>
            <Progress
              value={confidencePercent}
              color={getConfidenceColor(confidence)}
              size="lg"
              radius="md"
              striped
              animated={confidence >= 0.8}
            />
          </Box>
        )}

        {/* AI Reasoning */}
        {reasoning && (
          <Box>
            <Group gap="xs" mb="xs">
              <IconBulb size={18} />
              <Text size="sm" fw={500}>
                {t('ai_reasoning')}
              </Text>
            </Group>
            <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-line' }}>
              {reasoning}
            </Text>
          </Box>
        )}

        {/* Info note */}
        <Text size="xs" c="dimmed" fs="italic">
          {t('ai_generated_note')}
        </Text>
      </Stack>
    </Card>
  )
}
