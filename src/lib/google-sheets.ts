import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// These should be set in Vercel/Environment Variables
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let googleDoc: GoogleSpreadsheet | null = null;

async function getDoc() {
  if (googleDoc) return googleDoc;
  if (!SPREADSHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing credentials");
  }

  const auth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  await doc.loadInfo();
  googleDoc = doc;
  return doc;
}

export async function addEntryToSheet(data: any) {
  if (!SPREADSHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn("Missing Google Sheets credentials. Simulating successful write.");
    return { success: true, mock: true };
  }

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const doc = await getDoc();
      const sheet = doc.sheetsByIndex[0];
      await sheet.addRow({
        "Mã": data.mã,
        "Màu": data.màu,
        "Nhóm Cỡ": data.nhóm_cỡ,
        "Đơn": data.đơn,
        "Tháng": data.tháng || "",
        "Vị Trí": data.vị_trí,
        "Timestamp": new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      if (error.response?.status === 429) {
        attempt++;
        const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries reached");
}

export async function getSheetData() {
  if (!SPREADSHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    return [
      { mã: "SKU-001", màu: "Đỏ", nhóm_cỡ: "Nhóm A", đơn: "Đơn 001", tháng: "Tháng 1", vị_trí: "A01" },
      { mã: "SKU-002", màu: "Xanh", nhóm_cỡ: "Nhóm B", đơn: "Đơn 002", tháng: "Tháng 2", vị_trí: "A01" },
      { mã: "SKU-003", màu: "Vàng", nhóm_cỡ: "Nhóm C", đơn: "Đơn 003", tháng: "Tháng 3", vị_trí: "A01" },
      { mã: "SKU-004", màu: "Đỏ", nhóm_cỡ: "Nhóm A", đơn: "Đơn 001", tháng: "Tháng 1", vị_trí: "A01" },
      { mã: "SKU-005", màu: "Xanh", nhóm_cỡ: "Nhóm B", đơn: "Đơn 002", tháng: "Tháng 2", vị_trí: "A02" },
      { mã: "SKU-006", màu: "Vàng", nhóm_cỡ: "Nhóm C", đơn: "Đơn 003", tháng: "Tháng 3", vị_trí: "A02" },
      { mã: "SKU-007", màu: "Đỏ", nhóm_cỡ: "Nhóm A", đơn: "Đơn 001", tháng: "Tháng 1", vị_trí: "A02" },
      { mã: "SKU-008", màu: "Xanh", nhóm_cỡ: "Nhóm B", đơn: "Đơn 002", tháng: "Tháng 2", vị_trí: "A02" },

      { mã: "SKU-010", màu: "Đỏ", nhóm_cỡ: "Nhóm A", đơn: "Đơn 001", tháng: "Tháng 1", vị_trí: "B01" },
      { mã: "SKU-011", màu: "Xanh", nhóm_cỡ: "Nhóm B", đơn: "Đơn 002", tháng: "Tháng 2", vị_trí: "B01" },
      { mã: "SKU-012", màu: "Vàng", nhóm_cỡ: "Nhóm C", đơn: "Đơn 003", tháng: "Tháng 3", vị_trí: "B01" },
      { mã: "SKU-013", màu: "Đỏ", nhóm_cỡ: "Nhóm A", đơn: "Đơn 001", tháng: "Tháng 1", vị_trí: "B01" },
      { mã: "SKU-101", màu: "Xanh", nhóm_cỡ: "Nhóm B", đơn: "Đơn 002", tháng: "Tháng 2", vị_trí: "B02" },
      { mã: "SKU-102", màu: "Vàng", nhóm_cỡ: "Nhóm C", đơn: "Đơn 003", tháng: "Tháng 3", vị_trí: "B02" },
      { mã: "SKU-103", màu: "Đỏ", nhóm_cỡ: "Nhóm A", đơn: "Đơn 001", tháng: "Tháng 1", vị_trí: "B02" },
      { mã: "SKU-104", màu: "Xanh", nhóm_cỡ: "Nhóm B", đơn: "Đơn 002", tháng: "Tháng 2", vị_trí: "B02" },

      { mã: "SKU-205", màu: "Đỏ", nhóm_cỡ: "Nhóm A", đơn: "Đơn 001", tháng: "Tháng 1", vị_trí: "C01" },
      { mã: "SKU-206", màu: "Xanh", nhóm_cỡ: "Nhóm B", đơn: "Đơn 002", tháng: "Tháng 2", vị_trí: "C01" },
      { mã: "SKU-207", màu: "Vàng", nhóm_cỡ: "Nhóm C", đơn: "Đơn 003", tháng: "Tháng 3", vị_trí: "C01" },
      { mã: "SKU-208", màu: "Đỏ", nhóm_cỡ: "Nhóm A", đơn: "Đơn 001", tháng: "Tháng 1", vị_trí: "C01" },
      { mã: "SKU-209", màu: "Xanh", nhóm_cỡ: "Nhóm B", đơn: "Đơn 002", tháng: "Tháng 2", vị_trí: "C02" },
      { mã: "SKU-210", màu: "Vàng", nhóm_cỡ: "Nhóm C", đơn: "Đơn 003", tháng: "Tháng 3", vị_trí: "C02" },
      { mã: "SKU-211", màu: "Đỏ", nhóm_cỡ: "Nhóm A", đơn: "Đơn 001", tháng: "Tháng 1", vị_trí: "C02" },
      { mã: "SKU-212", màu: "Xanh", nhóm_cỡ: "Nhóm B", đơn: "Đơn 002", tháng: "Tháng 2", vị_trí: "C02" },
    ];
  }
  
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    return rows.map(row => ({
      mã: row.get("Mã"),
      màu: row.get("Màu"),
      nhóm_cỡ: row.get("Nhóm Cỡ"),
      đơn: row.get("Đơn"),
      tháng: row.get("Tháng"),
      vị_trí: row.get("Vị Trí"),
    }));
  } catch (e) {
    console.error("Error fetching sheet data:", e);
    return [];
  }
}
