import type { DataGridColumn, DataGridRow, LookupOption } from './data-grid.js';

/** Made-up designations: seven-digit codes like DSG types, with invented names. */
const NAMES = [
  'Campus Ministry',
  'Staff Support',
  'Global Aid',
  'Family Life',
  'Athletes Outreach',
  'Jesus Film',
  'City Ministry',
  'Leadership',
  'Military',
  'Inner City',
];
export const designations: LookupOption[] = Array.from({ length: 400 }, (_, index) => ({
  value: String(2000000 + index * 137),
  label: `${NAMES[index % NAMES.length]} ${Math.floor(index / NAMES.length) + 1}`,
}));

export const paymentTypes: LookupOption[] = [
  { value: 'CHK', label: 'Check' },
  { value: 'CSH', label: 'Cash' },
  { value: 'CC', label: 'Credit card' },
  { value: 'EFT', label: 'Bank transfer' },
];

export const columns: DataGridColumn[] = [
  {
    key: 'line',
    label: 'Line',
    type: 'line',
    width: 4,
    rowHeader: true,
    align: 'end',
  },
  { key: 'donor', label: 'Donor ID', width: 7, required: true },
  { key: 'name', label: 'Donor name', width: 11, readonly: true },
  { key: 'amount', label: 'Amount', type: 'number', width: 7, required: true },
  {
    key: 'designation',
    label: 'Designation',
    type: 'lookup',
    width: 15,
    required: true,
    options: designations,
  },
  {
    key: 'payment',
    label: 'Payment',
    type: 'lookup',
    width: 8,
    options: paymentTypes,
  },
  { key: 'check', label: 'Check no.', width: 7 },
  {
    key: 'date',
    label: 'Gift date',
    width: 8,
    validate: (value) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? null : 'Use the date format YYYY-MM-DD.'),
  },
  { key: 'memo', label: 'Memo', width: 14 },
  { key: 'status', label: 'Status', type: 'status', width: 8 },
];

/** `filled` rows carry data; the rest are blank, like a quick-entry batch waiting to be typed. */
export function makeRows(count: number, filled = count): DataGridRow[] {
  return Array.from({ length: count }, (_, index) =>
    index < filled
      ? {
          id: index + 1,
          donor: String(100000 + ((index * 7919) % 900000)),
          name: `Donor ${index + 1}`,
          amount: ((index * 37) % 500) + 10,
          designation: designations[index % designations.length].value,
          payment: paymentTypes[index % paymentTypes.length].value,
          check: index % 4 === 0 ? String(1000 + index) : '',
          date: '2026-11-12',
          memo: '',
        }
      : {
          id: index + 1,
          donor: '',
          name: '',
          amount: '',
          designation: '',
          payment: '',
          check: '',
          date: '',
          memo: '',
        },
  );
}
