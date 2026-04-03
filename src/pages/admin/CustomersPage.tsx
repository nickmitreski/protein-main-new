import { useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { colors } from '../../utils/design-system';
import { CURRENCY_SYMBOL } from '../../constants';
import type { Customer } from '../../types';

export function CustomersPage() {
  const [search, setSearch] = useState('');
  const { data: customers = [], isLoading } = useCustomers(search.trim() || undefined);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold uppercase tracking-wider mb-2"
          style={{ color: colors.black }}
        >
          Customers
        </h1>
        <p className="text-sm" style={{ color: colors.gray500 }}>
          Search, segment, and review customer lifetime value.
        </p>
      </div>

      <Card className="mb-6 !p-0">
        <div className="p-6 border-b" style={{ borderColor: colors.lightGrey }}>
          <Input
            label="Search customers"
            placeholder="Email or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm" style={{ color: colors.gray500 }}>
              Loading customers…
            </p>
          ) : (
            <Table<Customer>
              data={customers}
              emptyMessage="No customers found."
              columns={[
                {
                  key: 'name',
                  header: 'Name',
                  render: (c) => (
                    <span className="font-semibold" style={{ color: colors.black }}>
                      {c.first_name} {c.last_name}
                    </span>
                  ),
                },
                {
                  key: 'email',
                  header: 'Email',
                  render: (c) => <span style={{ color: colors.gray700 }}>{c.email}</span>,
                },
                {
                  key: 'orders',
                  header: 'Orders',
                  render: (c) => c.orders_count,
                },
                {
                  key: 'spent',
                  header: 'Total spent',
                  render: (c) => (
                    <span className="font-semibold">
                      {CURRENCY_SYMBOL}
                      {c.total_spent.toFixed(2)}
                    </span>
                  ),
                },
                {
                  key: 'state',
                  header: 'State',
                  render: (c) => (
                    <Badge variant={c.state === 'enabled' ? 'success' : 'danger'}>{c.state}</Badge>
                  ),
                },
              ]}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
