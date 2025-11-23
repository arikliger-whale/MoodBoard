/**
 * Edit Texture Page
 */

'use client'

import { TextureForm } from '@/components/features/textures/TextureForm'
import { Container } from '@mantine/core'
import { useParams } from 'next/navigation'

export default function EditTexturePage() {
  const params = useParams()
  const textureId = params.id as string

  return (
    <Container size="lg" py="xl">
      <TextureForm mode="edit" textureId={textureId} />
    </Container>
  )
}
