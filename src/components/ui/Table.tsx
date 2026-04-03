import { ReactNode } from 'react';
import { colors } from '../../utils/design-system';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function Table<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className="text-center py-12 border"
        style={{ borderColor: colors.lightGrey, color: colors.gray500 }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border" style={{ borderColor: colors.lightGrey }}>
      <table className="w-full">
        <thead style={{ backgroundColor: colors.lightGrey }}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.darkGrey, width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className={`border-t ${onRowClick ? 'cursor-pointer hover:bg-[#F9F9F9]' : ''}`}
              style={{ borderColor: colors.lightGrey }}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 text-sm"
                  style={{ color: colors.black }}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
