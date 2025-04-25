// tagged for gh commit 24 apr 25

# **App Name**: Bear Threads Generator (v2)

## Core Features:

- Generate Threads Posts: Facilitates creation of new standalone Threads posts. Enables controls for generating up to 5 posts with optional images.
- Threads Replies: Displays an original post feed with AI-generated reply suggestions. Supports multiple personas and tags.
- Image Control Panel / Browser: Grid-based gallery for images in bearpics GCP bucket. Future: Instagram post generation/upload.
- Application Control Panel: Central hub for app settings and monitoring, including AI model selection, system instructions management, and account selection.
- Text Generation: Generates 5 posts via selected AI model, stores images in GCP Cloud Storage; metadata in Firestore
- Image Generation: Generates 5 image prompts via selected image model
- Reply Generation: Generates new reply suggestion

## Style Guidelines:

- Background: #212121
- Surface/Cards: #373940
- Primary Text: #dadada
- Secondary Text: #8e8e93
- Accent: #B3A566
- Error: #e75a5a
- Warning: #e0a800
- Success: #2f9e44
- Font: Inter var, system-ui
- Base Size: 16px; Line Height: 1.5
- Weights: Regular 400; Medium 500; Semibold 600; Bold 700
- Headings: H1 2.5rem; H2 2rem; H3 1.5rem; H4 1.25rem
- Unit: 8px
- Container Padding: 24px
- Grid: 12-column responsive
- Border Radius: 10px
- Shadows: 0 1px 3px rgba(0,0,0,0.3)
- Heroicons line style #dadada; avatars circular 32px
- Micro-Interactions: 0.2s ease-in-out; spinners in accent;

## Original User Request:
Please change the blueprint exactly as follows:

# **App Name**: **Bear Threads Generator (v2)**

## **Updated Development Specification Document: Bear Threads Generator (v2)**

### **1. Introduction**

This document specifies the architecture and functionality of the **Bear Threads Generator**, a React (Next.js) frontend with a Firebase backend. It enables creation, management, and publishing of content to Threads (and future Instagram integration) via LLM-driven text generation and image services.

### **2. Application Overview**

The app comprises **4 primary tabs**:

1. **Generate Threads Posts**

2. **Reply to Posts**

3. **Image Control Panel/Browser**

4. **Application Control Panel**

---

### **3. Tab Specifications**

#### **3.1 Tab 1: Generate Threads Posts**

**UI/UX Notes:** Facilitates creation of new standalone Threads posts. Left side: controls; right side: list of up to 5 generated posts with optional images. Accent color: #783D8B.

**Inputs:**

- Textbox: idea, text, or URL (blank for auto-prompt)

- Dropdown: System Instruction (Firestone-managed)

- Checkbox: Include images

**Actions:**

- Generate 5 posts via selected AI model

- In parallel, generate 5 image prompts via selected image model

- Store images in GCP Cloud Storage; metadata in Firestore

**Output:**

- Async, real-time updates

- Preview and edit caption

- “Regenerate” buttons for captions/images

**Posting:**

- Select post + image

- “Post” via Threads API to chosen account

**API Calls:**

- Text Generation: POST /api/generateText (body: prompt, systemInstruction)

- Image Generation: POST /api/generateImage (body: imagePrompt, model)

- Storage Upload: PUT /api/uploadImage (uploads to GCP bucket)

- Threads Publish: POST https://api.threads.net/v1/posts (body: contentId, mediaUrl, accountToken)

---

#### **3.2 Tab 2: Threads Replies**

**UI/UX Notes:** Left: original post feed; right: AI-generated reply suggestions. Supports multiple personas and tags.

**Feed Display:**

- Threads-style feed; parent posts in italics

**Reply Panel:**

- Editable textbox pre-filled with suggestion

- Buttons: Post | Generate New Reply

**Controls:**

- Pagination: 10 posts/page

- Filters:

  - Users (Firestone list)

  - Keywords (OR logic; last 20 unique stored)

  - Easter egg: if “love” or “shutdown” after 2 AM, show custom warning

- Recent keywords with timestamps

**API Calls:**

- Fetch Feed: GET /api/fetchFeed (params: filters, page)

- Fetch Replies: GET /api/fetchReplies (params: postId)

- Generate Reply: POST /api/generateReply (body: postContent, systemInstruction)

- Post Reply: POST https://api.threads.net/v1/replies (body: parentPostId, replyText, accountToken)

---

#### **3.3 Tab 3: Image Control Panel / Browser**

**UX/Notes:** Grid-based gallery for images in bearpics GCP bucket. Future: Instagram post generation/upload.

**Current:**

- Browse, view metadata, sort, search

**Future:**

- Text + image + audio suggestions

- Direct Instagram API upload

**API Calls:**

- List Images: GET /api/listImages (params: bucketName, filters)

- Image Metadata: GET /api/imageMetadata (params: imageId)

- Instagram Upload (future): POST /api/instagramUpload (body: mediaUrl, caption, audioId)

---

#### **3.4 Tab 4: Application Control Panel**

Central hub for app settings and monitoring.

**Features:**

1. **AI Model Selector**: Gemini 2.0-Flash, OpenAI GPT-4-Turbo (persisted in Firestore)

2. **Image Model Selector**: Leonardo.ai, DALL·E, Imagen

3. **System Instructions Management** (Text + Image personas: BearWithABite, Ryan, Max)

4. **Threads Account Selector** (multiple accounts; token + alias in Firestore)

5. **Tag Support**: search tags management

6. **Sentiment & Routing Logic** (optional future)

7. **Heatmap UI**: keyword frequency trends

8. **Debug / Code Status Panel**: real-time logs & API responses

**API Calls:**

- Get Models: GET /api/models (returns available AI and image models)

- Update Model: POST /api/models/update (body: modelType, selection)

- Get Accounts: GET /api/accounts (returns Threads accounts)

- Add Account: POST /api/accounts (body: accountToken, alias)

- Get Heatmap Data: GET /api/heatmapData (params: keywordList, dateRange)

- Fetch Logs: GET /api/logs (params: logLevel, since)

---

### **4. API Keys & Config**

Store in .env or .env.local:

OPENAI_API_KEY=sk-...

GOOGLE_GENAI_API_KEY=...

THREADS_ACCESS_TOKEN=...

NEXT_PUBLIC_FIREBASE_API_KEY=...

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=threadforge-ai.firebaseapp.com

NEXT_PUBLIC_FIREBASE_PROJECT_ID=threadforge-ai

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=threadforge-ai.appspot.com

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=9992719290

NEXT_PUBLIC_FIREBASE_APP_ID=1:9992719290:web:...

FIREBASE_SERVICE_ACCOUNT_KEY={...}

*Rotate keys before sharing.*

---

### **5. Technical Notes**

- Prioritize async architecture for text/image generation

- Prompting logic must balance creativity with persona constraints

- Store metadata (text, interactions) in Firestore; binary assets in Cloud Storage

---

### **6. Styleguide**

1. **Purpose & Audience**: Developers/designers; mirror ChatGPT dark-mode UI

2. **Color Palette (Dark Mode First)**

   - Background: #212121

   - Surface/Cards: #373940

   - Primary Text: #dadada

   - Secondary Text: #8e8e93

   - Accent: #B3A566

   - Error: #e75a5a

   - Warning: #e0a800

   - Success: #2f9e44

3. **Typography**

   - Font: Inter var, system-ui

   - Base Size: 16px; Line Height: 1.5

   - Weights: Regular 400; Medium 500; Semibold 600; Bold 700

   - Headings: H1 2.5rem; H2 2rem; H3 1.5rem; H4 1.25rem

4. **Spacing & Layout**

   - Unit: 8px

   - Container Padding: 24px

   - Grid: 12-column responsive

   - Border Radius: 10px

   - Shadows: 0 1px 3px rgba(0,0,0,0.3)

5. **UI Components**

   - Buttons: Primary (#7491f7 bg, #fff text); Secondary (transparent, #7491f7 border); Disabled (opacity .5); Hover (darken 10%)

   - Inputs: #373940 bg; #dadada text; #44444d border; focus #7491f7

   - Cards: #373940 bg; 16px padding; 10px radius

   - Modals: backdrop rgba(0,0,0,0.6); container #202123; 24px padding

6. **Icons & Illustrations**: Heroicons line style #dadada; avatars circular 32px

7. **Micro-Interactions**: 0.2s ease-in-out; spinners in accent;

8. **Accessibility**: Contrast ≥4.5:1; focus rings; ARIA roles

9. **Version Control**: Use semantic versioning with date and changelog

---

### **8. Additional Considerations**

- **Authentication & Authorization**: Implement Firebase Auth for secure user sign-in; granular role-based permissions for multi-account management.

- **Error Handling & Retries**: Standardize error responses; implement exponential backoff and retries for external API calls (Threads, Gemini, Leonardo.ai).

- **Logging & Monitoring**: Integrate Cloud Logging & Monitoring dashboards; alert on error rates, high latency, or failed uploads.

- **Testing & QA**: Unit tests for API endpoints; end-to-end tests for Gradio/React flows using Playwright or Cypress.

- **CI/CD Pipeline**: Set up GitHub Actions or Cloud Build for automated linting, testing, and deployment to Firebase Hosting.

- **Performance & Caching**: Leverage CDNs for static assets; cache frequent AI prompts/results in Firestore or in-memory store (Redis).

- **Rate Limiting & Quotas**: Throttle user requests to avoid hitting API rate limits; track quotas for OpenAI, Google GenAI, and Threads.

- **Security & Compliance**: Encrypt sensitive data at rest; review service account IAM roles; ensure compliance with GDPR/CCPA if applicable.

- **Analytics & Reporting**: Capture user interactions and post metrics (impressions, engagement) for ROI insights; visualize in a dashboard.

- **Documentation & Onboarding**: Auto-generate API docs (OpenAPI/Swagger); maintain developer README and onboarding guide.

---

### **Appendix A: MVP Wireframe Code**

+----------------------------------------------------------------------------------------+

|  [HEADER] (Background: #202123)                                                       |

|  [MAX Logo] (White)                                       [User Avatar] (Circular 32px)|

|                                                                                        |

+----------------------------------------------------------------------------------------+

| [MAIN CONTAINER] (Background: #202123, Padding: 24px)                                 |

|                                                                                        |

|   [NEW THREAD IDEA CARD] (Background: #373940, Radius: 10px, Shadow)                 |

|     [H3] New Thread Idea (Primary Text: #dadada)                                        |

|     [Text Area] (Background: #373940, Text: #dadada, Border: #44444d, Radius: 10px)    |

|       [Placeholder: Type your idea here...] (Secondary Text: #8e8e93)                   |

|     [Error Message] (if any) (Error: #e75a5a)                                          |

|     [Character Count] (Secondary Text: #8e8e93)                                         |

|     [Button Row]                                                                       |

|       [Generate Button] (Primary: Background: #7491f7, Text: #fff, Radius: 10px, Hover: Darken) |

|       [Clear All Button] (Secondary: Transparent, Border: #7491f7, Radius: 10px, Hover: Darken) |

|                                                                                        |

|   [GENERATED POSTS CARD] (Background: #212121, Radius: 10px, Shadow)                  |

|     [H3] Generated Posts (Primary Text: #dadada)                                       |

|     [Scrollable List]                                                                 |

|       [Post 1] (Selected: Background: #44444d, Radius 10px) (Regular: Background: #373940, Radius: 10px)                                                         |

|          [Text Content] (Primary Text: #dadada)                                         |

|          [Use Button] (Ghost: #7491f7, Radius: 10px)                                       |

|          [Regenerate Button] (Ghost: #7491f7, Radius: 10px)                                  |

|          ... (More Post Variations)                                                         |

|       [Post 2]                                                                         |

|          ...                                                                          |

|       [Post 3]                                                                         |

|          ...                                                                          |

|                                                                                        |

|   [RECENT KEYWORDS CARD] (Background: #373940, Radius: 10px, Shadow)                  |

|     [H3] Recent Keywords (Primary Text: #dadada)                                      |

|     [Heatmap - Calendar/Timeline] (Content: #dadada)                                   |

|     [Clickable Keywords]                                                               |

|     ... (More Clickable Keywords)                                                      |

|                                                                                        |

|   [INCLUDE IMAGES CARD] (Background: #373940, Radius: 10px, Shadow)                  |

|       [H3] Include Images (Primary Text: #dadada)                                      |

|     [Switch] (Accent: #7491f7)                                                             |

|                                                                                        |

+----------------------------------------------------------------------------------------+

| [FOOTER] (Background: #202123)                                                         |

|  [Heatmap link] (Accent #7491f7)                                                 |

+----------------------------------------------------------------------------------------+
  