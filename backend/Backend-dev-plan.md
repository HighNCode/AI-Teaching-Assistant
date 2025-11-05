# 1️⃣ Executive Summary
- This document outlines the backend development plan for the AI Teaching Assistant, a FastAPI application designed to support tuition teachers by automating lesson planning and parent communication.
- The backend will be built with FastAPI (Python 3.13) and use MongoDB Atlas for the database. It will follow a single-branch Git workflow (`main`) and require manual testing after each task. No Docker will be used.
- The plan is divided into dynamic sprints (S0...Sn) to cover all frontend features.

# 2️⃣ In-Scope & Success Criteria
- **In-Scope Features:**
  - User authentication (signup, login, logout).
  - Project workspace management (create, view, delete projects).
  - Generation of lesson plans and worksheets via an external LLM API.
  - Generation of parent updates from uploaded data via an external LLM API.
  - Dashboard for content management (view, edit, delete, export).
- **Success Criteria:**
  - All frontend features are fully functional end-to-end.
  - All task-level manual tests pass via the UI.
  - Each sprint's code is pushed to the `main` branch after verification.

# 3️⃣ API Design
- **Base Path:** `/api/v1`
- **Error Envelope:** `{ "error": "message" }`

---

### Authentication
- **`POST /api/v1/auth/signup`**
  - **Purpose:** Register a new user.
  - **Request:** `{ "email": "user@example.com", "password": "password123" }`
  - **Response:** `{ "token": "jwt_token", "user": { "id": "...", "email": "..." } }`
  - **Validation:** Email must be unique. Password must be strong.

- **`POST /api/v1/auth/login`**
  - **Purpose:** Log in an existing user.
  - **Request:** `{ "email": "user@example.com", "password": "password123" }`
  - **Response:** `{ "token": "jwt_token", "user": { "id": "...", "email": "..." } }`
  - **Validation:** Credentials must match.

- **`POST /api/v1/auth/logout`**
  - **Purpose:** Log out a user (server-side token invalidation if needed).
  - **Request:** (Authenticated)
  - **Response:** `{ "message": "Logged out successfully" }`

- **`GET /api/v1/auth/me`**
  - **Purpose:** Get the current logged-in user's profile.
  - **Request:** (Authenticated)
  - **Response:** `{ "id": "...", "email": "..." }`

---

### Projects
- **`POST /api/v1/projects`**
  - **Purpose:** Create a new project.
  - **Request:** `{ "name": "PSLE Math - Fractions" }` (Authenticated)
  - **Response:** `{ "id": "...", "name": "...", "userId": "...", "createdAt": "..." }`

- **`GET /api/v1/projects`**
  - **Purpose:** Get all projects for the logged-in user.
  - **Request:** (Authenticated)
  - **Response:** `[{ "id": "...", "name": "...", ... }]`

- **`GET /api/v1/projects/{projectId}`**
  - **Purpose:** Get a single project by its ID.
  - **Request:** (Authenticated)
  - **Response:** `{ "id": "...", "name": "...", "lessonPlans": [], ... }`

- **`DELETE /api/v1/projects/{projectId}`**
  - **Purpose:** Delete a project.
  - **Request:** (Authenticated)
  - **Response:** `{ "message": "Project deleted" }`

---

### Content Generation
- **`POST /api/v1/projects/{projectId}/generate-lesson-plan`**
  - **Purpose:** Generate a lesson plan and worksheet.
  - **Request:** `{ "subject": "Math", "level": "PSLE", "topic": "Fractions" }` (Authenticated)
  - **Response:** `{ "lessonPlan": { ... }, "worksheet": { ... } }`

- **`POST /api/v1/projects/{projectId}/generate-parent-updates`**
  - **Purpose:** Generate parent updates from CSV data.
  - **Request:** `{ "csvData": "Name,Score\nJohn,85" }` (Authenticated)
  - **Response:** `[{ "studentName": "...", "draftText": "..." }]`

---

### Content Management
- **`POST /api/v1/projects/{projectId}/lesson-plans`**
  - **Purpose:** Save a lesson plan to a project.
  - **Request:** `{ "fileName": "...", "content": "..." }` (Authenticated)
  - **Response:** `{ "id": "...", "fileName": "...", ... }`

- **`PUT /api/v1/lesson-plans/{lessonPlanId}`**
  - **Purpose:** Update a lesson plan.
  - **Request:** `{ "content": "..." }` (Authenticated)
  - **Response:** `{ "id": "...", "content": "...", ... }`

- **`DELETE /api/v1/lesson-plans/{lessonPlanId}`**
  - **Purpose:** Delete a lesson plan.
  - **Request:** (Authenticated)
  - **Response:** `{ "message": "Lesson plan deleted" }`

- **(Similar endpoints for `worksheets` and `parent-updates`)**

# 4️⃣ Data Model (MongoDB Atlas)
- **`users` collection:**
  - `_id`: ObjectId (auto)
  - `email`: String (required, unique)
  - `password`: String (required, hashed)
  - `createdAt`: DateTime (auto)
  - **Example:** `{ "_id": ObjectId("..."), "email": "teacher@test.com", "password": "hashed_password", "createdAt": ISODate("...") }`

- **`projects` collection:**
  - `_id`: ObjectId (auto)
  - `userId`: ObjectId (ref: `users`)
  - `name`: String (required)
  - `createdAt`: DateTime (auto)
  - **Example:** `{ "_id": ObjectId("..."), "userId": ObjectId("..."), "name": "PSLE Science", "createdAt": ISODate("...") }`

- **`lesson_plans`, `worksheets`, `parent_updates` collections (similar structure):**
  - `_id`: ObjectId (auto)
  - `projectId`: ObjectId (ref: `projects`)
  - `fileName`: String
  - `content` or `draftText`: String
  - `createdAt`: DateTime (auto)
  - **Example (`lesson_plans`):** `{ "_id": ObjectId("..."), "projectId": ObjectId("..."), "fileName": "Fractions-Lesson-Plan.md", "content": "# Fractions 101...", "createdAt": ISODate("...") }`

# 5️⃣ Frontend Audit & Feature Map
- **`LoginPage`, `RegisterPage`:**
  - **Purpose:** User authentication.
  - **Endpoints:** `POST /auth/signup`, `POST /auth/login`.
  - **Models:** `User`.

- **`DashboardPage`:**
  - **Purpose:** List and create projects.
  - **Endpoints:** `GET /projects`, `POST /projects`, `DELETE /projects/{projectId}`.
  - **Models:** `Project`.

- **`ProjectWorkspacePage`:**
  - **Purpose:** Manage content within a project.
  - **Endpoints:** `GET /projects/{projectId}`, and all content management endpoints.
  - **Models:** `LessonPlan`, `Worksheet`, `ParentUpdate`.

- **`LessonPlanGenerator`:**
  - **Purpose:** Generate and save lesson plans/worksheets.
  - **Endpoints:** `POST /projects/{projectId}/generate-lesson-plan`, `POST /projects/{projectId}/lesson-plans`, `POST /projects/{projectId}/worksheets`.

- **`ParentUpdateGenerator`:**
  - **Purpose:** Generate and save parent updates.
  - **Endpoints:** `POST /projects/{projectId}/generate-parent-updates`, `POST /projects/{projectId}/parent-updates`.

# 6️⃣ Configuration & ENV Vars
- `APP_ENV`: `development` or `production`
- `PORT`: `8000`
- `MONGODB_URI`: MongoDB Atlas connection string.
- `JWT_SECRET`: Secret key for signing JWTs.
- `JWT_EXPIRES_IN`: `3600` (1 hour in seconds).
- `CORS_ORIGINS`: Frontend URL (e.g., `http://localhost:5173`).
- `LLM_API_KEY`: API key for the external AI service.

# 7️⃣ Background Work
- None required for MVP. All AI generation tasks will be synchronous.

# 8️⃣ Integrations
- **LLM API (e.g., OpenAI):**
  - **Flow:** Backend sends a structured prompt (subject, topic, etc.) to the LLM API and receives generated text content in response.
  - **Env Vars:** `LLM_API_KEY`.

# 9️⃣ Testing Strategy (Manual via Frontend)
- All testing will be performed manually through the frontend UI.
- Each task in the sprint plan includes a specific **Manual Test Step** and a **User Test Prompt**.
- After all tasks in a sprint are completed and tested, the code will be committed and pushed to `main`.

# 🔟 Dynamic Sprint Plan & Backlog

---

## S0 – Environment Setup & Frontend Connection

**Objectives:**
- Create a FastAPI skeleton with `/api/v1` base path and a `/healthz` endpoint.
- Connect to MongoDB Atlas using `MONGODB_URI`.
- Implement `/healthz` to perform a DB ping.
- Enable CORS for the frontend.
- Replace dummy API URLs in the frontend with real backend URLs.
- Initialize a Git repository, set the default branch to `main`, and create a `.gitignore` file.

**Definition of Done:**
- Backend runs locally and connects to MongoDB Atlas.
- `/healthz` returns a success status with DB connection info.
- Frontend can make requests to the backend.
- The repository is live on GitHub on the `main` branch.

**Manual Test Step:**
- Run the backend, open the frontend, and check the browser's Network tab for a successful `GET /healthz` request with a 200 OK status.
**User Test Prompt:**
> "Start the backend and refresh the app. Confirm that the network tab shows a successful connection to the backend's /healthz endpoint."

---

## S1 – Basic Auth (Signup / Login / Logout)

**Objectives:**
- Implement JWT-based signup, login, and logout.
- Protect the `/projects` routes on the backend.
- Protect the `/dashboard` page on the frontend.

**Tasks:**
- **Implement User Model and Signup:**
  - Create the `User` model.
  - Implement the `POST /auth/signup` endpoint to create a new user with a hashed password.
  - **Manual Test Step:** Use the signup form in the UI to create a new account. Check the database to confirm the user was created.
  - **User Test Prompt:** "Create a new account using the signup page and verify that you are logged in."

- **Implement Login:**
  - Implement the `POST /auth/login` endpoint to issue a JWT.
  - **Manual Test Step:** Log out and log back in with the new account. The UI should redirect to the dashboard.
  - **User Test Prompt:** "Log in with your new account and confirm you are redirected to the dashboard."

- **Implement Logout and Route Protection:**
  - Implement `POST /auth/logout` (if server-side invalidation is needed).
  - Add authentication middleware to protect project-related endpoints.
  - **Manual Test Step:** Click the logout button. Try to access the dashboard page directly; it should redirect to the login page.
  - **User Test Prompt:** "After logging out, try to access the dashboard. It should redirect you to the login page."

**Definition of Done:**
- The full authentication flow works end-to-end in the frontend.

**Post-sprint:**
- Commit and push to `main`.

---

## S2 – Project Management

**Objectives:**
- Implement CRUD operations for projects.
- Connect the frontend Dashboard page to the new project endpoints.

**Tasks:**
- **Create and View Projects:**
  - Implement `POST /projects` and `GET /projects`.
  - **Manual Test Step:** On the dashboard, create a new project. It should appear in the project list.
  - **User Test Prompt:** "Create a new project from the dashboard and verify it appears in the list."

- **Delete Projects:**
  - Implement `DELETE /projects/{projectId}`.
  - **Manual Test Step:** Delete the project created in the previous step. It should be removed from the list.
  - **User Test Prompt:** "Delete the project you created and confirm it is removed from the dashboard."

**Definition of Done:**
- Users can create, view, and delete projects from the dashboard.

**Post-sprint:**
- Commit and push to `main`.

---

## S3 – Content Generation & Management

**Objectives:**
- Integrate with the LLM API to generate content.
- Implement endpoints to manage lesson plans, worksheets, and parent updates.

**Tasks:**
- **Generate Lesson Plans & Worksheets:**
  - Implement `POST /projects/{projectId}/generate-lesson-plan`.
  - **Manual Test Step:** In the project workspace, use the "Generate New" feature for lesson plans. The generated content should appear in the UI.
  - **User Test Prompt:** "Generate a new lesson plan and worksheet. Verify the content is displayed."

- **Save and View Content:**
  - Implement endpoints to save and retrieve lesson plans and worksheets.
  - **Manual Test Step:** Save the generated lesson plan. Refresh the page; the saved plan should still be there.
  - **User Test Prompt:** "Save the generated lesson plan, then refresh the page to ensure it persists."

- **Generate and Manage Parent Updates:**
  - Implement `POST /projects/{projectId}/generate-parent-updates` and associated management endpoints.
  - **Manual Test Step:** Use the "Generate New" feature for parent updates with sample CSV data. Save the updates and verify they persist.
  - **User Test Prompt:** "Generate and save parent updates. Refresh the page to confirm they are saved."

- **Edit and Delete Content:**
  - Implement `PUT` and `DELETE` endpoints for all content types.
  - **Manual Test Step:** Edit the content of a saved lesson plan. Delete a parent update. Verify the changes are saved.
  - **User Test Prompt:** "Edit a lesson plan and delete a parent update to confirm that content management is working."

**Definition of Done:**
- Users can generate, save, view, edit, and delete all content types within a project.

**Post-sprint:**
- Commit and push to `main`.