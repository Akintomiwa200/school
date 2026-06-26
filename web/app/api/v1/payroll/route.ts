import { jsonData } from "@/lib/api/route-handlers";
import { PAYROLL_RUNS } from "@/components/dashboard/accountant/accountant-data";

export async function GET() {
  return jsonData(PAYROLL_RUNS, "Payroll runs loaded");
}
