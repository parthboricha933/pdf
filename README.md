# 📄 Text to PDF Converter — API Documentation

Convert text to beautifully formatted PDF documents via a simple REST API. No sign-up required for basic usage.

**Base URL:** `https://my-project-six-phi-26.vercel.app`

---

## 🚀 Quick Start

```bash
curl -X POST https://my-project-six-phi-26.vercel.app/api/v1/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "text": "# Hello World\nThis is my first PDF!",
    "template": "Modern"
  }' \
  --output my-document.pdf
```

Wait — that returns JSON by default. To get a **direct PDF file download**, use `responseFormat: "binary"`:

```bash
curl -X POST https://my-project-six-phi-26.vercel.app/api/v1/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "text": "# Hello World\nThis is my first PDF!",
    "template": "Modern",
    "responseFormat": "binary"
  }' \
  --output my-document.pdf
```

---

## 📋 Table of Contents

- [Authentication](#-authentication)
- [Rate Limits](#-rate-limits)
- [Endpoints](#-endpoints)
  - [Generate PDF](#1-generate-pdf)
  - [List Templates](#2-list-templates)
  - [Manage API Keys](#3-manage-api-keys)
- [Templates](#-templates)
- [Code Examples](#-code-examples)
  - [JavaScript / Node.js](#javascript--nodejs)
  - [Python](#python)
  - [PHP](#php)
  - [cURL](#curl)
- [Error Handling](#-error-handling)
- [Webhook Integration](#-webhook-integration)

---

## 🔑 Authentication

The API supports two authentication modes:

### Public Access (No API Key)
- **10 requests per minute**
- No sign-up needed
- Just start making requests

### Authenticated Access (With API Key)
- **1,000 requests per minute**
- Request tracking and analytics
- Create keys via the `/api/v1/keys` endpoint

### How to Authenticate

Include your API key in one of two ways:

```bash
# Option 1: Authorization header (recommended)
-H "Authorization: Bearer tpk_live_your_api_key_here"

# Option 2: X-API-Key header
-H "X-API-Key: tpk_live_your_api_key_here"
```

---

## ⏱ Rate Limits

| Access Level | Limit | Window |
|-------------|-------|--------|
| Public (no key) | 10 requests | per minute |
| Authenticated | 1,000 requests | per minute |

Rate limit info is included in every response under `meta.rateLimit`:

```json
{
  "meta": {
    "rateLimit": {
      "remaining": 7,
      "resetAt": "2025-01-15T10:31:00.000Z"
    }
  }
}
```

When you exceed the limit, you'll get a `429` response:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 45
}
```

---

## 📡 Endpoints

### 1. Generate PDF

```
POST /api/v1/generate-pdf
```

Generate a PDF document from text content.

#### Request Body

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | **Yes** | — | Text content. Use `#` for headings (like Markdown) |
| `template` | string | No | `"Simple"` | Template ID (see [Templates](#-templates)) |
| `font` | string | No | `"Arial"` | Font: Arial, Helvetica, Times New Roman, Courier New, Georgia, Verdana |
| `pageColor` | string | No | `"#FFFFFF"` | Page background color (hex) |
| `textColor` | string | No | `"#000000"` | Text color (hex) |
| `pageSize` | string | No | `"A4"` | Page size: A4, Letter |
| `orientation` | string | No | `"portrait"` | Orientation: portrait, landscape |
| `fileName` | string | No | `"document.pdf"` | Output file name |
| `responseFormat` | string | No | `"json"` | Response format: `json` (base64) or `binary` (PDF file) |

#### JSON Response (`responseFormat: "json"`)

```json
{
  "success": true,
  "data": {
    "pdfBase64": "JVBERi0xLjQKMSAwIG9iago...",
    "pdfDataUrl": "data:application/pdf;base64,JVBERi0xLjQK...",
    "fileName": "document.pdf",
    "template": "Modern",
    "font": "Arial",
    "pageSize": "A4",
    "orientation": "portrait",
    "pageColor": "#FFFFFF",
    "textColor": "#000000",
    "textLength": 42
  },
  "meta": {
    "authenticated": false,
    "rateLimit": {
      "remaining": 9,
      "resetAt": "2025-01-15T10:31:00.000Z"
    }
  }
}
```

#### Binary Response (`responseFormat: "binary"`)

Returns the PDF file directly with headers:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="document.pdf"`

#### Example Requests

**Simple PDF:**
```json
{
  "text": "Hello World!\nThis is a simple PDF document."
}
```

**Professional Resume:**
```json
{
  "text": "# John Anderson\nSoftware Engineer\n\n# Experience\nSenior Developer at TechCorp (2020-Present)\n\n# Education\nB.S. Computer Science, MIT",
  "template": "professional-resume",
  "font": "Arial",
  "pageColor": "#FFFFFF",
  "textColor": "#1F2937"
}
```

**Custom Styled Document:**
```json
{
  "text": "# Project Report\n\n## Q4 Results\nRevenue exceeded targets by 23%.\n\n## Next Steps\nExpand to new markets.",
  "template": "corporate-report",
  "font": "Times New Roman",
  "pageColor": "#FFFBEB",
  "textColor": "#111827",
  "pageSize": "Letter",
  "orientation": "portrait",
  "responseFormat": "binary"
}
```

---

### 2. List Templates

```
GET /api/v1/templates
```

Get all available PDF templates with their configuration details.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category: Professional, Creative, Business, Education, Comic, Personal |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "Simple",
      "name": "Simple",
      "category": "Professional",
      "description": "Clean and straightforward layout with page numbers.",
      "font": "Arial",
      "pageColor": "#FFFFFF",
      "textColor": "#000000",
      "headingColor": "#000000",
      "accentColor": "#000000",
      "type": "base"
    },
    {
      "id": "professional-resume",
      "name": "Professional Resume",
      "category": "Professional",
      "description": "Clean resume layout with sidebar accent and structured sections.",
      "font": "Arial",
      "pageColor": "#FFFFFF",
      "textColor": "#1F2937",
      "headingColor": "#1D4ED8",
      "accentColor": "#3B82F6",
      "type": "sample"
    }
  ],
  "categories": ["Professional", "Creative", "Business", "Education", "Comic", "Personal"],
  "meta": {
    "total": 21
  }
}
```

---

### 3. Manage API Keys

#### Create a Key

```
POST /api/v1/keys
```

> ⚠️ Requires `API_ADMIN_KEY` environment variable. Pass it as `Authorization: Bearer <admin_key>`.

```bash
curl -X POST https://my-project-six-phi-26.vercel.app/api/v1/keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tpk_admin_change_this_in_production" \
  -d '{
    "name": "My Application",
    "email": "dev@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "tpk_live_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345",
    "name": "My Application",
    "email": "dev@example.com",
    "createdAt": "2025-01-15T10:00:00.000Z"
  },
  "message": "Save your API key securely. It will not be shown again."
}
```

#### List All Keys

```
GET /api/v1/keys
```

```bash
curl https://my-project-six-phi-26.vercel.app/api/v1/keys \
  -H "Authorization: Bearer tpk_admin_change_this_in_production"
```

#### Revoke a Key

```
DELETE /api/v1/keys?key=tpk_live_xxxxx
```

```bash
curl -X DELETE "https://my-project-six-phi-26.vercel.app/api/v1/keys?key=tpk_live_xxxxx" \
  -H "Authorization: Bearer tpk_admin_change_this_in_production"
```

---

## 🎨 Templates

### Base Templates

| ID | Name | Style |
|----|------|-------|
| `Simple` | Simple | Clean layout, page numbers |
| `Professional` | Professional | Header lines, structured |
| `Modern` | Modern | Bold accent bars |
| `Minimal` | Minimal | Wide margins, spacious |
| `Resume` | Resume | Double-line header |
| `Report` | Report | Top bar, page numbers |

### Sample Templates

| ID | Name | Category | Description |
|----|------|----------|-------------|
| `professional-resume` | Professional Resume | Professional | Sidebar layout with blue accent |
| `modern-cv` | Modern CV | Professional | Minimal two-column with teal accent |
| `corporate-report` | Corporate Report | Business | Formal report with navy bar header |
| `business-proposal` | Business Proposal | Business | Warm gold accents, elegant |
| `invoice` | Invoice | Business | Green header, clean layout |
| `project-documentation` | Project Documentation | Business | Indigo accents, monospace-friendly |
| `academic-notes` | Academic Notes | Education | Blue lines, notebook style |
| `research-paper` | Research Paper | Education | Formal black, double lines |
| `certificate` | Certificate of Achievement | Creative | Double gold border frame |
| `ebook-chapter` | E-book Chapter | Creative | Warm cream, wide margins |
| `meeting-minutes` | Meeting Minutes | Business | Teal bar, structured sections |
| `personal-letter` | Personal Letter | Personal | Warm orange, classic format |
| `comic-book-classic` | Comic Book Classic | Comic | Bold red/yellow, POW burst |
| `manga-style` | Manga Style | Comic | B&W minimalist, accent bar |
| `kids-storybook` | Kids Storybook | Personal | Colorful dots, playful header |

---

## 💻 Code Examples

### JavaScript / Node.js

#### Generate PDF and save to file (binary mode)

```javascript
const fs = require('fs');

async function generatePdf() {
  const response = await fetch('https://my-project-six-phi-26.vercel.app/api/v1/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer tpk_live_your_api_key_here' // optional
    },
    body: JSON.stringify({
      text: '# Invoice #1234\n\nServices rendered: $5,000.00\n\nPayment due: Net 30',
      template: 'invoice',
      responseFormat: 'binary'
    })
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync('invoice.pdf', buffer);
  console.log('PDF saved as invoice.pdf');
}

generatePdf();
```

#### Generate PDF and get base64 (json mode)

```javascript
async function generatePdfBase64() {
  const response = await fetch('https://my-project-six-phi-26.vercel.app/api/v1/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'tpk_live_your_api_key_here' // optional
    },
    body: JSON.stringify({
      text: '# Report\n\nQuarterly revenue increased by 23%.',
      template: 'corporate-report',
      font: 'Times New Roman',
      pageColor: '#FFFFFF',
      textColor: '#111827'
    })
  });

  const data = await response.json();

  if (data.success) {
    console.log('PDF generated:', data.data.fileName);
    console.log('Base64 length:', data.data.pdfBase64.length);

    // Embed in HTML
    const embedHtml = `<embed src="${data.data.pdfDataUrl}" width="100%" height="600px">`;
  }
}

generatePdfBase64();
```

#### Browser: Generate and display PDF

```html
<!DOCTYPE html>
<html>
<body>
  <button onclick="generateAndShow()">Generate PDF</button>
  <iframe id="pdfFrame" width="100%" height="600px"></iframe>

  <script>
    async function generateAndShow() {
      const res = await fetch('https://my-project-six-phi-26.vercel.app/api/v1/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '# My Document\n\nHello from the browser!',
          template: 'Modern'
        })
      });

      const data = await res.json();
      if (data.success) {
        document.getElementById('pdfFrame').src = data.data.pdfDataUrl;
      }
    }
  </script>
</body>
</html>
```

---

### Python

#### Using requests library

```python
import requests
import base64

BASE_URL = "https://my-project-six-phi-26.vercel.app/api/v1"

# ── Generate PDF (binary mode) and save to file ──
def generate_pdf_binary():
    response = requests.post(
        f"{BASE_URL}/generate-pdf",
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer tpk_live_your_api_key_here"  # optional
        },
        json={
            "text": "# Resume\n\nJohn Anderson\nSoftware Engineer\n\n# Experience\nSenior Developer at TechCorp",
            "template": "professional-resume",
            "responseFormat": "binary"
        }
    )

    with open("resume.pdf", "wb") as f:
        f.write(response.content)
    print("PDF saved as resume.pdf")

# ── Generate PDF (json mode) and decode base64 ──
def generate_pdf_json():
    response = requests.post(
        f"{BASE_URL}/generate-pdf",
        headers={
            "Content-Type": "application/json"
        },
        json={
            "text": "# Research Paper\n\nAbstract: This paper explores...",
            "template": "research-paper",
            "font": "Times New Roman"
        }
    )

    data = response.json()
    if data["success"]:
        pdf_bytes = base64.b64decode(data["data"]["pdfBase64"])
        with open("paper.pdf", "wb") as f:
            f.write(pdf_bytes)
        print(f"PDF saved: {data['data']['fileName']}")

# ── List all templates ──
def list_templates():
    response = requests.get(f"{BASE_URL}/templates")
    data = response.json()

    for template in data["data"]:
        print(f"  {template['id']}: {template['name']} ({template['category']})")

generate_pdf_binary()
generate_pdf_json()
list_templates()
```

---

### PHP

```php
<?php

$baseUrl = 'https://my-project-six-phi-26.vercel.app/api/v1';

// ── Generate PDF (binary mode) ──
function generatePdfBinary($text, $template = 'Simple') {
    global $baseUrl;

    $payload = json_encode([
        'text' => $text,
        'template' => $template,
        'responseFormat' => 'binary'
    ]);

    $ch = curl_init("$baseUrl/generate-pdf");
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer tpk_live_your_api_key_here' // optional
        ],
        CURLOPT_RETURNTRANSFER => true,
    ]);

    $pdfData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        file_put_contents('document.pdf', $pdfData);
        echo "PDF saved as document.pdf\n";
    } else {
        echo "Error: $pdfData\n";
    }
}

// ── Generate PDF (json mode) ──
function generatePdfJson($text, $template = 'Simple') {
    global $baseUrl;

    $payload = json_encode([
        'text' => $text,
        'template' => $template
    ]);

    $ch = curl_init("$baseUrl/generate-pdf");
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);
    if ($data['success']) {
        $pdfBytes = base64_decode($data['data']['pdfBase64']);
        file_put_contents($data['data']['fileName'], $pdfBytes);
        echo "PDF saved as {$data['data']['fileName']}\n";
    }
}

// Usage
generatePdfBinary("# Invoice\n\nAmount: $1,500.00", "invoice");
generatePdfJson("# Report\n\nQuarterly summary.", "corporate-report");
```

---

### cURL

**Generate and save PDF (binary):**
```bash
curl -X POST https://my-project-six-phi-26.vercel.app/api/v1/generate-pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tpk_live_your_api_key" \
  -d '{
    "text": "# Certificate of Completion\n\nThis certifies that Jane Doe has completed the program.",
    "template": "certificate",
    "responseFormat": "binary"
  }' \
  --output certificate.pdf
```

**Generate PDF (JSON with base64):**
```bash
curl -X POST https://my-project-six-phi-26.vercel.app/api/v1/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "text": "# Meeting Notes\n\nAttendees: John, Jane, Bob\n\n# Action Items\n1. Review budget by Friday",
    "template": "meeting-minutes",
    "font": "Arial",
    "pageSize": "Letter"
  }'
```

**List templates:**
```bash
curl https://my-project-six-phi-26.vercel.app/api/v1/templates
```

**List templates by category:**
```bash
curl "https://my-project-six-phi-26.vercel.app/api/v1/templates?category=Business"
```

**Create an API key:**
```bash
curl -X POST https://my-project-six-phi-26.vercel.app/api/v1/keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tpk_admin_change_this_in_production" \
  -d '{"name": "My App", "email": "dev@example.com"}'
```

---

## ❌ Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Description of what went wrong",
  "details": ["Specific validation error 1", "Specific validation error 2"]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success — PDF generated |
| `201` | Created — API key created |
| `400` | Bad Request — Invalid input, missing `text`, invalid template/font |
| `401` | Unauthorized — Invalid or revoked API key |
| `403` | Forbidden — Admin key required for key management |
| `404` | Not Found — API key not found during revocation |
| `429` | Rate Limit Exceeded — Slow down and retry after `retryAfter` seconds |
| `502` | Bad Gateway — Internal PDF generation failed |
| `500` | Internal Server Error — Something went wrong on our end |

### Common Errors

**Missing text:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["`text` is required and cannot be empty"]
}
```

**Invalid template:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Invalid template. Valid options: Simple, Professional, Modern, ..."]
}
```

**Rate limited:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 45
}
```

---

## 🔗 Webhook Integration

You can integrate this API with n8n, Zapier, Make, or any webhook-based automation tool.

### n8n HTTP Request Node

1. Add an **HTTP Request** node
2. Method: `POST`
3. URL: `https://my-project-six-phi-26.vercel.app/api/v1/generate-pdf`
4. Headers: `Content-Type: application/json`
5. Body (JSON):
```json
{
  "text": "={{ $json.content }}",
  "template": "={{ $json.template || 'Simple' }}",
  "responseFormat": "binary"
}
```

### Zapier Webhook

1. Create a **Webhooks by Zapier** action
2. Event: `POST`
3. URL: `https://my-project-six-phi-26.vercel.app/api/v1/generate-pdf`
4. Payload Type: `JSON`
5. Data: Set `text`, `template`, `responseFormat` fields

---

## 📌 Tips

1. **Use `responseFormat: "binary"`** when you want to directly save or serve the PDF file
2. **Use `responseFormat: "json"`** when you need to embed the PDF in a web page (via `pdfDataUrl`)
3. **Lines starting with `#`** become bold headings — use this to structure your documents
4. **Each template has optimal defaults** — you can override them with `font`, `pageColor`, `textColor`
5. **Get an API key** for higher rate limits (1,000/min vs 10/min)
6. **CORS is enabled** — you can call this API directly from browser JavaScript

---

## 🏗 Architecture

```
Client Request
    │
    ▼
/api/v1/generate-pdf  ◄── CORS + Rate Limit + Auth
    │
    ▼
/api/generate-pdf     ◄── Internal PDF Engine (pdf-lib)
    │
    ▼
/api/pdf-history      ◄── Save to Database (optional)
    │
    ▼
Response (JSON/base64 or Binary PDF)
```

---

**Made with ❤️ by [Parth Boricha](https://github.com/parthboricha933)**
