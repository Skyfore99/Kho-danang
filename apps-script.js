/**
 * Google Apps Script for Warehouse Mapping WebApp
 * This script handles both the Warehouse Inventory (Kho) and Master Data (Settings).
 * Deploy as a Web App with access 'Anyone'.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Get Inventory Data (Sheet 'Kho')
  const sheetKho = ss.getSheetByName('Kho') || ss.insertSheet('Kho');
  let khoDataArr = sheetKho.getDataRange().getValues();
  let khoHeaders = khoDataArr.length > 0 ? khoDataArr[0] : [];
  
  // Auto-correct headers to the exact 8-column format if they don't match
  if (khoHeaders.length < 8 || khoHeaders[5] !== "Kệ" || khoHeaders[6] !== "Vị Trí") {
    khoHeaders = ["Mã", "Màu", "Nhóm Cỡ", "Đơn", "Tháng", "Kệ", "Vị Trí", "Ngày giờ"];
    sheetKho.getRange(1, 1, 1, 8).setValues([khoHeaders]);
    khoDataArr = sheetKho.getDataRange().getValues(); // Refresh data
  }


  const khoItems = [];
  if (khoDataArr.length > 1) {
    for (let i = 1; i < khoDataArr.length; i++) {
      let item = {};
      khoHeaders.forEach((header, index) => {
        const val = khoDataArr[i][index];
        if (header) {
          const key = header.toString().toLowerCase().replace(/ /g, '_');
          item[key] = val !== undefined ? val : "";
        }
      });

      // Include row index for easier updating
      item.row_index = i + 1;

      // Special handling for old "A-A01" format in the "Kệ" column
      if (item.kệ && item.kệ.toString().includes('-') && (!item.vị_trí || item.vị_trí === "")) {
        const parts = item.kệ.split('-');
        item.kệ = parts[0];
        item.vị_trí = parts[1];
      }
      
      khoItems.push(item);

    }
  }



  // 2. Get Settings Data (Sheet 'Settings')
  const sheetSettings = ss.getSheetByName('Settings') || ss.insertSheet('Settings');
  const settingsDataArr = sheetSettings.getDataRange().getValues();
  const settings = {
    "mã": [],
    "màu": [],
    "đơn": [],
    "nhóm_cỡ": [],
    "vị_trí": []
  };

  if (settingsDataArr.length > 1) {
    for (let i = 1; i < settingsDataArr.length; i++) {
      const type = settingsDataArr[i][0].toString().toLowerCase();
      const value = settingsDataArr[i][1].toString();
      
      if (type === "mã") settings.mã.push(value);
      else if (type === "màu") settings.màu.push(value);
      else if (type === "đơn") settings.đơn.push(value);
      else if (type === "nhóm cỡ") settings.nhóm_cỡ.push(value); // Note: frontend uses nhóm_cỡ
      else if (type === "vị trí") settings.vị_trí.push(value);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ 
    kho: khoItems, 
    settings: settings 
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid JSON" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const action = data.action;

  // --- ACTION: SUBMIT NEW INVENTORY ENTRY (Auto-detect or explicit 'addKho') ---
  if (!action || action === "addKho") {
    const sheetKho = ss.getSheetByName('Kho') || ss.insertSheet('Kho');

    // Force headers to be correct before appending
    let headers = sheetKho.getRange(1, 1, 1, sheetKho.getLastColumn() || 1).getValues()[0];
    if (headers.length < 8 || headers[5] !== "Kệ" || headers[6] !== "Vị Trí") {
      sheetKho.getRange(1, 1, 1, 8).setValues([["Mã", "Màu", "Nhóm Cỡ", "Đơn", "Tháng", "Kệ", "Vị Trí", "Ngày giờ"]]);
    }
    
    // Split "A-A01" into "A" and "A01"
    const locParts = (data.vị_trí || "").split('-');
    const ke = locParts.length > 1 ? locParts[0] : "";
    const vitri = locParts.length > 1 ? locParts[1] : (data.vị_trí || "");

    sheetKho.appendRow([
      "'" + (data.mã || ""), 
      "'" + (data.màu || ""), 
      data.nhóm_cỡ || "",
      data.đơn || "", 
      data.tháng || "",
      "'" + ke,
      "'" + vitri, 
      new Date()
    ]);


    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "updateKho") {
    const sheetKho = ss.getSheetByName('Kho') || ss.insertSheet('Kho');
    const rowIndex = parseInt(data.row_index);
    
    if (isNaN(rowIndex) || rowIndex < 2) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid row index" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Split "A-A01" into "A" and "A01"
    const locParts = (data.vị_trí || "").split('-');
    const ke = locParts.length > 1 ? locParts[0] : (data.kệ || "");
    const vitri = locParts.length > 1 ? locParts[1] : (data.vị_trí || "");

    const newRow = [
      "'" + (data.mã || ""), 
      "'" + (data.màu || ""), 
      data.nhóm_cỡ || "",
      data.đơn || "", 
      data.tháng || "",
      "'" + ke,
      "'" + vitri, 
      new Date() // Update timestamp
    ];

    sheetKho.getRange(rowIndex, 1, 1, 8).setValues([newRow]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // --- ACTION: SETTINGS MANAGEMENT ---
  const sheetSettings = ss.getSheetByName('Settings') || ss.insertSheet('Settings');
  if (sheetSettings.getLastRow() === 0) {
    sheetSettings.appendRow(["Loại", "Giá Trị", "Ngày Cập Nhật"]);
  }

  if (action === "addSetting") {
    // Force text format for all settings to preserve leading zeros
    sheetSettings.appendRow([data.type, "'" + data.value, new Date()]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteSetting") {
    const rows = sheetSettings.getDataRange().getValues();
    for (let i = rows.length - 1; i >= 1; i--) {
      // Check both type and value
      if (rows[i][0].toString().toLowerCase() === data.type.toLowerCase() && 
          rows[i][1].toString() === data.value.toString()) {
        sheetSettings.deleteRow(i + 1);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}
