import ExcelJS from 'exceljs';

export const createExcelWorkbook = async (data: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');
  
  // Add headers
  worksheet.columns = Object.keys(data[0] || {}).map(key => ({
    header: key,
    key: key
  }));

  // Add rows
  worksheet.addRows(data);

  return workbook;
}; 