import { NextRequest } from "next/server";
import { jsonData } from "@/lib/api/route-handlers";
import { LEAVE_BALANCES } from "@/components/dashboard/leave/leave-data";
import { addLeaveRequest, getMutableLeaveRequests } from "@/lib/api/memory-stores";

export async function GET() {
  return jsonData(
    { balances: LEAVE_BALANCES, requests: getMutableLeaveRequests() },
    "Leave data loaded",
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const created = addLeaveRequest({
    type: body.type,
    from: body.from,
    to: body.to,
    reason: body.reason,
  });
  return jsonData(created, "Leave request submitted", 201);
}
