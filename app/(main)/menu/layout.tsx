import React from "react";
import PageLayout from "@/reusable/PageLayout";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageLayout bgImage="/menu_bgimage.png" bgPosition="bg-top">
      {children}
    </PageLayout>
  );
}
