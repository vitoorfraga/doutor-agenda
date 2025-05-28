import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { SignOutButton } from "./_components/sign-out-button";

export const metadata: Metadata = {
  title: "Dashboard | Doutor Agenda",
};

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/authentication");
  }

  const clinics = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, session.user.id),
  });

  console.log(clinics);

  if (clinics.length === 0) {
    return redirect("/clinic-form");
  }

  return (
    <>
      <h1>{session?.user.email}</h1>
      <SignOutButton />
    </>
  );
};

export default DashboardPage;
