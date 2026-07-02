# Applitracc — Frontend

The frontend is a single-page application built with React 19 and Vite 8. It provides a dashboard for tracking job applications, user authentication flows, and account settings. There are no third-party UI component libraries or CSS frameworks — all components and styles are written from scratch.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages and Routing](#pages-and-routing)
- [Running Locally](#running-locally)
  - [With Docker Compose](#with-docker-compose)
  - [Standalone Development Server](#standalone-development-server)
- [Environment Variables](#environment-variables)
- [API Client](#api-client)
  - [Authentication Flow](#authentication-flow)
  - [Silent Token Refresh](#silent-token-refresh)
- [Dashboard Features](#dashboard-features)
- [Component Overview](#component-overview)
- [Styling](#styling)
- [Testing](#testing)
- [Production Build and Deployment](#production-build-and-deployment)

---

## Tech Stack

| Concern           | Technology                                          |
| ----------------- | --------------------------------------------------- |
| Framework         | React 19                                            |
| Build tool        | Vite 8                                              |
| Routing           | React Router 7                                      |
| State management  | React built-in hooks (useState, useEffect)          |
| HTTP client       | Native Fetch API (custom wrapper in `api.js`)       |
| Testing           | Vitest 4, Testing Library (React + user-event)      |
| Linting           | ESLint 9 with react-hooks and react-refresh plugins |
| Styling           | Plain CSS modules (one `.css` file per component)   |
| Production server | nginx (Alpine Docker image)                         |

---

## Project Structure

```
src/
├── api/
│   ├── api.js            Fetch wrapper, auth helpers, all API call exports
│   └── api.test.js       Unit tests for the API client
├── assets/               Static assets (images, icons)
├── components/
│   ├── Appbar.jsx / .css         Top navigation bar
│   ├── AuthLayout.jsx / .css     Centered card layout for login and signup
│   ├── FormField.jsx / .css      Reusable labeled input field
│   └── ProtectedRoute.jsx        Route guard — redirects unauthenticated users to /login
├── pages/
│   ├── dashboard/
│   │   ├── DashboardPage.jsx      Main application management page
│   │   ├── ApplicationsTable.jsx  Editable, inline-edit table of applications
│   │   ├── DashboardHeader.jsx    Page header with title and saved indicator
│   │   ├── DashboardToolbar.jsx   Filtering and "Add" controls
│   │   ├── AddFieldModal.jsx      Modal for creating a new custom column
│   │   ├── DeleteConfirmModal.jsx Modal for confirming application deletion
│   │   └── ContextMenu.jsx        Right-click context menu on column headers
│   ├── home/
│   │   └── HomePage.jsx / .css    Public landing page
│   ├── login/
│   │   └── LoginPage.jsx / .css   Login form
│   ├── signup/
│   │   └── SignupPage.jsx / .css  Registration form
│   ├── settings/
│   │   ├── SettingsPage.jsx / .css  Settings shell with sidebar navigation
│   │   ├── AccountSection.jsx       Displays user profile information
│   │   ├── SecuritySection.jsx      Email and password update (UI scaffolded)
│   │   └── AppearanceSection.jsx    Theme/appearance preferences
│   ├── status/
│   │   └── StatusPage.jsx           Frontend health/status page
│   └── terms/
│       └── TermsPage.jsx / .css     Terms of service page
├── test/
│   └── setup.js          Vitest setup — imports jest-dom matchers
├── App.jsx               Route definitions
├── App.css
├── main.jsx              React DOM entry point
└── index.css             Global base styles
```

---

## Pages and Routing

| Path         | Component       | Protected | Description                                |
| ------------ | --------------- | --------- | ------------------------------------------ |
| `/`          | `HomePage`      | No        | Public landing page                        |
| `/login`     | `LoginPage`     | No        | Email and password login form              |
| `/signup`    | `SignupPage`    | No        | Account registration form                  |
| `/dashboard` | `DashboardPage` | Yes       | Job application tracker — main feature     |
| `/settings`  | `SettingsPage`  | Yes       | Account, security, and appearance settings |
| `/terms`     | `TermsPage`     | No        | Terms of service                           |
| `/health`    | `StatusPage`    | No        | Frontend status indicator                  |

Protected routes use `ProtectedRoute`, which checks for the presence of `email` in `localStorage`. If absent, the user is redirected to `/login`.

---

## Running Locally

### With Docker Compose

From the repository root:

```bash
make up
```

The frontend is available at http://localhost:3000. In this mode, nginx serves the production build and proxies `/api/` requests to the backend container.

### Standalone Development Server

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server starts at http://localhost:5173. It proxies all requests to `/api` to `http://localhost:8080`, so the backend must be running (either locally or via `make backend`).

---

## Environment Variables

Set these in a `.env` file at the root of the `frontend/` directory or in the Vercel dashboard.

| Variable       | Description                                                                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Base URL for API requests. Defaults to `/api` (relative, for nginx proxy). Set to the full backend URL (e.g. `https://api.applitracc.com/api`) when deploying frontend and backend to separate origins. |

---

## API Client

All server communication is centralized in `src/api/api.js`. It exports individual named functions for each operation, keeping the rest of the application decoupled from HTTP concerns.

### Authentication Flow

1. On login, the server returns an access token in the response body and sets an `HttpOnly` cookie containing the refresh token.
2. The access token is stored in a module-level variable (`_accessToken`) — not in `localStorage` or `sessionStorage`. This means JavaScript running in other contexts (e.g., injected scripts) cannot read it, mitigating XSS token theft.
3. Non-sensitive values (email, first name, last name) are stored in `localStorage` for display purposes across page refreshes.
4. On logout, the server revokes the refresh token, clears the cookie, and the client clears `_accessToken` and `localStorage`.

### Silent Token Refresh

When any protected API call returns a `401 Unauthorized` response, the client automatically:

1. Sends a `POST /api/auth/refresh` request. The browser automatically includes the `HttpOnly` refresh cookie — no JavaScript handling is required.
2. Stores the new access token in memory.
3. Retries the original failed request with the new token.

A single-flight guard (`refreshPromise`) ensures that if multiple requests fail simultaneously with a `401`, only one refresh call is made and all callers wait on the same promise. This prevents redundant refresh requests and race conditions.

If the refresh request itself fails (e.g., the refresh token is expired or revoked), the client clears auth state and redirects the user to `/login`.

---

## Dashboard Features

The dashboard is the core of the application. It provides an inline-editable table of job applications.

**Inline editing**: Every cell in the applications table is directly editable. Changes are tracked per-row using a `_isDirty` flag. Rows are not sent to the server until the user explicitly saves.

**Adding applications**: A toolbar button inserts a new blank row at the top of the table with default values (status: Applied, date: today). The new row is marked `_isNew` and `_isDirty` until saved.

**Saving**: Dirty rows are detected and a single save operation is triggered. New rows call `POST /api/applications` and existing dirty rows call `PUT /api/applications/{id}`. After a successful save, row state is reset and a "Saved at" timestamp is shown in the header.

**Deleting**: A delete button on each row opens a confirmation modal before calling `DELETE /api/applications/{id}`.

**Filtering**: The toolbar provides a status dropdown and a company name search input. Filters are applied by re-fetching from the server with the appropriate query parameters.

**Sorting**: Column headers are clickable to sort by status, salary, or applied date. Sort state is toggled between ascending and descending.

**Custom columns**: Users can add custom columns via the "Add Field" modal. New column names are sent to `POST /api/columns`. The column is then shown in the table and each cell is editable. Columns can be removed via a right-click context menu on the header, which calls `DELETE /api/columns/{id}` and removes the column and all its values.

**Pagination**: Applications are fetched page-by-page from the backend. The table shows the current page of results.

---

## Component Overview

| Component            | Purpose                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `Appbar`             | Top navigation bar with the app logo, user avatar/initials, and nav links |
| `AuthLayout`         | Reusable centered card wrapper for the login and signup pages             |
| `FormField`          | Labeled form input with built-in error display                            |
| `ProtectedRoute`     | Wrapper that redirects unauthenticated users away from protected pages    |
| `DashboardPage`      | Orchestrates all dashboard state: rows, columns, filters, sort, modals    |
| `ApplicationsTable`  | Renders the scrollable, inline-editable data table                        |
| `DashboardHeader`    | Shows the page title and the "Saved at" timestamp after a successful save |
| `DashboardToolbar`   | Filter controls, "Add application" button, and "Add field" button         |
| `AddFieldModal`      | Controlled modal form for naming and creating a new custom column         |
| `DeleteConfirmModal` | Confirmation dialog before a destructive delete operation                 |
| `ContextMenu`        | Positioned context menu triggered by right-clicking a column header       |

---

## Styling

Each component has a co-located `.css` file using plain class-based CSS. There is no CSS-in-JS, no Tailwind, and no component library. Global reset and typography styles are defined in `src/index.css`. Component styles are imported directly into the corresponding `.jsx` file.

---

## Testing

Tests use Vitest as the test runner and Testing Library for rendering and interacting with React components.

```bash
npm test          # Run all tests once
npm run test:watch  # Watch mode
```

The test setup file (`src/test/setup.js`) imports `@testing-library/jest-dom` to extend Vitest's `expect` with DOM-specific matchers such as `toBeInTheDocument` and `toHaveValue`.

---

## Production Build and Deployment

**Build:**

```bash
npm run build
```

Outputs a static bundle to `dist/`.

**Docker:**

The `Dockerfile` performs a multi-stage build: the first stage compiles the React application with Vite, and the second stage copies the output into an nginx Alpine image. The `nginx.conf` configures:

- SPA fallback routing: all paths that do not match a static file are served `index.html`, allowing React Router to handle client-side navigation.
- API proxy: requests to `/api/` are forwarded to the backend container at `http://backend:8080/api/`.

**Vercel:**

The frontend is configured for Vercel via `vercel.json`. Set `VITE_API_URL` in the Vercel project environment to the full deployed backend API base URL (e.g. `https://your-backend.railway.app/api`).
