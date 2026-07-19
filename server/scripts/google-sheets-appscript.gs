/**
 * PetNest — Google Sheets Apps Script
 * ----------------------------------------
 * 1. Create a Google Sheet (or open an existing one).
 * 2. Extensions → Apps Script → paste this entire file.
 * 3. Set WEBHOOK_SECRET below to match GOOGLE_SHEETS_WEBHOOK_SECRET in server/.env
 *    (leave both empty to skip secret checks — OK for local demos only).
 * 4. Deploy → New deployment → Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the Web app URL into server/.env as GOOGLE_SHEETS_WEBHOOK_URL
 * 6. Copy the spreadsheet browser URL into GOOGLE_SHEETS_URL (for admin "Open Sheet")
 *
 * Columns written: ID | Date | Name | Phone | Email | City | State | Address | Pet Name | Category | Message | Status
 */

const SHEET_NAME = 'Enquiries';
const WEBHOOK_SECRET = '12345678'; // optional — must match GOOGLE_SHEETS_WEBHOOK_SECRET

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'ID',
      'Date',
      'Name',
      'Phone',
      'Email',
      'City',
      'State',
      'Address',
      'Pet Name',
      'Category',
      'Message',
      'Status',
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function json_(obj, code) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function assertSecret_(data) {
  if (!WEBHOOK_SECRET) return;
  if (data.secret !== WEBHOOK_SECRET) {
    throw new Error('Unauthorized');
  }
}

function findRowById_(sheet, id) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) return i + 1; // 1-based
  }
  return -1;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    assertSecret_(data);

    const sheet = getSheet_();
    const action = data.action || 'create';

    if (action === 'create') {
      sheet.appendRow([
        data.id || '',
        data.date || new Date().toLocaleString(),
        data.name || '',
        data.phone || '',
        data.email || '',
        data.city || '',
        data.state || '',
        data.address || '',
        data.petName || '',
        data.category || '',
        data.message || '',
        data.status || 'Pending',
      ]);
      return json_({ ok: true, action: 'create' });
    }

    if (action === 'update') {
      const row = findRowById_(sheet, data.id);
      if (row === -1) {
        return json_({ ok: false, error: 'Row not found' });
      }
      sheet.getRange(row, 12).setValue(data.status || 'Pending');
      return json_({ ok: true, action: 'update', row });
    }

    if (action === 'delete') {
      const row = findRowById_(sheet, data.id);
      if (row === -1) {
        return json_({ ok: false, error: 'Row not found' });
      }
      sheet.deleteRow(row);
      return json_({ ok: true, action: 'delete', row });
    }

    return json_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'PetNest Enquiries Sheet' });
}
