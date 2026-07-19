import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportsDir = path.join(__dirname, '..', '..', 'exports');
const filePath = path.join(exportsDir, 'enquiries.xlsx');

const COLUMNS = [
  { header: 'Date', key: 'date', width: 20 },
  { header: 'Name', key: 'name', width: 20 },
  { header: 'Phone', key: 'phone', width: 16 },
  { header: 'Email', key: 'email', width: 25 },
  { header: 'City', key: 'city', width: 15 },
  { header: 'State', key: 'state', width: 15 },
  { header: 'Pet Name', key: 'petName', width: 18 },
  { header: 'Category', key: 'category', width: 15 },
  { header: 'Message', key: 'message', width: 30 },
  { header: 'Status', key: 'status', width: 14 },
];

const ensureExportsDir = () => {
  if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });
};

const getOrCreateWorkbook = async () => {
  ensureExportsDir();
  const workbook = new ExcelJS.Workbook();
  let worksheet;

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
    worksheet = workbook.getWorksheet('Enquiries') || workbook.addWorksheet('Enquiries');
  } else {
    worksheet = workbook.addWorksheet('Enquiries');
  }

  worksheet.columns = COLUMNS;

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6D28D9' },
  };

  return { workbook, worksheet };
};

export const appendEnquiryToExcel = async (enquiry) => {
  try {
    const { workbook, worksheet } = await getOrCreateWorkbook();

    worksheet.addRow({
      date: new Date(enquiry.createdAt || Date.now()).toLocaleString(),
      name: enquiry.name,
      phone: enquiry.phone,
      email: enquiry.email,
      city: enquiry.city,
      state: enquiry.state,
      petName: enquiry.petName,
      category: enquiry.category,
      message: enquiry.message,
      status: enquiry.status,
    });

    ensureExportsDir();
    await workbook.xlsx.writeFile(filePath);
  } catch (error) {
    console.error('Failed to append enquiry to Excel:', error.message);
  }
};

export const generateEnquiriesExcelBuffer = async (enquiries) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Enquiries');
  worksheet.columns = COLUMNS;

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6D28D9' },
  };

  enquiries.forEach((enquiry) => {
    worksheet.addRow({
      date: new Date(enquiry.createdAt).toLocaleString(),
      name: enquiry.name,
      phone: enquiry.phone,
      email: enquiry.email,
      city: enquiry.city,
      state: enquiry.state,
      petName: enquiry.petName,
      category: enquiry.category,
      message: enquiry.message,
      status: enquiry.status,
    });
  });

  return workbook.xlsx.writeBuffer();
};

export const exportFilePath = filePath;
