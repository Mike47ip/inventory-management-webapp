// src/styles/dataGridStyles.ts
import { SxProps, Theme } from '@mui/material/styles';

export const dataGridStyles: SxProps<Theme> = {
  // Base font for the entire grid
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  
  // Column headers - more prominent
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#f5f5f5',
    fontWeight: 600,
    fontSize: '0.875rem',
    letterSpacing: '0.01em',
    color: '#333333',
    borderBottom: '2px solid #e0e0e0',
  },
  
  // Cell styling
  '& .MuiDataGrid-cell': {
    fontSize: '0.875rem',
    color: '#24292e',
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  
  // Hover state for rows
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  
  // Footer styling
  '& .MuiDataGrid-footerContainer': {
    borderTop: '2px solid #e0e0e0',
    fontWeight: 500,
    fontSize: '0.75rem',
  },
  
  // Pagination controls
  '& .MuiTablePagination-root': {
    fontSize: '0.875rem',
    color: '#555555',
  },
  
  // Toolbar styling
  '& .MuiDataGrid-toolbarContainer': {
    padding: '8px 16px',
    borderBottom: '1px solid #e0e0e0',
    '& button': {
      fontSize: '0.8125rem',
      fontWeight: 500,
    },
  },
  
  // Price column - right aligned and monospaced for numbers
  '& .MuiDataGrid-cell[data-field="price"]': {
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    justifyContent: 'flex-end',
  },
  
  // Stock quantity column - right aligned and monospaced for numbers
  '& .MuiDataGrid-cell[data-field="stockQuantity"]': {
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    justifyContent: 'flex-end',
  },
  
  // ID column - monospaced for better readability of codes
  '& .MuiDataGrid-cell[data-field="productId"]': {
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '0.8125rem',
    color: '#666666',
  },
  
  // Selected row highlighting
  '& .Mui-selected': {
    backgroundColor: 'rgba(25, 118, 210, 0.08) !important',
  },
  
  // Checkbox column
  '& .MuiDataGrid-columnHeader:first-child': {
    padding: '0 12px',
  },
  
  // Remove border effect on focused cell
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
};

// You can also create variants or specialized versions
export const compactDataGridStyles: SxProps<Theme> = {
  ...dataGridStyles,
  '& .MuiDataGrid-cell': {
    ...dataGridStyles['& .MuiDataGrid-cell'] as any,
    padding: '8px 12px',
    fontSize: '0.8125rem',
  },
  '& .MuiDataGrid-columnHeaders': {
    ...dataGridStyles['& .MuiDataGrid-columnHeaders'] as any,
    padding: '8px 12px',
    fontSize: '0.8125rem',
  },
};

export const darkDataGridStyles: SxProps<Theme> = {
  ...dataGridStyles,
  backgroundColor: '#1e1e1e',
  color: '#e0e0e0',
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#2d2d2d',
    color: '#ffffff',
    borderBottom: '2px solid #3d3d3d',
  },
  '& .MuiDataGrid-cell': {
    color: '#e0e0e0',
    borderBottom: '1px solid #3d3d3d',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
};