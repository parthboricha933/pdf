"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Sparkles,
  Check,
  Filter,
} from "lucide-react";
import {
  SAMPLE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  type TemplateCategory,
  type SampleTemplate,
} from "@/lib/templates";

interface TemplateGalleryProps {
  /** Currently selected template ID */
  selectedId?: string;
  /** Callback when a template is selected */
  onSelectTemplate: (template: SampleTemplate) => void;
  /** Compact mode for converter page (smaller cards) */
  compact?: boolean;
}

export default function TemplateGallery({
  selectedId,
  onSelectTemplate,
  compact = false,
}: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredTemplates = useMemo(
    () => getTemplatesByCategory(activeCategory),
    [activeCategory]
  );

  const categoryColors: Record<string, string> = {
    All: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    Professional: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    Creative: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    Business: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    Education: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    Comic: "bg-red-50 text-red-700 hover:bg-red-100",
    Personal: "bg-pink-50 text-pink-700 hover:bg-pink-100",
  };

  const activeCategoryColors: Record<string, string> = {
    All: "bg-gray-700 text-white",
    Professional: "bg-blue-600 text-white",
    Creative: "bg-purple-600 text-white",
    Business: "bg-emerald-600 text-white",
    Education: "bg-amber-600 text-white",
    Comic: "bg-red-600 text-white",
    Personal: "bg-pink-600 text-white",
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className={compact ? "text-xl font-bold text-gray-900" : "text-2xl md:text-3xl font-bold text-gray-900"}>
              Sample Templates
            </h2>
          </div>
          <p className="text-gray-500 text-sm">
            {compact
              ? "Pick a template to get started quickly"
              : "Browse 15 professionally designed templates. Click any to preview and use it."}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400">{filteredTemplates.length} templates</span>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat
                ? activeCategoryColors[cat]
                : categoryColors[cat]
            }`}
          >
            {cat}
            {cat !== "All" && (
              <span className="ml-1 opacity-60">
                {SAMPLE_TEMPLATES.filter((t) => t.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div
        className={`grid gap-4 ${
          compact
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedId === template.id}
            isHovered={hoveredId === template.id}
            compact={compact}
            onHover={setHoveredId}
            onSelect={onSelectTemplate}
          />
        ))}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: SampleTemplate;
  isSelected: boolean;
  isHovered: boolean;
  compact: boolean;
  onHover: (id: string | null) => void;
  onSelect: (template: SampleTemplate) => void;
}

function TemplateCard({
  template,
  isSelected,
  isHovered,
  compact,
  onHover,
  onSelect,
}: TemplateCardProps) {
  return (
    <div
      onMouseEnter={() => onHover(template.id)}
      onMouseLeave={() => onHover(null)}
      className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden cursor-pointer ${
        isSelected
          ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
          : isHovered
          ? "border-primary/40 shadow-md -translate-y-1"
          : "border-gray-100 hover:border-gray-200"
      } ${compact ? "bg-white" : "bg-white"}`}
    >
      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-20 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Template Preview Thumbnail */}
      <div
        className={`relative overflow-hidden ${
          compact ? "h-28" : "h-44"
        }`}
        style={{ backgroundColor: template.pageColor }}
      >
        <TemplatePreview template={template} compact={compact} />

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isHovered && !isSelected ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            size="sm"
            className="gap-1.5 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
          >
            <FileText className="h-3.5 w-3.5" />
            Use Template
          </Button>
        </div>
      </div>

      {/* Card Info */}
      <div className={`${compact ? "p-2.5" : "p-4"}`}>
        <div className="flex items-center gap-2 mb-1">
          <h3
            className={`font-semibold text-gray-900 truncate ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {template.name}
          </h3>
        </div>
        {!compact && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-2">
            {template.description}
          </p>
        )}
        <div className="flex items-center gap-1.5">
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-4 ${getCategoryBadgeClass(template.category)}`}
          >
            {template.category}
          </Badge>
          <span className="text-[10px] text-gray-300">{template.font}</span>
        </div>
      </div>

      {/* Click handler for the whole card */}
      <button
        className="absolute inset-0 z-10 w-full h-full"
        onClick={() => onSelect(template)}
        aria-label={`Use ${template.name} template`}
      />
    </div>
  );
}

function getCategoryBadgeClass(category: string): string {
  const map: Record<string, string> = {
    Professional: "bg-blue-50 text-blue-600",
    Creative: "bg-purple-50 text-purple-600",
    Business: "bg-emerald-50 text-emerald-600",
    Education: "bg-amber-50 text-amber-600",
    Comic: "bg-red-50 text-red-600",
    Personal: "bg-pink-50 text-pink-600",
  };
  return map[category] || "bg-gray-50 text-gray-600";
}

/**
 * CSS-based mini PDF preview that visually represents each template.
 * Shows a miniature document with the template's actual colors, font, and layout.
 */
function TemplatePreview({
  template,
  compact,
}: {
  template: SampleTemplate;
  compact: boolean;
}) {
  const { preview, pageColor, textColor, headingColor, accentColor } = template;

  const miniLine = (width: string, color: string, bold = false) => (
    <div
      style={{
        width,
        height: compact ? 2 : 3,
        backgroundColor: color,
        borderRadius: 1,
        opacity: bold ? 1 : 0.6,
      }}
    />
  );

  const accentBar = (height: number) => (
    <div
      style={{
        width: "100%",
        height,
        backgroundColor: accentColor,
      }}
    />
  );

  return (
    <div className="w-full h-full p-3 relative">
      {/* Background patterns */}
      {preview.backgroundPattern === "lines" && (
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${accentColor} 0px, ${accentColor} 1px, transparent 1px, transparent ${compact ? 8 : 12}px)`,
        }} />
      )}
      {preview.backgroundPattern === "dots" && (
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle, ${accentColor} 1px, transparent 1px)`,
          backgroundSize: compact ? "6px 6px" : "10px 10px",
        }} />
      )}
      {preview.backgroundPattern === "grid" && (
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
          backgroundSize: compact ? "10px 10px" : "16px 16px",
        }} />
      )}
      {preview.backgroundPattern === "halftone" && (
        <div className="absolute inset-0 opacity-8" style={{
          backgroundImage: `radial-gradient(circle, ${accentColor} 0.5px, transparent 0.5px)`,
          backgroundSize: compact ? "4px 4px" : "6px 6px",
        }} />
      )}

      {/* Certificate border */}
      {preview.headerStyle === "certificate" && (
        <div
          className="absolute inset-2 rounded-sm border-2"
          style={{ borderColor: preview.borderColor || accentColor, borderStyle: "double" }}
        />
      )}

      {/* Storybook wavy top */}
      {preview.headerStyle === "storybook" && (
        <div className="absolute top-0 left-0 right-0 h-4" style={{
          background: `linear-gradient(135deg, ${accentColor}, ${headingColor})`,
          clipPath: "ellipse(55% 100% at 50% 0%)",
        }} />
      )}

      {/* Comic-style burst */}
      {preview.headerStyle === "comic" && (
        <div className="absolute top-2 right-2">
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: compact ? 20 : 32,
              height: compact ? 20 : 32,
              backgroundColor: headingColor,
            }}
          >
            <span style={{ color: "#FFD700", fontSize: compact ? 8 : 12, fontWeight: 900 }}>
              POW
            </span>
          </div>
        </div>
      )}

      {/* Sidebar layout */}
      {preview.showSidebar && (
        <div className="flex h-full gap-2 relative">
          <div
            className="w-1/4 rounded-sm flex-shrink-0"
            style={{ backgroundColor: preview.sidebarColor || accentColor }}
          >
            <div className="p-1 space-y-1">
              <div className="w-3 h-3 rounded-full bg-white/30 mx-auto" />
              {compact ? (
                <>
                  <div className="h-1 bg-white/20 rounded mx-0.5" />
                  <div className="h-1 bg-white/20 rounded mx-0.5 w-2/3" />
                  <div className="h-1 bg-white/20 rounded mx-0.5" />
                </>
              ) : (
                <>
                  <div className="h-1.5 bg-white/20 rounded mx-1" />
                  <div className="h-1.5 bg-white/20 rounded mx-1 w-2/3" />
                  <div className="h-1.5 bg-white/20 rounded mx-1" />
                  <div className="h-1.5 bg-white/20 rounded mx-1 w-4/5" />
                </>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-1 pt-1">
            {miniLine("70%", headingColor, true)}
            {miniLine("45%", headingColor, true)}
            <div className="h-1" />
            {miniLine("90%", textColor)}
            {miniLine("80%", textColor)}
            {miniLine("85%", textColor)}
            {!compact && miniLine("60%", textColor)}
          </div>
        </div>
      )}

      {/* Non-sidebar layouts */}
      {!preview.showSidebar && (
        <div className="space-y-1.5 relative pt-1">
          {/* Header decoration */}
          {preview.headerStyle === "bar" && accentBar(compact ? 3 : 5)}
          {preview.headerStyle === "accent-bar" && (
            <div className="flex gap-1">
              <div
                style={{
                  width: compact ? 3 : 5,
                  height: compact ? 16 : 24,
                  backgroundColor: accentColor,
                  borderRadius: 1,
                }}
              />
              <div className="space-y-1 flex-1">
                {miniLine("60%", headingColor, true)}
                {miniLine("35%", headingColor, true)}
              </div>
            </div>
          )}
          {preview.headerStyle === "line" && (
            <>
              {miniLine("50%", headingColor, true)}
              <div style={{ height: 1, backgroundColor: accentColor, opacity: 0.5 }} />
            </>
          )}
          {preview.headerStyle === "double-line" && (
            <>
              {miniLine("50%", headingColor, true)}
              <div style={{ height: 2, backgroundColor: accentColor }} />
              <div style={{ height: 0.5, backgroundColor: accentColor, opacity: 0.5, marginTop: 1 }} />
            </>
          )}
          {preview.headerStyle === "none" && (
            <>
              {miniLine("55%", headingColor, true)}
              {miniLine("30%", headingColor, true)}
            </>
          )}
          {preview.headerStyle === "comic" && (
            <>
              {miniLine("70%", headingColor, true)}
              <div style={{ height: 1.5, backgroundColor: headingColor, borderRadius: 1 }} />
            </>
          )}
          {preview.headerStyle === "certificate" && (
            <div className="text-center space-y-1 pt-2">
              {miniLine("50%", headingColor, true)}
              <div className="flex justify-center">{miniLine("30%", accentColor)}</div>
            </div>
          )}
          {preview.headerStyle === "storybook" && (
            <>
              <div className="pt-3">
                {miniLine("55%", headingColor, true)}
              </div>
            </>
          )}

          {/* Body content lines */}
          <div className="space-y-1 mt-1">
            {preview.headerStyle === "accent-bar" ? null : (
              <>
                {miniLine("90%", textColor)}
                {miniLine("75%", textColor)}
                {miniLine("85%", textColor)}
                {!compact && miniLine("60%", textColor)}
                {!compact && <div className="h-1" />}
                {!compact && miniLine("45%", headingColor, true)}
                {!compact && miniLine("80%", textColor)}
                {!compact && miniLine("70%", textColor)}
              </>
            )}
            {preview.headerStyle === "accent-bar" && (
              <>
                {miniLine("90%", textColor)}
                {miniLine("75%", textColor)}
                {miniLine("85%", textColor)}
                {miniLine("60%", textColor)}
                {!compact && <div className="h-1" />}
                {!compact && miniLine("45%", headingColor, true)}
                {!compact && miniLine("80%", textColor)}
                {!compact && miniLine("70%", textColor)}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
