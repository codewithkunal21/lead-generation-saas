import type { Lead } from '../types/lead';

/**
 * Escapes a field value for CSV compliance.
 * Wraps values in quotes and escapes internal double quotes by doubling them.
 * Handles null, undefined, commas, quotes, and newlines safely.
 */
const escapeCsvField = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
};

/**
 * Converts array of Lead objects into a CSV string and triggers a browser download.
 * Exports the columns: Business Name, Phone, Email, Website, Address, Rating, Search Query, Created At, Updated At.
 */
export const exportLeadsToCsv = (leads: Lead[]): void => {
  if (!leads || leads.length === 0) return;

  const headers = [
    'Business Name',
    'Phone',
    'Email',
    'Website',
    'Address',
    'Rating',
    'Search Query',
    'Created At',
    'Updated At',
  ];

  const headerRow = headers.map(escapeCsvField).join(',');

  const dataRows = leads.map((lead) => {
    return [
      escapeCsvField(lead.name),
      escapeCsvField(lead.phone || ''),
      escapeCsvField(lead.email || ''),
      escapeCsvField(lead.website || ''),
      escapeCsvField(lead.address || ''),
      escapeCsvField(lead.rating !== undefined && lead.rating !== null ? lead.rating : ''),
      escapeCsvField(lead.query || ''),
      escapeCsvField(lead.created_at ? new Date(lead.created_at).toISOString() : ''),
      escapeCsvField(lead.updated_at ? new Date(lead.updated_at).toISOString() : ''),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  // Generate dynamic filename: leadpulse-leads-YYYY-MM-DD.csv
  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `leadpulse-leads-${todayStr}.csv`;

  // Trigger Blob download in browser
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
