/**
 * Google Apps Script for Warehouse Mapping WebApp
 * This script handles both the Warehouse Inventory (Kho) and Master Data (Settings).
 * Deploy as a Web App with access 'Anyone'.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Get Warehouse Data (Sheet 'Kho')
  const sheetKho = ss.getSheetByName('Kho') || ss.insertSheet('Kho');
  const khoData = sheetKho.getDataRange().getValues();
  const khoHeaders = khoData[0];
  const khoItems = [];
  
  if (khoData.length > 1) {
    for (let i = 1; i < khoData.length; i++) {
      let item = {};
      khoHeaders.forEach((header, index) => {
        item[header.toLowerCase().replace(/ /g, '_')] = khoData[i][index];
      });
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
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  // --- ACTION: SUBMIT NEW INVENTORY ENTRY ---
  if (!action) {
    const sheetKho = ss.getSheetByName('Kho') || ss.insertSheet('Kho');
    if (sheetKho.getLastRow() === 0) {
      sheetKho.appendRow(["Mã", "Màu", "Đơn", "Nhóm Cỡ", "Vị Trí", "Số Lượng", "Ghi Chú", "Thời Gian"]);
    }
    
    sheetKho.appendRow([
      "'" + data.mã, 
      "'" + data.màu, 
      data.đơn, 
      data.nhóm_cỡ, 
      "'" + data.vị_trí, 
      data.số_lượng, 
      data.ghi_chú, 
      new Date()
    ]);
    
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
