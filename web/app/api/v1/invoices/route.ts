import { jsonData } from "@/lib/api/route-handlers";
import { SCHOOL_INVOICES } from "@/components/dashboard/accountant/accountant-data";

export async function GET() {
  return jsonData(SCHOOL_INVOICES, "Invoices loaded");
}
