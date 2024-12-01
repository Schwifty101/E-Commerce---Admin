import { useTable, useSortBy, usePagination, TableInstance, UsePaginationInstanceProps } from 'react-table';

interface TableProps<T extends object> {
  columns: any[];
  data: T[];
  onRowClick?: (row: T) => void;
}

const Table = <T extends object>({ columns, data, onRowClick }: TableProps<T>) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    usePagination
  ) as TableInstance<T> & UsePaginationInstanceProps<T>;

  return (
    <div className="overflow-x-auto">
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerGroups.map(headerGroup => {
            const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
            return (
              <tr key={key} {...headerGroupProps}>
                {headerGroup.headers.map(column => {
                  const { key, ...columnProps } = column.getHeaderProps();
                  return (
                    <th
                      key={key}
                      {...columnProps}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.render('Header')}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {page.map(row => {
            prepareRow(row);
            const { key, ...rowProps } = row.getRowProps();
            return (
              <tr
                key={key}
                {...rowProps}
                onClick={() => onRowClick?.(row.original)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                {row.cells.map(cell => {
                  const { key, ...cellProps } = cell.getCellProps();
                  return (
                    <td
                      key={key}
                      {...cellProps}
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;