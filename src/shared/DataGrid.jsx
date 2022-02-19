import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { LocaleText } from './DataGridLocaleText';

// const rows = [
//   { id: 1, col1: 'Hello', col2: 'World' },
//   { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
//   { id: 3, col1: 'Material-UI', col2: 'is Amazing' },
// ];

// const columns = [
//   { field: 'col1', headerName: 'Column 1', width: 150 },
//   { field: 'col2', headerName: 'Column 2', width: 150 },
// ];


/**
 * Returns a dtaa grid with columns and rows
 * @param {rows, columns, rowHeight, onRowClick, disableColmunFilter, disableColumnMenu, disableColumnSelector, disableExtendRowFullWidth, disableSelectionOnClick,} props Props for the DataGrid
 * @returns A data grid.
 */
export default function CrudTable({ 
    rows, 
    columns, 
    rowHeight, 
    onRowClick, 
    disableColmunFilter, 
    disableColumnMenu, 
    disableColumnSelector,
    disableExtendRowFullWidth,
    disableSelectionOnClick,
    hideFooter, 
}) {

    return (
        <div style={{ height: 300, width: '100%' }}>
        <DataGrid 
            rows={rows} 
            columns={columns} 
            rowHeight={rowHeight} 
            onRowClick={onRowClick} 
            disableColumnFilter={disableColmunFilter}
            disableColumnMenu={disableColumnMenu}
            disableColumnSelector={disableColumnSelector}
            disableExtendRowFullWidth={disableExtendRowFullWidth}
            disableSelectionOnClick={disableSelectionOnClick}
            hideFooter={hideFooter}
            localeText={LocaleText}
            
        />
        </div>
    );
}