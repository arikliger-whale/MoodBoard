/**
 * User-Facing Style Detail Page
 * View style details (global + approved public + personal)
 */

'use client'

import { Container, Title, Text, Stack, Grid, Image, Badge, Group, Paper, Divider, SimpleGrid, Box, Tabs, Select } from '@mantine/core'
import { IconBuildingStore, IconDiamond, IconDoor, IconPalette, IconPhoto, IconSparkles, IconTexture } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useStyle } from '@/hooks/useStyles'
import { useStyleImages, useStyleRoomImages, useStyleMaterialImages } from '@/hooks/useStyleImages'
import { useStyleTextures } from '@/hooks/useStyleTextures'
import { useStyleMaterials } from '@/hooks/useStyleMaterials'
import { useImageViewer } from '@/contexts/ImageViewerContext'
import { useMemo, useState } from 'react'

export default function StyleDetailPage() {
  const tCommon = useTranslations('common')
  const params = useParams()
  const locale = params.locale as string
  const styleId = params.id as string

  const { data: style, isLoading, error } = useStyle(styleId)
  const { openImages } = useImageViewer()

  // Fetch categorized images
  const { data: roomImagesData } = useStyleRoomImages(styleId)
  const { data: materialImagesData } = useStyleMaterialImages(styleId)
  const { data: texturesData } = useStyleTextures(styleId)
  const { data: materialsData } = useStyleMaterials(styleId)

  // State for room type filter
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null)

  const currentLocale = locale === 'he' ? 'he' : 'en'

  // Extract room images grouped by room type
  const roomImages = roomImagesData?.data.images || []
  const roomTypeOptions = useMemo(() => {
    const types = new Set(roomImages.map(img => img.roomType).filter(Boolean))
    return Array.from(types).map(type => ({
      value: type!,
      label: type!,
    }))
  }, [roomImages])

  const filteredRoomImages = useMemo(() => {
    if (!selectedRoomType) return roomImages
    return roomImages.filter(img => img.roomType === selectedRoomType)
  }, [roomImages, selectedRoomType])

  // Material and texture data
  const materialImages = materialImagesData?.data.images || []
  const textures = texturesData?.data.textures || []
  const texturesGrouped = texturesData?.data.groupedByCategory || {}
  const materials = materialsData?.data?.materials || []
  const materialsGrouped = materialsData?.data?.groupedByCategory || {}

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

  // Check if style has required data
  if (!style.approach) {
    return (
      <Container size="xl" py="xl">
        <ErrorState message="Style is incomplete. Missing approach information." />
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Composite Hero Image */}
        {style.compositeImageUrl && (
          <Paper radius="lg" style={{ overflow: 'hidden' }} shadow="md">
            <Box
              style={{
                width: '100%',
                height: 400,
                position: 'relative',
              }}
            >
              <Image
                src={style.compositeImageUrl}
                alt={`${style.name[currentLocale]} - Composite Mood Board`}
                fit="cover"
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Paper>
        )}

        {/* Header */}
        <div>
          <Group gap="xs" mb="xs" wrap="wrap">
            {style.category && (
              <Badge size="lg" variant="light">
                {style.category.name[currentLocale]}
              </Badge>
            )}
            {style.subCategory && (
              <Badge size="lg" variant="outline">
                {style.subCategory.name[currentLocale]}
              </Badge>
            )}
            {style.priceLevel && (
              <Badge
                size="lg"
                variant="filled"
                color={style.priceLevel === 'LUXURY' ? 'grape' : 'blue'}
                leftSection={style.priceLevel === 'LUXURY' ? <IconDiamond size={14} /> : undefined}
              >
                {style.priceLevel === 'LUXURY'
                  ? (locale === 'he' ? 'יוקרתי' : 'Luxury')
                  : (locale === 'he' ? 'רגיל' : 'Regular')}
              </Badge>
            )}
            {style.roomCategory && (
              <Badge size="lg" variant="light" color="teal" leftSection={<IconBuildingStore size={14} />}>
                {style.roomCategory}
              </Badge>
            )}
          </Group>
          <Title order={1} mb="xs">
            {style.name[currentLocale]}
          </Title>
          <Group gap="md" wrap="wrap">
            <Group gap="xs">
              <IconSparkles size={20} />
              <Text size="lg" c="dimmed">
                {style.approach.name[currentLocale]}
              </Text>
            </Group>
            {style.color && (
              <Group gap="xs">
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: style.color.hex,
                    border: '1px solid #ddd',
                  }}
                />
                <Text size="lg" c="dimmed">
                  {style.color.name[currentLocale]}
                </Text>
              </Group>
            )}
          </Group>
        </div>

        {/* Anchor Image */}
        {style.anchorImageUrl && (
          <Paper shadow="sm" p="md" withBorder>
            <Group gap="xs" mb="md">
              <IconPhoto size={20} color="#df2538" />
              <Text fw={600}>{locale === 'he' ? 'תמונת עוגן' : 'Anchor Image'}</Text>
            </Group>
            <Paper radius="md" style={{ overflow: 'hidden' }}>
              <Box
                style={{
                  width: '100%',
                  height: 300,
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (style.anchorImageUrl) {
                    openImages([{
                      url: style.anchorImageUrl,
                      title: style.name[currentLocale],
                      description: locale === 'he' ? 'תמונת עוגן' : 'Anchor Image',
                    }], 0)
                  }
                }}
              >
                <Image
                  src={style.anchorImageUrl}
                  alt={`${style.name[currentLocale]} - Anchor`}
                  fit="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            </Paper>
          </Paper>
        )}

        {/* Tabs for Content Organization */}
        <Tabs defaultValue="overview" variant="pills" radius="md">
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconPalette size={16} />}>
              {locale === 'he' ? 'סקירה' : 'Overview'}
            </Tabs.Tab>
            <Tabs.Tab value="rooms" leftSection={<IconDoor size={16} />}>
              {locale === 'he' ? 'חדרים' : 'Rooms'}
              {roomImages.length > 0 && (
                <Badge size="sm" variant="light" ml="xs">
                  {roomImages.length}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="materials" leftSection={<IconTexture size={16} />}>
              {locale === 'he' ? 'חומרים ומרקמים' : 'Materials & Textures'}
              {(materials.length > 0 || materialImages.length > 0 || textures.length > 0) && (
                <Badge size="sm" variant="light" ml="xs">
                  {materials.length + textures.length}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="images" leftSection={<IconPhoto size={16} />}>
              {locale === 'he' ? 'כל התמונות' : 'All Images'}
              {style.images && style.images.length > 0 && (
                <Badge size="sm" variant="light" ml="xs">
                  {style.images.length}
                </Badge>
              )}
            </Tabs.Tab>
          </Tabs.List>

          {/* Overview Tab */}
          <Tabs.Panel value="overview" pt="xl">
            <Stack gap="md">
              {/* Description */}
        {style.detailedContent && (
          <Paper shadow="sm" p="lg" withBorder>
            <Stack gap="md">
              <Title order={2}>About This Style</Title>
              {style.detailedContent[currentLocale]?.description && (
                <Text>{style.detailedContent[currentLocale].description}</Text>
              )}

              {/* Characteristics */}
              {style.detailedContent[currentLocale]?.characteristics &&
                style.detailedContent[currentLocale].characteristics.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <Title order={3} size="h4" mb="xs">
                        Key Characteristics
                      </Title>
                      <Stack gap="xs">
                        {style.detailedContent[currentLocale].characteristics.map(
                          (char: string, index: number) => (
                            <Text key={index}>• {char}</Text>
                          )
                        )}
                      </Stack>
                    </div>
                  </>
                )}
            </Stack>
          </Paper>
        )}

        {/* Room Profiles */}
        {style.roomProfiles && (style.roomProfiles as any[]).length > 0 && (
          <Stack gap="md">
            <Paper shadow="sm" p="md" withBorder>
              <Title order={3} size="h4">
                Room Designs
              </Title>
              <Text c="dimmed" size="sm">
                {(style.roomProfiles as any[]).length} room configurations available
              </Text>
            </Paper>

            {(style.roomProfiles as any[]).map((roomProfile: any, index: number) => (
              <Paper key={index} shadow="sm" p="lg" withBorder>
                <Stack gap="md">
                  {/* Room Header */}
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Title order={4}>
                        {roomProfile.description?.[currentLocale] || `Room Configuration ${index + 1}`}
                      </Title>
                      {roomProfile.roomTypeId && (
                        <Text c="dimmed" size="xs" mt={4}>
                          Room Type ID: {roomProfile.roomTypeId.slice(0, 8)}...
                        </Text>
                      )}
                    </div>
                    {roomProfile.images && roomProfile.images.length > 0 && (
                      <Badge size="lg" variant="light" leftSection={<IconPhoto size={14} />}>
                        {roomProfile.images.length} Images
                      </Badge>
                    )}
                  </Group>

                  {/* Room Images */}
                  {roomProfile.images && roomProfile.images.length > 0 && (
                    <>
                      <Divider />
                      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                        {roomProfile.images.map((imageUrl: string, imgIndex: number) => (
                          <Paper
                            key={imgIndex}
                            p="xs"
                            withBorder
                            radius="md"
                            style={{ overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() =>
                              openImages(
                                roomProfile.images.map((url: string, idx: number) => ({
                                  url,
                                  title: `${roomProfile.description?.[currentLocale] || `Room ${index + 1}`} - Image ${idx + 1}`,
                                  description: style.name[currentLocale],
                                })),
                                imgIndex
                              )
                            }
                          >
                            <Box
                              style={{
                                aspectRatio: '1',
                                overflow: 'hidden',
                                borderRadius: 'var(--mantine-radius-sm)',
                                transition: 'transform 0.2s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                              <Image
                                src={imageUrl}
                                alt={`${roomProfile.description?.[currentLocale] || `Room ${index + 1}`} - Image ${imgIndex + 1}`}
                                fit="cover"
                                style={{ width: '100%', height: '100%' }}
                              />
                            </Box>
                          </Paper>
                        ))}
                      </SimpleGrid>
                    </>
                  )}

                  {/* Color Palette */}
                  {roomProfile.colorPalette && (
                    <>
                      <Divider />
                      <div>
                        <Text fw={600} mb="xs">
                          Color Palette
                        </Text>
                        {roomProfile.colorPalette.description?.[currentLocale] && (
                          <Text size="sm" c="dimmed" mb="sm">
                            {roomProfile.colorPalette.description[currentLocale]}
                          </Text>
                        )}
                        <Group gap="xs">
                          {roomProfile.colorPalette.primaryId && (
                            <Badge variant="filled">Primary Color</Badge>
                          )}
                          {roomProfile.colorPalette.secondaryIds?.map((colorId: string, idx: number) => (
                            <Badge key={idx} variant="light">
                              Secondary {idx + 1}
                            </Badge>
                          ))}
                          {roomProfile.colorPalette.accentIds?.map((colorId: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              Accent {idx + 1}
                            </Badge>
                          ))}
                        </Group>
                      </div>
                    </>
                  )}

                  {/* Materials */}
                  {roomProfile.materials && roomProfile.materials.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <Text fw={600} mb="xs">
                          Materials
                        </Text>
                        <Stack gap="xs">
                          {roomProfile.materials.map((material: any, matIdx: number) => (
                            <Group key={matIdx} justify="space-between">
                              <Text size="sm">
                                {material.application?.[currentLocale] || `Material ${matIdx + 1}`}
                              </Text>
                              {material.finish && (
                                <Badge size="sm" variant="light">
                                  {material.finish}
                                </Badge>
                              )}
                            </Group>
                          ))}
                        </Stack>
                      </div>
                    </>
                  )}

                  {/* Design Tips */}
                  {roomProfile.designTips && roomProfile.designTips.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <Text fw={600} mb="xs">
                          Design Tips
                        </Text>
                        <Stack gap="xs">
                          {roomProfile.designTips.map((tip: any, tipIdx: number) => (
                            <Text key={tipIdx} size="sm">
                              • {tip.tip?.[currentLocale] || tip}
                            </Text>
                          ))}
                        </Stack>
                      </div>
                    </>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
            </Stack>
          </Tabs.Panel>

          {/* Rooms Tab */}
          <Tabs.Panel value="rooms" pt="xl">
            <Stack gap="md">
              {/* Room Type Filter */}
              {roomTypeOptions.length > 0 && (
                <Group justify="space-between" align="center">
                  <Text fw={500}>{locale === 'he' ? 'סנן לפי סוג חדר' : 'Filter by room type'}</Text>
                  <Select
                    placeholder={locale === 'he' ? 'כל החדרים' : 'All rooms'}
                    data={roomTypeOptions}
                    value={selectedRoomType}
                    onChange={setSelectedRoomType}
                    clearable
                    style={{ width: 250 }}
                  />
                </Group>
              )}

              {/* Room Images Grid */}
              {filteredRoomImages.length > 0 ? (
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                  {filteredRoomImages.map((image, index) => (
                    <Paper
                      key={image.id}
                      p="xs"
                      withBorder
                      radius="md"
                      style={{ overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() =>
                        openImages(
                          filteredRoomImages.map((img) => ({
                            url: img.url,
                            title: img.roomType || style.name[currentLocale],
                            description: img.description || '',
                          })),
                          index
                        )
                      }
                    >
                      <Box
                        style={{
                          aspectRatio: '1',
                          overflow: 'hidden',
                          borderRadius: 'var(--mantine-radius-sm)',
                          transition: 'transform 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <Image
                          src={image.url}
                          alt={image.roomType || 'Room image'}
                          fit="cover"
                          style={{ width: '100%', height: '100%' }}
                        />
                      </Box>
                      {image.roomType && (
                        <Text size="xs" mt="xs" fw={500} ta="center">
                          {image.roomType}
                        </Text>
                      )}
                    </Paper>
                  ))}
                </SimpleGrid>
              ) : (
                <Paper p="xl" withBorder style={{ borderStyle: 'dashed' }}>
                  <Stack align="center" gap="sm">
                    <IconDoor size={48} color="#ccc" />
                    <Text size="sm" c="dimmed" ta="center">
                      {locale === 'he' ? 'אין תמונות חדרים זמינות' : 'No room images available'}
                    </Text>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Materials & Textures Tab */}
          <Tabs.Panel value="materials" pt="xl">
            <Grid gutter="lg">
              {/* Materials Column - Entity Data */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="md" withBorder>
                  <Group gap="xs" mb="md">
                    <IconPhoto size={20} color="#df2538" />
                    <Text fw={600}>{locale === 'he' ? 'חומרים' : 'Materials'}</Text>
                    <Badge size="sm" variant="light">
                      {materials.length}
                    </Badge>
                  </Group>

                  {materials.length > 0 ? (
                    <Stack gap="md">
                      {materials.map((material) => (
                        <Paper
                          key={material.id}
                          p="md"
                          withBorder
                          radius="md"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            const imageUrl = material.assets?.thumbnail || material.assets?.images?.[0]
                            if (imageUrl) {
                              openImages([{
                                url: imageUrl,
                                title: locale === 'he' ? material.name.he : material.name.en,
                                description: locale === 'he' ? material.category?.name?.he : material.category?.name?.en,
                              }], 0)
                            }
                          }}
                        >
                          {/* Material Image */}
                          {(material.assets?.thumbnail || material.assets?.images?.[0]) && (
                            <Box
                              style={{
                                width: '100%',
                                height: 200,
                                overflow: 'hidden',
                                borderRadius: 'var(--mantine-radius-md)',
                                marginBottom: '0.5rem',
                              }}
                            >
                              <Image
                                src={material.assets?.thumbnail || material.assets?.images?.[0]}
                                alt={locale === 'he' ? material.name.he : material.name.en}
                                fit="cover"
                                style={{ width: '100%', height: '100%' }}
                              />
                            </Box>
                          )}

                          {/* Material Name */}
                          <Text size="sm" fw={500}>
                            {locale === 'he' ? material.name.he : material.name.en}
                          </Text>

                          {/* Material Badges */}
                          <Group gap="xs" mt="xs" wrap="wrap">
                            {/* Category Badge */}
                            {material.category && (
                              <Badge size="xs" variant="light" color="blue">
                                {locale === 'he' ? material.category.name?.he : material.category.name?.en}
                              </Badge>
                            )}

                            {/* SKU Badge (if not abstract) */}
                            {material.sku && !material.isAbstract && (
                              <Badge size="xs" variant="light" color="gray">
                                SKU: {material.sku}
                              </Badge>
                            )}

                            {/* AI Generated Badge */}
                            {material.isAbstract && (
                              <Badge size="xs" variant="filled" color="grape" leftSection={<IconSparkles size={10} />}>
                                {locale === 'he' ? 'נוצר ע"י AI' : 'AI Generated'}
                              </Badge>
                            )}

                            {/* Linked Texture Indicator */}
                            {material.texture && (
                              <Badge size="xs" variant="outline" color="teal" leftSection={<IconTexture size={10} />}>
                                {locale === 'he' ? 'מקושר למרקם' : 'Has Texture'}
                              </Badge>
                            )}

                            {/* Usage Count */}
                            {material.usageCount > 1 && (
                              <Badge size="xs" variant="light" color="orange">
                                {locale === 'he'
                                  ? `משמש ב-${material.usageCount} סגנונות`
                                  : `Used in ${material.usageCount} styles`}
                              </Badge>
                            )}
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  ) : materialImages.length > 0 ? (
                    // Fallback to material images if no entities
                    <Stack gap="md">
                      {materialImages.map((image, index) => (
                        <Paper
                          key={image.id}
                          p="md"
                          withBorder
                          radius="md"
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            openImages(
                              materialImages.map((img) => ({
                                url: img.url,
                                title: img.description || (locale === 'he' ? 'חומר' : 'Material'),
                                description: style.name[currentLocale],
                              })),
                              index
                            )
                          }
                        >
                          <Box
                            style={{
                              width: '100%',
                              height: 200,
                              overflow: 'hidden',
                              borderRadius: 'var(--mantine-radius-md)',
                              marginBottom: '0.5rem',
                            }}
                          >
                            <Image
                              src={image.url}
                              alt={image.description || 'Material'}
                              fit="cover"
                              style={{ width: '100%', height: '100%' }}
                            />
                          </Box>
                          {image.description && (
                            <Text size="sm" fw={500}>
                              {image.description}
                            </Text>
                          )}
                          {image.tags && image.tags.length > 0 && (
                            <Group gap="xs" mt="xs">
                              {image.tags.map((tag, idx) => (
                                <Badge key={idx} size="xs" variant="light">
                                  {tag}
                                </Badge>
                              ))}
                            </Group>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Paper p="xl" withBorder style={{ borderStyle: 'dashed' }}>
                      <Stack align="center" gap="sm">
                        <IconPhoto size={48} color="#ccc" />
                        <Text size="sm" c="dimmed" ta="center">
                          {locale === 'he' ? 'אין חומרים' : 'No materials'}
                        </Text>
                      </Stack>
                    </Paper>
                  )}
                </Paper>
              </Grid.Col>

              {/* Textures Column */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="md" withBorder>
                  <Group gap="xs" mb="md">
                    <IconTexture size={20} color="#df2538" />
                    <Text fw={600}>{locale === 'he' ? 'מרקמים' : 'Textures'}</Text>
                    <Badge size="sm" variant="light">
                      {textures.length}
                    </Badge>
                  </Group>

                  {textures.length > 0 ? (
                    <Stack gap="md">
                      {textures.map((texture) => (
                        <Paper
                          key={texture.id}
                          p="md"
                          withBorder
                          radius="md"
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            openImages([{
                              url: texture.imageUrl,
                              title: locale === 'he' ? texture.name.he : texture.name.en,
                              description: locale === 'he' ? texture.category.name.he : texture.category.name.en,
                            }], 0)
                          }
                        >
                          <Box
                            style={{
                              width: '100%',
                              height: 200,
                              overflow: 'hidden',
                              borderRadius: 'var(--mantine-radius-md)',
                              marginBottom: '0.5rem',
                            }}
                          >
                            <Image
                              src={texture.imageUrl}
                              alt={locale === 'he' ? texture.name.he : texture.name.en}
                              fit="cover"
                              style={{ width: '100%', height: '100%' }}
                            />
                          </Box>
                          <Text size="sm" fw={500}>
                            {locale === 'he' ? texture.name.he : texture.name.en}
                          </Text>
                          <Group gap="xs" mt="xs" wrap="wrap">
                            <Badge size="xs" variant="light" color="blue">
                              {locale === 'he' ? texture.category.name.he : texture.category.name.en}
                            </Badge>
                            <Badge size="xs" variant="light" color="teal">
                              {locale === 'he' ? texture.type.name.he : texture.type.name.en}
                            </Badge>
                            {texture.usageCount > 1 && (
                              <Badge size="xs" variant="light" color="grape">
                                {locale === 'he'
                                  ? `משמש ב-${texture.usageCount} סגנונות`
                                  : `Used in ${texture.usageCount} styles`}
                              </Badge>
                            )}
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Paper p="xl" withBorder style={{ borderStyle: 'dashed' }}>
                      <Stack align="center" gap="sm">
                        <IconTexture size={48} color="#ccc" />
                        <Text size="sm" c="dimmed" ta="center">
                          {locale === 'he' ? 'אין מרקמים' : 'No textures'}
                        </Text>
                      </Stack>
                    </Paper>
                  )}
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* All Images Tab */}
          <Tabs.Panel value="images" pt="xl">
            {style.images && style.images.length > 0 ? (
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                {style.images.map((image, index) => (
                  <Paper
                    key={index}
                    p="xs"
                    withBorder
                    radius="md"
                    style={{ overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() =>
                      openImages(
                        style.images.map((url, idx) => ({
                          url,
                          title: `${style.name[currentLocale]} - תמונה ${idx + 1}`,
                          description: style.approach?.name?.[currentLocale] || '',
                        })),
                        index
                      )
                    }
                  >
                    <Box
                      style={{
                        aspectRatio: '1',
                        overflow: 'hidden',
                        borderRadius: 'var(--mantine-radius-sm)',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <Image
                        src={image}
                        alt={`${style.name[currentLocale]} - Image ${index + 1}`}
                        fit="cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Box>
                  </Paper>
                ))}
              </SimpleGrid>
            ) : (
              <Paper p="xl" withBorder style={{ borderStyle: 'dashed' }}>
                <Stack align="center" gap="sm">
                  <IconPhoto size={48} color="#ccc" />
                  <Text size="sm" c="dimmed" ta="center">
                    {locale === 'he' ? 'אין תמונות זמינות' : 'No images available'}
                  </Text>
                </Stack>
              </Paper>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

