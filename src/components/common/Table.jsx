import { useTable, useSortBy, usePagination } from 'react-table';

const Table = ({ columns, data, onRowClick }) => {
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
      initialState: {
        sortBy: [
          {
            id: 'createdAt',
            desc: true
          }
        ]
      },
      disableSortRemove: true,
      disableMultiSort: true
    },
    useSortBy,
    usePagination
  );

  return (
    <div className="relative bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {headerGroups.map(headerGroup => {
              const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={key} {...headerGroupProps}>
                  {headerGroup.headers.map(column => {
                    const { key, ...columnProps } = column.getHeaderProps(column.getSortByToggleProps());
                    return (
                      <th
                        key={key}
                        {...columnProps}
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 
                          uppercase tracking-wider cursor-pointer hover:bg-gray-100
                          first:pl-4 last:pr-4 md:first:pl-6 md:last:pr-6 md:px-6"
                      >
                        <div className="flex items-center gap-1">
                          <span className="whitespace-nowrap">{column.render('Header')}</span>
                          <span className="text-gray-400">
                            {column.isSorted && (column.isSortedDesc ? '▼' : '▲')}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
            {page.map(row => {
              prepareRow(row);
              const { key, ...rowProps } = row.getRowProps();
              return (
                <tr
                  key={key}
                  {...rowProps}
                  onClick={() => onRowClick?.(row.original)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {row.cells.map(cell => {
                    const { key, ...cellProps } = cell.getCellProps();
                    return (
                      <td
                        key={key}
                        {...cellProps}
                        className="px-3 py-3 text-sm text-gray-900
                          first:pl-4 last:pr-4 md:first:pl-6 md:last:pr-6 md:px-6
                          whitespace-nowrap"
                      >
                        <div className="flex items-center">
                          {/* Handle product cells with images */}
                          {cell.column.id === 'product' ? (
                            <div className="flex items-center gap-3">
                              <img 
                                src={cell.row.original.image} 
                                alt={cell.value}
                                className="w-8 h-8 rounded-md object-cover"
                              />
                              <span className="font-medium">{cell.value}</span>
                            </div>
                          ) : (
                            <div className="overflow-hidden overflow-ellipsis max-w-[120px] md:max-w-xs">
                              {cell.render('Cell')}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {page.length === 0 && (
          <div className="text-center py-10 text-gray-500 bg-white">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;