/**
 * Create New Texture Page
 */

'use client'

import { TextureForm } from '@/components/features/textures/TextureForm'
import { Container } from '@mantine/core'

export default function NewTexturePage() {
  return (
    <Container size="lg" py="xl">
      <TextureForm mode="create" />
    </Container>
  )
}
