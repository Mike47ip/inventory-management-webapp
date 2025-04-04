import { SxProps, Theme } from '@mui/material/styles';

export const dataGridStyles: SxProps<Theme> = {
  // Base font for the entire grid
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

  // Rounded corners and border styling
  borderRadius: '10px',
  border: '1px solid #e0e0e0', // Subtle border
  boxShadow: '-10px 0 15px -5px rgba(0, 0, 0, 0.08), 10px 0 15px -5px rgba(0, 0, 0, 0.08)',

  // Stock quantity styling - green for high stock
  '& .high-stock-cell': {
    '& .MuiDataGrid-cellContent': {
      backgroundColor: 'rgba(46, 204, 113, 0.15)', // Light green background
      color: '#27ae60', // Darker green text
      fontWeight: 600,
      padding: '4px 8px',
      borderRadius: '4px',
      display: 'inline-block',
    }
  },

  // Stock quantity styling - red for low stock
  '& .low-stock-cell': {
    '& .MuiDataGrid-cellContent': {
      backgroundColor: 'rgba(231, 76, 60, 0.15)', // Light red background
      color: '#c0392b', // Darker red text
      fontWeight: 600,
      padding: '4px 8px',
      borderRadius: '4px',
      display: 'inline-block',
    }
  },

  // Column headers - more prominent
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#f5f5f5',
    fontWeight: 600,
    fontSize: '0.875rem',
    letterSpacing: '0.01em',
    color: '#333333',
    borderBottom: '2px solid #e0e0e0',
  },
  
  // Row styling with cursor pointer
  '& .MuiDataGrid-row': {
    cursor: 'pointer',
  },

  // Add zebra stripe style for even rows
  '& .MuiDataGrid-row:nth-of-type(even)': {
    backgroundColor: '#f0f0f0', // Light shade for even rows
  },

  // Cell styling
  '& .MuiDataGrid-cell': {
    fontSize: '0.875rem',
    color: '#24292e',
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    justifyContent: 'center', // Centers the text horizontally
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
    fontWeight: '100',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // Stock quantity column - right aligned and monospaced for numbers
  '& .MuiDataGrid-cell[data-field="stockQuantity"]': {
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // ID column - monospaced for better readability of codes
  '& .MuiDataGrid-cell[data-field="productId"]': {
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '0.8125rem',
    color: '#666666',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  '& .MuiDataGrid-cell[data-field="name"]': {
    display: 'flex',
    justifyContent: 'end',
    alignItems: 'center',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: '600',
    fontSize: '13px' // Increased font size (adjust as needed)
  },

  // Image column - centered with proper spacing
  '& .MuiDataGrid-cell[data-field="image"]': {
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Optional: Add hover effect for images
  '& .MuiDataGrid-cell[data-field="image"] img': {
    transition: 'transform 0.2s ease-in-out',
  },
  '& .MuiDataGrid-cell[data-field="image"] img:hover': {
    transform: 'scale(1.1)',
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
  border: '1px solid #3d3d3d',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
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
  '& .MuiDataGrid-footerContainer': {
    borderTop: '2px solid #3d3d3d',
  },
  '& .high-stock-cell': {
    '& .MuiDataGrid-cellContent': {
      backgroundColor: 'rgba(46, 204, 113, 0.25)', // Slightly more vivid for dark mode
      color: '#2ecc71', // Brighter green text for dark mode
      fontWeight: 600,
      padding: '4px 8px',
      borderRadius: '4px',
      display: 'inline-block',
    }
  },
  '& .low-stock-cell': {
    '& .MuiDataGrid-cellContent': {
      backgroundColor: 'rgba(231, 76, 60, 0.25)', // Slightly more vivid for dark mode
      color: '#e74c3c', // Brighter red text for dark mode
      fontWeight: 600,
      padding: '4px 8px',
      borderRadius: '4px',
      display: 'inline-block',
    }
  },
  '& .MuiDataGrid-row:nth-of-type(even)': {
    backgroundColor: '#282828', // Darker shade for even rows in dark mode
  },
};