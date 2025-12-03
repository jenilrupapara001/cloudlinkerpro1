import { ImageUploadStatus } from '../types';

export function exportToCSV(images: ImageUploadStatus[]): void {
  const successfulUploads = images.filter(img => img.status === 'completed' && img.url);

  if (successfulUploads.length === 0) {
    alert('No successful uploads to export');
    return;
  }

  const headers = ['Image Name', 'Image URL'];
  const rows = successfulUploads.map(img => [
    img.name,
    img.url || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `cloudlinkerpro-export-${timestamp}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(images: ImageUploadStatus[]): void {
  const successfulUploads = images.filter(img => img.status === 'completed' && img.url);

  if (successfulUploads.length === 0) {
    alert('No successful uploads to export');
    return;
  }

  const headers = ['Image Name', 'Image URL'];
  const rows = successfulUploads.map(img => [
    img.name,
    img.url || ''
  ]);

  let excelContent = '<table>';
  excelContent += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
  rows.forEach(row => {
    excelContent += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
  });
  excelContent += '</table>';

  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `cloudlinkerpro-export-${timestamp}.xls`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
