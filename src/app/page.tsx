"use client";

import { useState } from "react";
import LandingPage from "@/components/landing-page";
import ConverterPage from "@/components/converter-page";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"landing" | "converter">(
    "landing"
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {currentPage === "landing" ? (
        <LandingPage onNavigate={() => setCurrentPage("converter")} />
      ) : (
        <ConverterPage onNavigate={() => setCurrentPage("landing")} />
      )}
    </div>
  );
}
