import { DashboardClient } from "@/components/DashboardClient";
import { PrismaClient } from "@ironwatch/db";

// Force dynamic so Next.js doesn't cache the initial render of the zones if they update
export const dynamic = "force-dynamic";

export default async function Home() {
  const prisma = new PrismaClient();
  
  // Actually query the zones from the database
  const zones = await prisma.zone.findMany();

  return <DashboardClient zones={zones} />;
}
