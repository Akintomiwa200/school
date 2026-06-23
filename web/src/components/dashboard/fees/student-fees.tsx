"use client";

import { StudentFeesInvoices } from "./student-fees-invoices";
import { StudentFeesOverview } from "./student-fees-overview";
import { StudentFeesPayments } from "./student-fees-payments";
import { StudentFeesStatement } from "./student-fees-statement";
import { StudentFeesShell } from "./student-fees-shell";

type StudentFeesProps = {
  view: "overview" | "payments" | "invoices" | "statement";
};

export function StudentFees({ view }: StudentFeesProps) {
  return (
    <StudentFeesShell>
      {view === "overview" ? <StudentFeesOverview /> : null}
      {view === "payments" ? <StudentFeesPayments /> : null}
      {view === "invoices" ? <StudentFeesInvoices /> : null}
      {view === "statement" ? <StudentFeesStatement /> : null}
    </StudentFeesShell>
  );
}

export { StudentFeesFeeDetail } from "./student-fees-fee-detail";
export { StudentFeesPaymentDetail } from "./student-fees-payment-detail";
export { StudentFeesInvoiceDetail } from "./student-fees-invoice-detail";
