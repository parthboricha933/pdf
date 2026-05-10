/**
 * 15 Professionally Designed Sample PDF Templates
 *
 * Each template defines visual properties that map to the PDF generation engine.
 * Categories: Professional, Creative, Business, Education, Comic, Personal
 */

export type TemplateCategory =
  | "All"
  | "Professional"
  | "Creative"
  | "Business"
  | "Education"
  | "Comic"
  | "Personal";

export interface SampleTemplate {
  id: string;
  name: string;
  category: Exclude<TemplateCategory, "All">;
  description: string;
  font: string;
  pageColor: string;
  textColor: string;
  headingColor: string;
  accentColor: string;
  /** PDF engine template style key */
  templateStyle: string;
  /** Visual preview configuration */
  preview: {
    headerStyle: "none" | "line" | "bar" | "accent-bar" | "double-line" | "sidebar" | "bordered" | "comic" | "halftone" | "dotted" | "certificate" | "storybook";
    showSidebar?: boolean;
    sidebarColor?: string;
    borderColor?: string;
    backgroundPattern?: "grid" | "lines" | "dots" | "halftone" | "none";
  };
  /** Sample text to populate when template is selected */
  sampleText: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "All",
  "Professional",
  "Creative",
  "Business",
  "Education",
  "Comic",
  "Personal",
];

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: "professional-resume",
    name: "Professional Resume",
    category: "Professional",
    description: "Clean resume layout with sidebar accent and structured sections.",
    font: "Arial",
    pageColor: "#FFFFFF",
    textColor: "#1F2937",
    headingColor: "#1D4ED8",
    accentColor: "#3B82F6",
    templateStyle: "Professional",
    preview: {
      headerStyle: "sidebar",
      showSidebar: true,
      sidebarColor: "#1D4ED8",
      backgroundPattern: "none",
    },
    sampleText: `# John Anderson\nSoftware Engineer\n\n# Experience\nSenior Developer at TechCorp (2020-Present)\nLed a team of 8 engineers building cloud-native applications.\n\n# Education\nB.S. Computer Science, MIT (2016)\n\n# Skills\nJavaScript, TypeScript, React, Node.js, Python, AWS`,
  },
  {
    id: "modern-cv",
    name: "Modern CV",
    category: "Professional",
    description: "Minimal two-column curriculum vitae with clean typography.",
    font: "Helvetica",
    pageColor: "#FAFAFA",
    textColor: "#374151",
    headingColor: "#0F766E",
    accentColor: "#14B8A6",
    templateStyle: "Modern",
    preview: {
      headerStyle: "accent-bar",
      backgroundPattern: "none",
    },
    sampleText: `# Sarah Mitchell\nProduct Designer\n\n# Profile\nCreative product designer with 7+ years of experience crafting user-centric digital experiences for Fortune 500 companies.\n\n# Work History\nLead Designer, DesignCo (2019-Present)\nSenior Designer, PixelStudio (2016-2019)\n\n# Education\nM.A. Interaction Design, RCA London`,
  },
  {
    id: "corporate-report",
    name: "Corporate Report",
    category: "Business",
    description: "Formal report with cover page styling and structured sections.",
    font: "Times New Roman",
    pageColor: "#FFFFFF",
    textColor: "#111827",
    headingColor: "#1E3A5F",
    accentColor: "#2563EB",
    templateStyle: "Report",
    preview: {
      headerStyle: "bar",
      backgroundPattern: "none",
    },
    sampleText: `# Q4 2024 Annual Report\n\n# Executive Summary\nThis quarter saw remarkable growth across all business segments, with revenue increasing 23% year-over-year.\n\n# Financial Highlights\nRevenue: $4.2B (+23% YoY)\nOperating Margin: 18.5%\nCustomer Growth: 2.1M new accounts\n\n# Strategic Initiatives\nExpanded into 5 new markets. Launched AI-powered analytics platform.`,
  },
  {
    id: "business-proposal",
    name: "Business Proposal",
    category: "Business",
    description: "Elegant proposal template with highlighted sections and clear hierarchy.",
    font: "Georgia",
    pageColor: "#FFFBEB",
    textColor: "#1F2937",
    headingColor: "#92400E",
    accentColor: "#D97706",
    templateStyle: "Professional",
    preview: {
      headerStyle: "line",
      backgroundPattern: "none",
    },
    sampleText: `# Business Proposal\nDigital Transformation Strategy\n\n# Objective\nTo modernize legacy systems and improve operational efficiency by 40% through cloud migration and automation.\n\n# Scope of Work\nPhase 1: Infrastructure Assessment (4 weeks)\nPhase 2: Cloud Migration (12 weeks)\nPhase 3: Automation Implementation (8 weeks)\n\n# Investment\nTotal project cost: $285,000\nExpected ROI: 180% within 18 months`,
  },
  {
    id: "invoice",
    name: "Invoice",
    category: "Business",
    description: "Professional invoice with totals table and branded header.",
    font: "Arial",
    pageColor: "#FFFFFF",
    textColor: "#111827",
    headingColor: "#065F46",
    accentColor: "#10B981",
    templateStyle: "Simple",
    preview: {
      headerStyle: "bar",
      backgroundPattern: "grid",
    },
    sampleText: `# INVOICE #INV-2024-0847\n\n# From\nAcme Solutions Ltd.\n123 Business Ave, Suite 400\n\n# Bill To\nClient Corporation\n456 Corporate Blvd\n\n# Items\nWeb Development Services - $12,000.00\nUI/UX Design (40 hours) - $6,000.00\nProject Management - $3,500.00\n\n# Total: $21,500.00\nPayment Due: Net 30`,
  },
  {
    id: "project-documentation",
    name: "Project Documentation",
    category: "Business",
    description: "Technical documentation layout with structured code references.",
    font: "Courier New",
    pageColor: "#F8FAFC",
    textColor: "#1E293B",
    headingColor: "#4338CA",
    accentColor: "#6366F1",
    templateStyle: "Modern",
    preview: {
      headerStyle: "accent-bar",
      backgroundPattern: "dots",
    },
    sampleText: `# API Documentation v2.1\n\n# Authentication\nAll API requests require a Bearer token in the Authorization header.\n\n# Endpoints\nGET /api/v2/users - List all users\nPOST /api/v2/users - Create a new user\nPUT /api/v2/users/:id - Update user\nDELETE /api/v2/users/:id - Delete user\n\n# Error Codes\n400 - Bad Request\n401 - Unauthorized\n404 - Not Found\n500 - Internal Server Error`,
  },
  {
    id: "academic-notes",
    name: "Academic Notes",
    category: "Education",
    description: "Notebook-style educational document with lined background.",
    font: "Arial",
    pageColor: "#FEF9C3",
    textColor: "#1F2937",
    headingColor: "#1E40AF",
    accentColor: "#3B82F6",
    templateStyle: "Simple",
    preview: {
      headerStyle: "line",
      backgroundPattern: "lines",
    },
    sampleText: `# Lecture 12: Quantum Mechanics\nProfessor Dr. Smith - Physics 301\n\n# Wave-Particle Duality\nLight exhibits both wave and particle properties. The double-slit experiment demonstrates this fundamental principle.\n\n# Key Equations\nE = hf (Energy of a photon)\nLambda = h/p (De Broglie wavelength)\n\n# Study Notes\nReview Chapter 7 for the midterm. Focus on Schrodinger equation applications.`,
  },
  {
    id: "research-paper",
    name: "Research Paper",
    category: "Education",
    description: "Formal academic paper with title block and references section.",
    font: "Times New Roman",
    pageColor: "#FFFFFF",
    textColor: "#000000",
    headingColor: "#000000",
    accentColor: "#374151",
    templateStyle: "Report",
    preview: {
      headerStyle: "line",
      backgroundPattern: "none",
    },
    sampleText: `# Machine Learning Applications in Healthcare: A Comprehensive Review\n\nDr. Emily Chen, Dr. Raj Patel\nDepartment of Computer Science, Stanford University\n\n# Abstract\nThis paper presents a systematic review of machine learning applications in healthcare, analyzing 150 studies published between 2019-2024.\n\n# Introduction\nThe integration of ML in healthcare has accelerated dramatically, with applications ranging from diagnostic imaging to drug discovery.\n\n# Methodology\nWe conducted a systematic literature review following PRISMA guidelines.\n\n# References\n[1] LeCun, Y. et al. (2024). Deep Learning in Medicine. Nature.`,
  },
  {
    id: "certificate",
    name: "Certificate of Achievement",
    category: "Creative",
    description: "Decorative border with signature areas and elegant typography.",
    font: "Georgia",
    pageColor: "#FFFBEB",
    textColor: "#78350F",
    headingColor: "#92400E",
    accentColor: "#D97706",
    templateStyle: "Minimal",
    preview: {
      headerStyle: "certificate",
      borderColor: "#D97706",
      backgroundPattern: "none",
    },
    sampleText: `# Certificate of Achievement\n\nThis is to certify that\n\n# Alex Johnson\n\nhas successfully completed the\nAdvanced Data Science Program\n\nwith distinction on this day, March 15, 2025\n\n# Director\nDr. Maria Santos\n\n# Dean\nProf. Robert Williams`,
  },
  {
    id: "ebook-chapter",
    name: "E-book Chapter",
    category: "Creative",
    description: "Book-like layout with chapter headings and comfortable reading margins.",
    font: "Georgia",
    pageColor: "#FEF3C7",
    textColor: "#44403C",
    headingColor: "#78350F",
    accentColor: "#B45309",
    templateStyle: "Minimal",
    preview: {
      headerStyle: "none",
      backgroundPattern: "none",
    },
    sampleText: `# Chapter 7: The Hidden Path\n\nThe morning light filtered through the ancient oaks, casting long shadows across the moss-covered stones. Elara paused at the crossroads, her map clutched tightly in weathered hands.\n\n"It should be just beyond the ridge," she murmured, more to herself than to her companion. The path ahead was narrow and overgrown, barely visible beneath the wild undergrowth.\n\n# The Discovery\nWhat they found at the summit would change everything they thought they knew about the old kingdom.`,
  },
  {
    id: "meeting-minutes",
    name: "Meeting Minutes",
    category: "Business",
    description: "Structured notes format for business meetings with action items.",
    font: "Arial",
    pageColor: "#FFFFFF",
    textColor: "#1F2937",
    headingColor: "#0F766E",
    accentColor: "#14B8A6",
    templateStyle: "Report",
    preview: {
      headerStyle: "bar",
      backgroundPattern: "none",
    },
    sampleText: `# Meeting Minutes\nQ4 Planning Session - December 10, 2024\n\n# Attendees\nJane Doe (Chair), John Smith, Alice Brown, Bob Wilson\n\n# Agenda\n1. Q3 Performance Review\n2. Q4 Budget Allocation\n3. Product Roadmap Updates\n\n# Decisions\n- Approved $2M budget for cloud migration\n- Product launch moved to February 2025\n\n# Action Items\nJane: Finalize vendor contracts by Dec 20\nBob: Complete security audit by Jan 5\nAlice: Prepare marketing plan by Jan 10`,
  },
  {
    id: "personal-letter",
    name: "Personal Letter",
    category: "Personal",
    description: "Elegant letter format with classic styling and warm tones.",
    font: "Georgia",
    pageColor: "#FFF7ED",
    textColor: "#44403C",
    headingColor: "#7C2D12",
    accentColor: "#C2410C",
    templateStyle: "Simple",
    preview: {
      headerStyle: "none",
      backgroundPattern: "none",
    },
    sampleText: `# Dear Margaret,\n\nI hope this letter finds you well. It has been far too long since we last spoke, and I wanted to reach out and reconnect.\n\nLife in the countryside has been peaceful. The garden is blooming with roses this season, and the morning walks by the lake have become my daily ritual.\n\n# Until We Meet Again\nI plan to visit the city next month and would love to catch up over coffee. Let me know your availability.\n\nWith warm regards,\nElizabeth`,
  },
  {
    id: "comic-book-classic",
    name: "Comic Book Classic",
    category: "Comic",
    description: "Bold comic-inspired layout with halftone accents and vibrant colors.",
    font: "Arial",
    pageColor: "#FFFDE7",
    textColor: "#1A1A1A",
    headingColor: "#D32F2F",
    accentColor: "#FF6F00",
    templateStyle: "Modern",
    preview: {
      headerStyle: "comic",
      backgroundPattern: "halftone",
    },
    sampleText: `# THE AMAZING ADVENTURE\nIssue #1 - The Beginning\n\n# Chapter 1: The Call\nOur hero stood at the edge of the city, cape billowing in the wind. The signal lit up the night sky - it was time.\n\n"I knew this day would come," Captain Valor whispered, pulling his mask tight.\n\n# Chapter 2: The Battle\nThe villain's lair was hidden beneath the old clock tower. Every second counted as the countdown timer ticked away.\n\n# TO BE CONTINUED...`,
  },
  {
    id: "manga-style",
    name: "Manga Style",
    category: "Comic",
    description: "Black-and-white minimalist manga layout with clean lines.",
    font: "Arial",
    pageColor: "#FAFAFA",
    textColor: "#111111",
    headingColor: "#000000",
    accentColor: "#374151",
    templateStyle: "Minimal",
    preview: {
      headerStyle: "accent-bar",
      backgroundPattern: "dots",
    },
    sampleText: `# The Silent Garden\nVolume 1, Chapter 1\n\n# Scene 1\nRain fell softly on the empty school courtyard. Yuki stood alone, umbrella in hand, watching the cherry blossoms drift through the mist.\n\n"It's beautiful, isn't it?" A voice broke the silence. She turned to find Takeshi leaning against the wall, his school jacket soaked through.\n\n# Scene 2\n"I didn't think anyone else would be here," Yuki replied softly. The afternoon light painted everything in shades of gray.\n\n# End of Chapter 1`,
  },
  {
    id: "kids-storybook",
    name: "Kids Storybook",
    category: "Personal",
    description: "Colorful playful template with warm, friendly styling.",
    font: "Verdana",
    pageColor: "#ECFDF5",
    textColor: "#1F2937",
    headingColor: "#DC2626",
    accentColor: "#F59E0B",
    templateStyle: "Simple",
    preview: {
      headerStyle: "storybook",
      backgroundPattern: "none",
    },
    sampleText: `# The Friendly Dragon\nA Story for Little Dreamers\n\n# Once Upon a Time...\nIn a land far, far away, there lived a little dragon named Sparkle. Unlike the other dragons who breathed fire, Sparkle breathed rainbow sparkles!\n\n# A New Friend\nOne sunny morning, Sparkle met a bunny named Cotton. "Will you be my friend?" asked Sparkle. "Of course!" said Cotton with a happy hop.\n\n# The End\nAnd they lived happily ever after, painting the sky with colors every day.`,
  },
];

/**
 * Get templates filtered by category
 */
export function getTemplatesByCategory(category: TemplateCategory): SampleTemplate[] {
  if (category === "All") return SAMPLE_TEMPLATES;
  return SAMPLE_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Find a template by its ID
 */
export function getTemplateById(id: string): SampleTemplate | undefined {
  return SAMPLE_TEMPLATES.find((t) => t.id === id);
}
