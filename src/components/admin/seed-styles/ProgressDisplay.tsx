/**
 * Shared Progress Display Component
 * Shows real-time SSE progress for seed generation
 */

import { Paper, Stack, Group, Title, Badge, Progress, Timeline, Text, ScrollArea, Alert, Anchor } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import { ProgressEvent, CompletedStyle } from './shared'

interface ProgressDisplayProps {
  isRunning: boolean
  isResuming: boolean
  executionId: string | null
  currentProgress: { current: number; total: number } | null
  progress: ProgressEvent[]
  completedStyles: CompletedStyle[]
}

export function ProgressDisplay({
  isRunning,
  isResuming,
  executionId,
  currentProgress,
  progress,
  completedStyles,
}: ProgressDisplayProps) {
  if (!isRunning || !currentProgress) {
    return null
  }

  return (
    <Paper shadow="sm" p="lg" withBorder>
      <Stack gap="md">
        {isResuming && (
          <Alert color="blue" title="Resuming Generation">
            Continuing from previous execution. Already generated styles will be skipped.
          </Alert>
        )}

        <Group justify="space-between">
          <Title order={3}>Progress</Title>
          <Group gap="sm">
            {executionId && (
              <Badge size="sm" variant="light" c="gray">
                ID: {executionId.slice(0, 8)}...
              </Badge>
            )}
            {isResuming && (
              <Badge size="sm" variant="light" color="blue">
                Resuming
              </Badge>
            )}
            <Badge size="lg" color="blue">
              {currentProgress.current} / {currentProgress.total}
            </Badge>
          </Group>
        </Group>

        <Progress
          value={(currentProgress.current / currentProgress.total) * 100}
          size="xl"
          animated
          color="blue"
        />

        {/* Completed Styles */}
        {completedStyles.length > 0 && (
          <Paper withBorder p="md" style={{ backgroundColor: '#f0fdf4' }}>
            <Stack gap="xs">
              <Text fw={600} size="sm" c="green">
                Completed Styles ({completedStyles.length})
              </Text>
              <ScrollArea h={120}>
                <Stack gap="xs">
                  {completedStyles.map((style) => (
                    <Group key={style.styleId} justify="space-between">
                      <div>
                        <Text size="sm">{style.styleName.en}</Text>
                        <Text size="xs" c="dimmed">
                          {style.styleName.he}
                        </Text>
                      </div>
                      <Anchor href={`/admin/styles/${style.styleId}/edit`} target="_blank" size="sm">
                        <Group gap={4}>
                          Edit
                          <IconExternalLink size={12} />
                        </Group>
                      </Anchor>
                    </Group>
                  ))}
                </Stack>
              </ScrollArea>
            </Stack>
          </Paper>
        )}

        <ScrollArea h={300} type="auto">
          <Timeline active={progress.length} bulletSize={20}>
            {progress.slice(-20).map((p, idx) => (
              <Timeline.Item key={idx} title={p.message}>
                <Text size="xs" c="dimmed">
                  {new Date(p.timestamp).toLocaleTimeString()}
                  {p.percentage !== undefined && ` • ${p.percentage}%`}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </ScrollArea>
      </Stack>
    </Paper>
  )
}
