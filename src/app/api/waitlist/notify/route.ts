import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { validateEmail, sendBetaInvite } from "@/lib/email";

const WAITLIST_FILE = path.join(process.cwd(), ".waitlist.json");

type WaitlistEntry = {
  email: string;
  at: string;
  groupInterest?: boolean;
  notified?: boolean;
  notifiedAt?: string;
};

async function getWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const data = await fs.readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveWaitlist(entries: WaitlistEntry[]): Promise<void> {
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2));
}

export async function POST() {
  try {
    const entries = await getWaitlist();

    if (entries.length === 0) {
      return NextResponse.json({
        sent: 0,
        skipped: 0,
        invalid: 0,
        failed: 0,
        message: "No hay correos en la waitlist",
      });
    }

    const results: Array<{
      email: string;
      status: "sent" | "skipped" | "invalid" | "failed";
      error?: string;
    }> = [];

    for (const entry of entries) {
      if (entry.notified) {
        results.push({ email: entry.email, status: "skipped" });
        continue;
      }

      const valid = await validateEmail(entry.email);
      if (!valid) {
        results.push({ email: entry.email, status: "invalid" });
        continue;
      }

      const result = await sendBetaInvite(entry.email);
      if (result.ok) {
        entry.notified = true;
        entry.notifiedAt = new Date().toISOString();
        results.push({ email: entry.email, status: "sent" });
      } else {
        results.push({
          email: entry.email,
          status: "failed",
          error: result.error,
        });
      }
    }

    await saveWaitlist(entries);

    const summary = {
      sent: results.filter((r) => r.status === "sent").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      invalid: results.filter((r) => r.status === "invalid").length,
      failed: results.filter((r) => r.status === "failed").length,
      details: results,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Notify error:", error);
    return NextResponse.json(
      { error: "Error al enviar notificaciones" },
      { status: 500 }
    );
  }
}
