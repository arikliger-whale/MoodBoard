/**
 * Rich Text Editor Component using Lexical
 * Supports RTL, basic formatting, and integration with react-hook-form
 */

'use client'

import { useEffect, useRef } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { EditorState } from 'lexical'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { $getRoot, $insertNodes } from 'lexical'
import { $createHeadingNode, HeadingNode } from '@lexical/rich-text'
import { $createParagraphNode, ParagraphNode } from 'lexical'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { Box, Tooltip, ActionIcon, Group, Stack } from '@mantine/core'
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconList,
  IconListNumbers,
  IconLink,
  IconH1,
  IconH2,
  IconH3,
} from '@tabler/icons-react'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
} from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { TOGGLE_LINK_COMMAND } from '@lexical/link'

interface RichTextEditorProps {
  value?: string // HTML string
  onChange?: (html: string) => void
  placeholder?: string
  label?: string
  error?: string
  description?: string
  dir?: 'ltr' | 'rtl'
  minHeight?: number
}

const theme = {
  paragraph: 'editor-paragraph',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  link: 'editor-link',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
  },
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      }
    })
  }

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }

  const insertList = (listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
    }
  }

  return (
    <Group gap={4} p="xs" style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
      <Tooltip label="Bold">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => formatText('bold')}
          color="brand"
        >
          <IconBold size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Italic">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => formatText('italic')}
          color="brand"
        >
          <IconItalic size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Underline">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => formatText('underline')}
          color="brand"
        >
          <IconUnderline size={16} />
        </ActionIcon>
      </Tooltip>
      <Box style={{ width: 1, height: 20, backgroundColor: '#e0e0e0' }} />
      <Tooltip label="Heading 1">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => formatHeading('h1')}
          color="brand"
        >
          <IconH1 size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Heading 2">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => formatHeading('h2')}
          color="brand"
        >
          <IconH2 size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Heading 3">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => formatHeading('h3')}
          color="brand"
        >
          <IconH3 size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Paragraph">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={formatParagraph}
          color="brand"
        >
          P
        </ActionIcon>
      </Tooltip>
      <Box style={{ width: 1, height: 20, backgroundColor: '#e0e0e0' }} />
      <Tooltip label="Bullet List">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => insertList('bullet')}
          color="brand"
        >
          <IconList size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Numbered List">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => insertList('number')}
          color="brand"
        >
          <IconListNumbers size={16} />
        </ActionIcon>
      </Tooltip>
      <Box style={{ width: 1, height: 20, backgroundColor: '#e0e0e0' }} />
      <Tooltip label="Insert Link">
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={insertLink}
          color="brand"
        >
          <IconLink size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  )
}

function OnChangePluginWrapper({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext()

  return (
    <OnChangePlugin
      onChange={(editorState: EditorState) => {
        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null)
          onChange(htmlString)
        })
      }}
    />
  )
}

// Plugin to initialize editor from HTML value
function InitialHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current && html) {
      initializedRef.current = true
      editor.update(() => {
        const parser = new DOMParser()
        const dom = parser.parseFromString(html, 'text/html')
        const nodes = $generateNodesFromDOM(editor, dom)
        const root = $getRoot()
        root.clear()
        root.append(...nodes)
      })
    }
  }, [editor, html])

  return null
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder,
  label,
  error,
  description,
  dir = 'ltr',
  minHeight = 200,
}: RichTextEditorProps) {
  const editorConfig = {
    namespace: 'RichTextEditor',
    theme,
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    nodes: [HeadingNode, ParagraphNode, ListNode, ListItemNode, LinkNode],
  }

  return (
    <Stack gap={4}>
      {label && (
        <Box component="label" fw={500} size="sm">
          {label}
        </Box>
      )}
      {description && (
        <Box size="xs" c="dimmed">
          {description}
        </Box>
      )}
      <Box
        style={{
          border: `1px solid ${error ? '#fa5252' : '#ced4da'}`,
          borderRadius: 4,
          backgroundColor: '#fff',
          minHeight,
        }}
      >
        <LexicalComposer initialConfig={editorConfig}>
          <ToolbarPlugin />
          <Box style={{ position: 'relative' }}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  style={{
                    minHeight,
                    padding: '12px',
                    outline: 'none',
                    direction: dir,
                  }}
                />
              }
              placeholder={
                <Box
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: dir === 'rtl' ? 'auto' : 12,
                    right: dir === 'rtl' ? 12 : 'auto',
                    color: '#adb5bd',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {placeholder}
                </Box>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            {value && <InitialHtmlPlugin html={value} />}
            {onChange && <OnChangePluginWrapper onChange={onChange} />}
          </Box>
        </LexicalComposer>
      </Box>
      {error && (
        <Box size="xs" c="red">
          {error}
        </Box>
      )}
    </Stack>
  )
}
