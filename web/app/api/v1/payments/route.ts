import { jsonData } from "@/lib/api/route-handlers";
import { getLedgerPayments } from "@/components/dashboard/accountant/accountant-data";

export async function GET() {
  return jsonData(getLedgerPayments(), "Payments loaded");
}
