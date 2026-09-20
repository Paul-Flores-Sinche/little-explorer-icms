"use client";

import { useState, type FormEvent } from "react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { PageHeader } from "@/components/staff/page-header";
import { nqfQualityAreas, staffComplianceAlerts } from "@/data/mock-data";

const qaVariant: Record<(typeof nqfQualityAreas)[number]["status"], BadgeProps["variant"]> = {
  Complete: "success",
  "In progress": "warning",
};

const alertVariant: Record<
  (typeof staffComplianceAlerts)[number]["status"],
  BadgeProps["variant"]
> = {
  "Expiring soon": "danger",
  "Renew soon": "warning",
  Current: "success",
};

export default function ComplianceReportingPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <PageHeader title="Compliance & Reporting">
        <Button onClick={() => setMessage("Compliance report generated.")}>
          Generate Report
        </Button>
      </PageHeader>

      <div className="space-y-6 px-8 py-6">
        {message && (
          <FakeSuccessBanner message={message} onDismiss={() => setMessage(null)} />
        )}

        <div className="grid grid-cols-[1fr_360px] gap-6">
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
              NQF quality areas – documentation status
            </h2>
            <div className="divide-y divide-border">
              {nqfQualityAreas.map((qa) => (
                <div key={qa.code} className="flex items-center justify-between py-3">
                  <span className="text-foreground">
                    {qa.code} – {qa.title}
                  </span>
                  <Badge variant={qaVariant[qa.status]}>{qa.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
                Staff compliance alerts
              </h2>
              <div className="space-y-4">
                {staffComplianceAlerts.map((alert) => (
                  <div
                    key={`${alert.staff}-${alert.credential}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {alert.staff} – {alert.credential}
                      </p>
                      <p className="text-sm text-muted-foreground">{alert.detail}</p>
                    </div>
                    <Badge variant={alertVariant[alert.status]}>{alert.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
                Generate operational report
              </h2>
              {submitted ? (
                <FakeSuccessBanner
                  message="Report generated and ready to download."
                  onDismiss={() => setSubmitted(false)}
                />
              ) : (
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Report type
                    </label>
                    <Select defaultValue="Assessment & Rating summary">
                      <option>Assessment &amp; Rating summary</option>
                      <option>Attendance summary</option>
                      <option>CCS reconciliation</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Date range
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input defaultValue="01/07/2026" />
                      <Input defaultValue="31/08/2026" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Generate
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
