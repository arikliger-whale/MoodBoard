/**
 * Bulk Generation Tab
 * AI-powered bulk style generation with filters and configuration
 */

'use client'

import { useState, useMemo, useRef } from 'react'
import { Stack, Paper, Title, NumberInput, Select, Switch, Group, Button, Radio, MultiSelect, Alert, Text, Badge, Collapse } from '@mantine/core'
import { IconPlayerPlay, IconPlayerStop, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { calculateEstimatedCost } from '@/lib/seed/cost-calculator'
import { CostBreakdownTable } from '@/components/admin/CostBreakdownTable'
import { ProgressDisplay } from './ProgressDisplay'
import { ResultDisplay } from './ResultDisplay'
import { ROOM_TYPES, CATEGORY_OPTIONS, ProgressEvent, SeedResult, CompletedStyle } from './shared'

interface BulkGenerationTabProps {
  onComplete?: () => void
  resumeExecutionId?: string | null
}

export default function BulkGenerationTab({ onComplete, resumeExecutionId }: BulkGenerationTabProps) {
  // Configuration state
  const [limit, setLimit] = useState<number>(5)
  const [generateImages, setGenerateImages] = useState(true)
  const [generateRoomProfiles, setGenerateRoomProfiles] = useState(true)
  const [dryRun, setDryRun] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [roomSelection, setRoomSelection] = useState<'all' | 'specific'>('all')
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])

  // Progress state
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<ProgressEvent[]>([])
  const [currentProgress, setCurrentProgress] = useState<{ current: number; total: number } | null>(null)
  const [result, setResult] = useState<SeedResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [executionId, setExecutionId] = useState<string | null>(null)
  const [completedStyles, setCompletedStyles] = useState<CompletedStyle[]>([])
  const [isResuming, setIsResuming] = useState(false)

  // UI state
  const [showCostBreakdown, setShowCostBreakdown] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Calculate cost breakdown
  const costBreakdown = useMemo(
    () =>
      calculateEstimatedCost(limit, {
        generateImages,
        generateRoomProfiles,
      }),
    [limit, generateImages, generateRoomProfiles]
  )

  const estimatedTime = limit * 3 // ~3 minutes per style
  const roomCount = generateRoomProfiles ? (roomSelection === 'specific' && selectedRooms.length > 0 ? selectedRooms.length : 24) : 0
  const estimatedImages = generateRoomProfiles ? limit * (3 + roomCount * 3) : limit * 3

  const startSeeding = async (resumeId?: string) => {
    setIsRunning(true)
    setProgress([])
    setCurrentProgress(null)
    setResult(null)
    setError(null)
    setIsResuming(!!resumeId)
    if (!resumeId) {
      setExecutionId(null)
      setCompletedStyles([])
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch('/api/admin/seed-styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit,
          generateImages,
          generateRoomProfiles,
          dryRun,
          categoryFilter: categoryFilter || undefined,
          roomTypeFilter: roomSelection === 'specific' && selectedRooms.length > 0 ? selectedRooms : undefined,
          resumeExecutionId: resumeId,
          manualMode: false, // Use AI selection
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to start seeding')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (!line.trim()) continue

          const [eventLine, dataLine] = line.split('\n')
          if (!eventLine?.startsWith('event:') || !dataLine?.startsWith('data:')) continue

          const event = eventLine.replace('event: ', '').trim()
          const data = JSON.parse(dataLine.replace('data: ', ''))

          if (event === 'start') {
            if (data.executionId) {
              setExecutionId(data.executionId)
            }
          } else if (event === 'progress') {
            setProgress((prev) => [...prev, data])
            if (data.current && data.total) {
              setCurrentProgress({ current: data.current, total: data.total })
            }
          } else if (event === 'style-completed') {
            setCompletedStyles((prev) => [
              ...prev,
              {
                styleId: data.styleId,
                styleName: data.styleName,
                slug: data.slug,
              },
            ])
          } else if (event === 'complete') {
            setResult(data.result)
            setIsRunning(false)
            setIsResuming(false)
            onComplete?.()
          } else if (event === 'error') {
            setError(data.error)
            setIsRunning(false)
            setIsResuming(false)
            onComplete?.()
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Seeding stopped by user')
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
      setIsRunning(false)
    }
  }

  const stopSeeding = () => {
    abortControllerRef.current?.abort()
    setIsRunning(false)
  }

  // Auto-resume if resumeExecutionId is provided
  useState(() => {
    if (resumeExecutionId) {
      startSeeding(resumeExecutionId)
    }
  })

  return (
    <Stack gap="lg">
      {/* Configuration */}
      <Paper shadow="sm" p="lg" withBorder>
        <Stack gap="md">
          <Title order={3}>Bulk Style Generation</Title>
          <Text c="dimmed" size="sm">
            Generate multiple styles with AI-powered optimization and filtering options
          </Text>

          <NumberInput
            label="Number of Styles to Generate"
            description={`Generate styles for the first ${limit} sub-categories (max 60 total)`}
            value={limit}
            onChange={(val) => setLimit(val as number)}
            min={1}
            max={60}
            disabled={isRunning}
          />

          <Select
            label="Category Filter (Optional)"
            description="Only generate styles for sub-categories in this category"
            placeholder="All categories"
            data={CATEGORY_OPTIONS}
            value={categoryFilter}
            onChange={setCategoryFilter}
            clearable
            disabled={isRunning}
          />

          <Switch
            label="Generate Images (Gemini 2.5 Flash Image)"
            description={`Will generate ${estimatedImages} images total (3 general${generateRoomProfiles ? ` + ${roomCount} rooms × 3 images per style` : ''})`}
            checked={generateImages}
            onChange={(e) => setGenerateImages(e.currentTarget.checked)}
            disabled={isRunning}
          />

          <Switch
            label="Generate Room Profiles"
            description="Create detailed room-specific content and images for each style"
            checked={generateRoomProfiles}
            onChange={(e) => {
              setGenerateRoomProfiles(e.currentTarget.checked)
              if (!e.currentTarget.checked) {
                setRoomSelection('all')
                setSelectedRooms([])
              }
            }}
            disabled={isRunning || !generateImages}
          />

          {generateRoomProfiles && (
            <Paper withBorder p="md" style={{ backgroundColor: '#f0f9ff' }}>
              <Stack gap="md">
                <Text fw={600} size="sm">
                  Room Selection
                </Text>

                <Radio.Group
                  value={roomSelection}
                  onChange={(value) => {
                    setRoomSelection(value as 'all' | 'specific')
                    if (value === 'all') {
                      setSelectedRooms([])
                    }
                  }}
                >
                  <Stack gap="xs">
                    <Radio value="all" label="Generate All 24 Room Types" description="Comprehensive generation for all rooms (default)" disabled={isRunning} />
                    <Radio value="specific" label="Generate Specific Room Types Only" description="Select which rooms to generate (faster, lower cost)" disabled={isRunning} />
                  </Stack>
                </Radio.Group>

                {roomSelection === 'specific' && (
                  <>
                    <MultiSelect
                      label="Select Room Types"
                      description="Choose one or more room types to generate"
                      placeholder="Pick rooms..."
                      data={ROOM_TYPES}
                      value={selectedRooms}
                      onChange={setSelectedRooms}
                      searchable
                      clearable
                      disabled={isRunning}
                      maxDropdownHeight={300}
                    />

                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        Quick select:
                      </Text>
                      <Button size="xs" variant="light" onClick={() => setSelectedRooms(['living-room', 'dining-room', 'kitchen'])} disabled={isRunning}>
                        Main Rooms
                      </Button>
                      <Button size="xs" variant="light" onClick={() => setSelectedRooms(['primary-bedroom', 'bedroom', 'bathroom'])} disabled={isRunning}>
                        Bedrooms
                      </Button>
                      <Button size="xs" variant="light" onClick={() => setSelectedRooms(['home-office', 'library-reading-area', 'family-room-tv-area'])} disabled={isRunning}>
                        Work/Leisure
                      </Button>
                    </Group>
                  </>
                )}

                {roomSelection === 'specific' && selectedRooms.length > 0 && (
                  <Alert color="blue" variant="light">
                    <Text size="sm">
                      Selected: {selectedRooms.length} room{selectedRooms.length > 1 ? 's' : ''} × 3 images = {selectedRooms.length * 3} images per style
                    </Text>
                  </Alert>
                )}
              </Stack>
            </Paper>
          )}

          <Switch label="Dry Run (Test Without Saving)" description="Simulate the process without saving to database" checked={dryRun} onChange={(e) => setDryRun(e.currentTarget.checked)} disabled={isRunning} />

          <Paper withBorder p="md" style={{ backgroundColor: '#f8f9fa' }}>
            <Stack gap="sm">
              <Group justify="space-between" style={{ cursor: 'pointer' }} onClick={() => setShowCostBreakdown(!showCostBreakdown)}>
                <Group gap="xs">
                  {showCostBreakdown ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                  <Text fw={600} size="sm">
                    Estimated Cost & Time
                  </Text>
                </Group>
                <Group gap="md">
                  <Badge variant="light" size="lg">
                    ~{estimatedTime} min
                  </Badge>
                  <Badge variant="filled" color="blue" size="lg">
                    ${costBreakdown.grandTotal.toFixed(2)}
                  </Badge>
                </Group>
              </Group>

              <Collapse in={showCostBreakdown}>
                <CostBreakdownTable breakdown={costBreakdown} />
              </Collapse>
            </Stack>
          </Paper>

          <Group justify="flex-end">
            {!isRunning ? (
              <Button
                leftSection={<IconPlayerPlay size={16} />}
                onClick={() => startSeeding()}
                size="lg"
                color="green"
                disabled={roomSelection === 'specific' && selectedRooms.length === 0 && generateRoomProfiles}
              >
                Start Generation
              </Button>
            ) : (
              <Button leftSection={<IconPlayerStop size={16} />} onClick={stopSeeding} size="lg" color="red" variant="light">
                Stop
              </Button>
            )}
          </Group>

          {roomSelection === 'specific' && selectedRooms.length === 0 && generateRoomProfiles && (
            <Alert color="orange" variant="light">
              <Text size="sm">Please select at least one room type or switch to "Generate All 24 Room Types"</Text>
            </Alert>
          )}
        </Stack>
      </Paper>

      {/* Progress Display */}
      <ProgressDisplay isRunning={isRunning} isResuming={isResuming} executionId={executionId} currentProgress={currentProgress} progress={progress} completedStyles={completedStyles} />

      {/* Result Display */}
      <ResultDisplay result={result} error={error} />
    </Stack>
  )
}
