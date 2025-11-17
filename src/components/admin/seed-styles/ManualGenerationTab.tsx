/**
 * Manual Generation Tab
 * Allows precise control over style generation with specific selections
 */

'use client'

import { useState, useMemo, useRef } from 'react'
import { Stack, Paper, Title, Select, MultiSelect, Switch, Group, Button, Badge, Collapse, Alert, Text } from '@mantine/core'
import { IconPlayerPlay, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { useSubCategories } from '@/hooks/useCategories'
import { useApproaches } from '@/hooks/useApproaches'
import { useColors } from '@/hooks/useColors'
import { calculateEstimatedCost } from '@/lib/seed/cost-calculator'
import { CostBreakdownTable } from '@/components/admin/CostBreakdownTable'
import { ProgressDisplay } from './ProgressDisplay'
import { ResultDisplay } from './ResultDisplay'
import { ROOM_TYPES, ProgressEvent, SeedResult, CompletedStyle } from './shared'

interface ManualGenerationTabProps {
  onComplete?: () => void
}

export default function ManualGenerationTab({ onComplete }: ManualGenerationTabProps) {
  // Form state
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [selectedApproach, setSelectedApproach] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [generateImages, setGenerateImages] = useState(true)
  const [generateRoomProfiles, setGenerateRoomProfiles] = useState(true)

  // Progress state
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<ProgressEvent[]>([])
  const [currentProgress, setCurrentProgress] = useState<{ current: number; total: number } | null>(null)
  const [result, setResult] = useState<SeedResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [executionId, setExecutionId] = useState<string | null>(null)
  const [completedStyles, setCompletedStyles] = useState<CompletedStyle[]>([])

  // UI state
  const [showCostBreakdown, setShowCostBreakdown] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch data
  const { data: subCategories, isLoading: loadingSubCategories } = useSubCategories()
  const { data: approaches, isLoading: loadingApproaches } = useApproaches()
  const { data: colors, isLoading: loadingColors } = useColors({ organizationId: 'null' })

  // Calculate cost
  const roomCount = generateRoomProfiles ? (selectedRooms.length > 0 ? selectedRooms.length : 24) : 0
  const costBreakdown = useMemo(
    () =>
      calculateEstimatedCost(1, {
        generateImages,
        generateRoomProfiles,
      }),
    [generateImages, generateRoomProfiles]
  )

  const estimatedImages = generateRoomProfiles ? 3 + roomCount * 3 : 3

  const startManualGeneration = async () => {
    setIsRunning(true)
    setProgress([])
    setCurrentProgress(null)
    setResult(null)
    setError(null)
    setExecutionId(null)
    setCompletedStyles([])

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch('/api/admin/seed-styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: 1,
          subCategoryFilter: selectedSubCategory,
          manualMode: true,
          approachId: selectedApproach,
          colorId: selectedColor,
          roomTypeFilter: selectedRooms.length > 0 ? selectedRooms : undefined,
          generateImages,
          generateRoomProfiles,
          dryRun: false,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to start generation')
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
            onComplete?.()
          } else if (event === 'error') {
            setError(data.error)
            setIsRunning(false)
            onComplete?.()
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Generation stopped by user')
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
      setIsRunning(false)
    }
  }

  const isFormValid = selectedSubCategory && selectedApproach && selectedColor

  return (
    <Stack gap="lg">
      {/* Configuration Form */}
      <Paper shadow="sm" p="lg" withBorder>
        <Stack gap="md">
          <Title order={3}>Manual Style Generation</Title>
          <Text c="dimmed" size="sm">
            Create a single style with precise control over sub-category, approach, color, and room types
          </Text>

          {/* Sub-category Selector */}
          <Select
            label="Sub-Category"
            placeholder={loadingSubCategories ? 'Loading...' : 'Select a sub-category'}
            description="The style will be generated for this sub-category"
            data={
              subCategories?.data.map((sc) => ({
                value: sc.slug,
                label: `${sc.name.en} (${sc.category?.name.en || 'N/A'})`,
              })) || []
            }
            value={selectedSubCategory}
            onChange={setSelectedSubCategory}
            required
            searchable
            disabled={isRunning || loadingSubCategories}
          />

          {/* Approach Selector */}
          <Select
            label="Approach"
            placeholder={loadingApproaches ? 'Loading...' : 'Select an approach'}
            description="The design approach for this style"
            data={
              approaches?.data.map((a) => ({
                value: a.id,
                label: a.name.en,
              })) || []
            }
            value={selectedApproach}
            onChange={setSelectedApproach}
            required
            searchable
            disabled={isRunning || loadingApproaches}
          />

          {/* Color Selector */}
          <Select
            label="Color"
            placeholder={loadingColors ? 'Loading...' : 'Select a color'}
            description="The primary color palette for this style"
            data={
              colors?.data.map((c) => ({
                value: c.id,
                label: `${c.name.en}${c.hex ? ` (${c.hex})` : ''}`,
              })) || []
            }
            value={selectedColor}
            onChange={setSelectedColor}
            required
            searchable
            disabled={isRunning || loadingColors}
          />

          {/* Room Types Multi-Select */}
          <MultiSelect
            label="Room Types (Optional)"
            description="Leave empty to generate all 24 room types"
            placeholder="Select specific rooms or leave empty for all"
            data={ROOM_TYPES}
            value={selectedRooms}
            onChange={setSelectedRooms}
            searchable
            clearable
            disabled={isRunning || !generateRoomProfiles}
            maxDropdownHeight={300}
          />

          <Group gap="xs">
            <Text size="xs" c="dimmed">
              Quick select:
            </Text>
            <Button
              size="xs"
              variant="light"
              onClick={() => setSelectedRooms(['living-room', 'dining-room', 'kitchen'])}
              disabled={isRunning || !generateRoomProfiles}
            >
              Main Rooms
            </Button>
            <Button
              size="xs"
              variant="light"
              onClick={() => setSelectedRooms(['primary-bedroom', 'bedroom', 'bathroom'])}
              disabled={isRunning || !generateRoomProfiles}
            >
              Bedrooms
            </Button>
            <Button
              size="xs"
              variant="light"
              onClick={() => setSelectedRooms(['home-office', 'library-reading-area', 'family-room-tv-area'])}
              disabled={isRunning || !generateRoomProfiles}
            >
              Work/Leisure
            </Button>
          </Group>

          {/* Toggles */}
          <Switch
            label="Generate Images (Gemini 2.5 Flash Image)"
            description={`Will generate ${estimatedImages} images total (3 general${generateRoomProfiles ? ` + ${roomCount} rooms × 3 images` : ''})`}
            checked={generateImages}
            onChange={(e) => setGenerateImages(e.currentTarget.checked)}
            disabled={isRunning}
          />

          <Switch
            label="Generate Room Profiles"
            description="Create detailed room-specific content and images"
            checked={generateRoomProfiles}
            onChange={(e) => {
              setGenerateRoomProfiles(e.currentTarget.checked)
              if (!e.currentTarget.checked) {
                setSelectedRooms([])
              }
            }}
            disabled={isRunning || !generateImages}
          />

          {/* Cost Breakdown */}
          <Paper withBorder p="md" style={{ backgroundColor: '#f8f9fa' }}>
            <Stack gap="sm">
              <Group justify="space-between" style={{ cursor: 'pointer' }} onClick={() => setShowCostBreakdown(!showCostBreakdown)}>
                <Group gap="xs">
                  {showCostBreakdown ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                  <Text fw={600} size="sm">
                    Estimated Cost
                  </Text>
                </Group>
                <Badge variant="filled" color="blue" size="lg">
                  ${costBreakdown.grandTotal.toFixed(2)}
                </Badge>
              </Group>

              <Collapse in={showCostBreakdown}>
                <CostBreakdownTable breakdown={costBreakdown} />
              </Collapse>
            </Stack>
          </Paper>

          {/* Generate Button */}
          <Group justify="flex-end">
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              onClick={startManualGeneration}
              size="lg"
              color="green"
              disabled={!isFormValid || isRunning}
            >
              Generate Style
            </Button>
          </Group>

          {!isFormValid && (
            <Alert color="orange" variant="light">
              <Text size="sm">Please select sub-category, approach, and color to continue</Text>
            </Alert>
          )}
        </Stack>
      </Paper>

      {/* Progress Display */}
      <ProgressDisplay
        isRunning={isRunning}
        isResuming={false}
        executionId={executionId}
        currentProgress={currentProgress}
        progress={progress}
        completedStyles={completedStyles}
      />

      {/* Result Display */}
      <ResultDisplay result={result} error={error} />
    </Stack>
  )
}
