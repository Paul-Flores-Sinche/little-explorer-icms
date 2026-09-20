import { Check, ImageIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobilePageHeader } from "@/components/family/mobile-page-header";
import {
  attendanceWeek,
  familyChildren,
  learningPortfolio,
  todayAttendance,
} from "@/data/mock-data";
import { cn } from "@/lib/utils";

const ava = familyChildren[0];

function AttendanceCard() {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
          This week&apos;s attendance
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {attendanceWeek.map((day) => (
            <div key={day.day} className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {day.day}
              </span>
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm",
                  day.status === "present" &&
                    day.today &&
                    "bg-primary text-primary-foreground",
                  day.status === "present" &&
                    !day.today &&
                    "bg-success text-success-foreground",
                  day.status === "none" && "bg-muted text-muted-foreground",
                )}
              >
                {day.status === "present" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  "–"
                )}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-2 p-5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Checked in</span>
          <span className="font-semibold text-foreground">
            {todayAttendance.checkedIn}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Checked out</span>
          <span className="font-semibold text-foreground">
            {todayAttendance.checkedOut ?? "–"}
          </span>
        </div>
      </Card>
    </div>
  );
}

function PortfolioList() {
  return (
    <div>
      <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
        Recent observations
      </h2>
      <div className="space-y-4">
        {learningPortfolio.map((observation) => (
          <Card
            key={observation.title}
            className="border-l-4 border-l-primary p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold text-foreground">
                {observation.title}
              </h3>
              <span className="shrink-0 text-sm text-muted-foreground">
                {observation.date}
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground">{observation.note}</p>
            {observation.hasImage && (
              <div className="mt-4 flex h-32 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <ImageIcon className="h-7 w-7" />
              </div>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              {observation.author} · {observation.tag}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function MyChildPage() {
  return (
    <>
      <MobilePageHeader
        title={ava.name}
        subtitle={`Room: ${ava.room}`}
        backHref="/family"
      />

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 hidden items-center justify-between md:flex">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              {ava.name}
            </h1>
            <p className="text-muted-foreground">Room: {ava.room}</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
            <span className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground">
              Attendance
            </span>
            <span className="rounded-lg bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
              Learning Portfolio
            </span>
          </div>
        </div>

        <div className="md:hidden">
          <Tabs defaultValue="attendance">
            <TabsList className="w-full">
              <TabsTrigger value="attendance" className="flex-1">
                Attendance
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex-1">
                Learning Portfolio
              </TabsTrigger>
            </TabsList>
            <TabsContent value="attendance">
              <AttendanceCard />
            </TabsContent>
            <TabsContent value="portfolio">
              <PortfolioList />
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden gap-6 md:grid md:grid-cols-2">
          <AttendanceCard />
          <PortfolioList />
        </div>
      </div>
    </>
  );
}
