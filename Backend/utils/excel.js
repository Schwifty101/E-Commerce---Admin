const ExcelJS = require('exceljs');

const createExcelWorkbook = async (data) => {
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

module.exports = {
  createExcelWorkbook
};