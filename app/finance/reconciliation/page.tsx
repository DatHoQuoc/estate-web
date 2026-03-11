"use client"

import { useEffect, useState } from "react";
import MonthPicker from "@/components/finance/MonthPicker"
import CrossCheckPanel from "@/components/finance/CrossCheckPanel"
import MonthlyReportCard from "@/components/finance/MonthlyReportCard"
import ReconcileButton from "@/components/finance/ReconcileButton"
import { getReconciliationSummary } from "@/lib/finance-api";

export default function ReconciliationPage() {
    const [month, setMonth] = useState("2026-03");
    const [summary, setSummary] = useState<any>(null);
    const [gateway, setGateway] = useState([]);

    useEffect(() => {
        async function load() {
            const summaryData = await getReconciliationSummary(month)

            setSummary(summaryData)
        }
        load();
    }, [month]);

    return (
        <div className="space-y-6">
            {/* Month Picker */}
            <MonthPicker value={month} onChange={setMonth} />

            {/* summary */}
            {summary && (<MonthlyReportCard summary={summary} />)}

            {/* cross check */}
            {summary && (<CrossCheckPanel summary={summary} />)}

            {/* reconcile button */}
            <ReconcileButton month={month} />
        </div>
    );
}

