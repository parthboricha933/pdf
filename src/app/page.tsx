"use client";

import { useState, useCallback } from "react";
import LandingPage from "@/components/landing-page";
import ConverterPage from "@/components/converter-page";
import { type SampleTemplate } from "@/lib/templates";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"landing" | "converter">(
    "landing"
  );
  const [pendingTemplate, setPendingTemplate] = useState<SampleTemplate | null>(null);

  const handleSelectTemplateFromLanding = useCallback((template: SampleTemplate) => {
    // Store the template in localStorage for the converter to pick up
    try {
      localStorage.setItem("pdf-converter-settings", JSON.stringify({
        template: template.templateStyle,
        font: template.font,
        pageColor: template.pageColor,
        textColor: template.textColor,
        sampleTemplateId: template.id,
        pageSize: "A4",
        orientation: "portrait",
        email: "",
      }));
      localStorage.setItem("pdf-selected-sample-text", template.sampleText);
    } catch {}
    setPendingTemplate(template);
    setCurrentPage("converter");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {currentPage === "landing" ? (
        <LandingPage
          onNavigate={() => setCurrentPage("converter")}
          onSelectTemplate={handleSelectTemplateFromLanding}
        />
      ) : (
        <ConverterPage onNavigate={() => setCurrentPage("landing")} />
      )}
    </div>
  );
}
