'use client'

import { Table, TableProps } from '@mantine/core'
import { ReactNode } from 'react'

interface MoodBTableProps extends TableProps {
  children: ReactNode
}

export const MoodBTable = ({ children, ...props }: MoodBTableProps) => {
  return (
    <Table
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders
      {...props}
    >
      {children}
    </Table>
  )
}

// Table sub-components for convenience
export const MoodBTableHead = Table.Thead
export const MoodBTableBody = Table.Tbody
export const MoodBTableRow = Table.Tr
export const MoodBTableHeader = Table.Th
export const MoodBTableCell = Table.Td
