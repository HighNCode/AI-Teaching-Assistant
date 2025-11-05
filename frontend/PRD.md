---
title: Product Requirements Document
app: floating-armadillo-run
created: 2025-11-02T19:18:23.685Z
version: 1
source: Deep Mode PRD Generation
---

PRODUCT REQUIREMENTS DOCUMENT:
AI TEACHING ASSISTANT (MVP)

**EXECUTIVE SUMMARY**

**Product Vision:**
The AI Teaching Assistant is a productivity platform designed for tuition teachers and center owners in Singapore. It automates lesson planning, worksheet creation, and parent communication, freeing educators from repetitive tasks while improving parent satisfaction and student retention.

**Core Purpose:**
To save teachers 5–10 hours per week by streamlining lesson prep, grading support, and parent updates, while ensuring communication remains personal and aligned with MOE syllabus standards.

**Target Users:**
*   Tuition center owners (5–50 students).
*   Independent tutors with heavy teaching loads.

**MVP Key Features:**
*   **Lesson Plan & Worksheet Generator:** AI creates Singapore MOE-style plans, questions, and suggested answers.
*   **Parent Update Generator:** AI drafts personalized WhatsApp/email updates from uploaded performance data.
*   **Simple Dashboard:** Organizes all generated materials with CRUD operations and export/download options.

**Downloadable Deliverables:** Lesson plans, worksheets, and parent updates in Word or PDF.

**Complexity Assessment:** Moderate
*   **State Management:** Project-level (lesson/updates grouped by class or student).
*   **External Integrations:** 2 (LLM API, Google Forms/Sheets).
*   **Business Logic:** Moderate; requires reliable prompt engineering for syllabus alignment and parent-friendly communication.
*   **Data Synchronization:** Minimal; CSV/Google Form import only.

**MVP Success Metrics (Day 60):**
*   ≥80% of pilot teachers use the tool weekly.
*   ≥5 hours saved per teacher per week.
*   ≥70% of parents in pilot report improved satisfaction with updates.
*   ≥2 of 3 pilot centers indicate willingness to pay S$200–400/month.

---

**1. USERS & PERSONAS**

**Primary Persona: The Overworked Teacher**
*   **Name:** Mei Lin
*   **Role:** Independent tutor handling 30+ students weekly.
*   **Context:** Prepares worksheets nightly, spends weekends drafting parent messages.
*   **Goals:**
    *   Reduce prep time and admin work.
    *   Keep parents informed without sacrificing personal time.
*   **Needs:** A reliable assistant that generates MOE-aligned materials and personalized parent updates.

**Secondary Persona: The Tuition Center Owner**
*   **Name:** Arjun Patel
*   **Role:** Owner of a 40-student tuition center.
*   **Context:** Manages staff and student retention while teaching classes.
*   **Goals:**
    *   Ensure standardized, high-quality lesson prep.
    *   Centralize student reports for easy tracking.
*   **Needs:** A dashboard to manage staff output and streamline parent communications.

---

**2. FUNCTIONAL REQUIREMENTS (MVP)**

**FR-001: Project Workspace Management (Priority 0)**
*   **Description:** Users create and manage Projects to store all lesson plans, worksheets, and parent updates for a class or student group.
*   **Entity Type:** User-Generated Content
*   **User Benefit:** Keeps all teaching resources organized and accessible.
*   **Lifecycle Operations:**
    *   Create: New Project with custom name.
    *   View: List of Projects on dashboard.
    *   Delete: Deferred (Post-MVP).
*   **Acceptance Criteria:**
    *   Given a logged-in user, they can create a named Project.
    *   Dashboard lists all Projects with links to open them.
    *   Opening a Project displays its stored materials.

**FR-002: Lesson Plan & Worksheet Generator (Priority 0)**
*   **Description:** Users generate lesson plans and worksheets by providing subject, level, and topic. AI produces MOE-style structured output.
*   **Entity Type:** System-Generated Content
*   **User Benefit:** Reduces prep time by 50% while maintaining syllabus alignment.
*   **Lifecycle Operations:**
    *   Create: Generate lesson plan and worksheet.
    *   View/Edit: Teacher can review and edit outputs.
    *   Export: Save as Word/PDF.
*   **Acceptance Criteria:**
    *   Given a Project, user inputs subject, level, and topic.
    *   AI generates lesson plan with objectives, 5–10 practice questions, and suggested answers.
    *   Content follows MOE syllabus style.
    *   User can export generated files as Word/PDF.

**FR-003: Parent Update Generator (Priority 0)**
*   **Description:** System generates personalized parent communication drafts from uploaded student data.
*   **Entity Type:** System-Generated Content
*   **User Benefit:** Automates weekly parent updates while maintaining a professional, parent-friendly tone.
*   **Lifecycle Operations:**
    *   Create: Upload CSV or sync Google Form with student marks and comments.
    *   Generate: AI drafts personalized updates (per student).
    *   View/Edit: User reviews and adjusts drafts.
    *   Export: Copy drafts into WhatsApp/email.
*   **Acceptance Criteria:**
    *   Teacher uploads student performance file (CSV/Google Form).
    *   AI generates parent-friendly updates per student.
    *   Updates include progress summary, strengths/weaknesses, and encouragement/next steps.
    *   Teacher can edit before export.

**FR-004: Dashboard & Content Management (Priority 0)**
*   **Description:** A simple dashboard organizes Projects and generated content.
*   **Entity Type:** System UI
*   **User Benefit:** Single, simple view for lesson prep and parent updates.
*   **Lifecycle Operations:**
    *   Create: Add new Projects.
    *   Read: View all generated content.
    *   Update/Delete: Deferred for MVP.
    *   Export: Download Word/PDF.
*   **Acceptance Criteria:**
    *   Dashboard shows tabs: Lesson Plans, Worksheets, Parent Updates.
    *   User can click into each tab to see saved content.
    *   Export buttons are present for all generated items.

**FR-901: User Authentication (Priority 0)**
*   **Description:** Secure login and account management.
*   **Entity Type:** System/Configuration
*   **User Benefit:** Protects student data and teacher outputs.
*   **Lifecycle Operations:**
    *   Create: Register with email/password.
    *   View: Profile info.
    *   Edit: Change password.
    *   Delete: Deferred for MVP.
*   **Acceptance Criteria:**
    *   New user can register an account.
    *   Existing user can log in and out.
    *   Non-logged-in users cannot access dashboard content.
    *   User can reset password via email.

---

**3. USER WORKFLOWS (MVP)**

**Primary Workflow: Generating Lesson Plans & Parent Updates**
*   **Trigger:** Teacher receives new topic to teach and weekly student results.
*   **Outcome:** Teacher has MOE-style lesson plan, worksheet, and personalized parent updates.
*   **Steps:**
    1.  Teacher logs into the dashboard.
    2.  Creates a new Project “PSLE Math – Fractions.”
    3.  Selects “Generate Lesson Plan,” enters subject/level/topic.
    4.  AI generates lesson plan + worksheet → Teacher reviews and saves.
    5.  Teacher uploads student marks via CSV.
    6.  AI generates parent update drafts → Teacher edits → Copies to WhatsApp/email.
    7.  Dashboard stores all outputs for later access.

---

**4. BUSINESS RULES**

*   **Access Control:** A user can only see their own Projects and generated content.
*   **Data Rules:** Lesson generation requires subject, level, and topic. Parent update generation requires student performance data.
*   **Process Rules:** Teacher review is mandatory before exporting parent updates (to mitigate AI errors).

---

**5. DATA REQUIREMENTS**

*   **User:** id, email, password\_hash, created\_at
*   **Project:** id, name, user\_id
*   **LessonPlan:** id, project\_id, file\_name, content, export\_format
*   **Worksheet:** id, project\_id, file\_name, content, export\_format
*   **ParentUpdate:** id, project\_id, student\_name, file\_name, draft\_text

---

**6. INTEGRATION REQUIREMENTS**

*   **LLM API (GPT-4/Claude):** Generates lesson plans, worksheets, and parent updates. Input: structured prompts; Output: text. On-demand.
*   **Google Forms/Sheets:** Input for student performance data. Simple CSV/Google Form sync.

---

**7. FUNCTIONAL VIEWS**

*   **Login/Register Page:** Secure authentication.
*   **Dashboard:** Project list + “Create New Project” button.
*   **Project Workspace:** Tabs for Lesson Plans, Worksheets, Parent Updates. Upload area for student data. Generate/Export buttons.

---

**8. MVP SCOPE & DEFERRED FEATURES**

**In Scope:**
*   FR-001 Project Workspace
*   FR-002 Lesson Plan & Worksheet Generator
*   FR-003 Parent Update Generator
*   FR-004 Dashboard & Content Management
*   FR-901 Authentication

**Deferred (Post-MVP):**
*   **DF-001:** Auto-marking of MCQs & structured answers → Requires advanced parsing and grading logic.
*   **DF-002:** White-labeled student progress reports → Additional formatting complexity.
*   **DF-003:** Marketing content generator for FB/IG → Not core to MVP.
*   **DF-004:** Direct WhatsApp integration → Requires Business API approval.

---

**9. ASSUMPTIONS & DECISIONS**

*   Teachers will upload machine-readable CSV/Google Form outputs.
*   Standardized templates styled like MOE worksheets are acceptable for MVP.
*   AI output will always require teacher review.
*   No multi-user or team sharing in MVP (single-user per account).

---

**10. RISKS & MITIGATIONS**

*   **Risk:** AI outputs inaccurate or off-syllabus content.
    *   **Mitigation:** Require teacher review; emphasize role as assistant.
*   **Risk:** Parents distrust AI-driven messages.
    *   **Mitigation:** Brand tool as teacher-controlled; AI drafts, teacher finalizes.