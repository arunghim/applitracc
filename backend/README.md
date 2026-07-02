# Applitracc — Backend

The backend is a RESTful API built with Spring Boot 4 and Java 17. It manages user accounts, job application records, and user-defined custom columns. Authentication is stateless and uses a short-lived JWT access token paired with a long-lived refresh token stored in an `HttpOnly` cookie.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
  - [With Docker Compose (recommended)](#with-docker-compose-recommended)
  - [Standalone (requires local PostgreSQL)](#standalone-requires-local-postgresql)
- [Database Migrations](#database-migrations)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Job Applications](#job-applications)
  - [Custom Columns](#custom-columns)
  - [Health](#health)
- [Authentication and Security Design](#authentication-and-security-design)
- [Data Model](#data-model)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Tech Stack

| Concern          | Technology                              |
| ---------------- | --------------------------------------- |
| Runtime          | Java 17                                 |
| Framework        | Spring Boot 4.0.5                       |
| Web layer        | Spring MVC (REST)                       |
| Persistence      | Spring Data JPA, Hibernate              |
| Database         | PostgreSQL 17                           |
| Migrations       | Flyway                                  |
| Security         | Spring Security, JWT (JJWT 0.12.6)      |
| Password hashing | BCrypt                                  |
| Validation       | Jakarta Bean Validation                 |
| Build tool       | Maven (Maven Wrapper included)          |
| Testing          | JUnit 5, Mockito (via Spring Boot Test) |

---

## Project Structure

```
src/main/java/com/applitracc/backend/
├── ApplitraccApplication.java     Entry point
├── api/                           Shared response envelope types (ApiResponse, ErrorCode)
├── config/                        CORS configuration
├── controller/                    HTTP layer — maps routes to service calls
│   ├── AuthController.java        /api/auth/*
│   ├── JobApplicationController.java  /api/applications/*
│   ├── CustomColumnController.java    /api/columns/*
│   └── HealthController.java      /api/health
├── dto/                           Request and response data transfer objects
├── exception/                     ApiException + GlobalExceptionHandler
├── mapper/                        Entity <-> DTO conversion
├── model/                         JPA entities
│   ├── AppUser.java
│   ├── JobApplication.java
│   ├── JobStatus.java             Enum: SAVED, APPLIED, INTERVIEW, OFFER, ACCEPTED, REJECTED
│   ├── CustomColumn.java
│   ├── CustomColumnValue.java
│   └── RefreshToken.java
├── repository/                    Spring Data JPA repositories
├── security/
│   ├── SecurityConfig.java        Filter chain, CORS, session policy
│   └── JwtAuthenticationFilter.java  Extracts and validates Bearer tokens per request
└── service/
    ├── AuthService.java           Registration, login, token refresh, logout
    ├── JwtService.java            Token generation and validation
    ├── RefreshTokenService.java   Refresh token lifecycle (create, validate, revoke)
    ├── JobApplicationService.java CRUD + filtering for job applications
    ├── CustomColumnService.java   Custom column management
    ├── UserService.java           User lookup and persistence
    └── AppUserDetailsService.java Spring Security UserDetailsService implementation

src/main/resources/
├── application.properties
└── db/migration/
    └── V1__init_schema.sql        Initial schema (all tables)
```

---

## Configuration

All configuration is driven by environment variables with sensible defaults for local development. Production values must be supplied through the deployment environment.

| Property                    | Environment Variable         | Default                                       | Description                              |
| --------------------------- | ---------------------------- | --------------------------------------------- | ---------------------------------------- |
| Server port                 | `PORT`                       | `8080`                                        | HTTP port the server binds to            |
| Database URL                | `SPRING_DATASOURCE_URL`      | `jdbc:postgresql://localhost:5432/applitracc` | JDBC connection string                   |
| Database username           | `SPRING_DATASOURCE_USERNAME` | `postgres`                                    |                                          |
| Database password           | `SPRING_DATASOURCE_PASSWORD` | `postgres`                                    |                                          |
| JWT signing secret          | `JWT_SECRET`                 | (required)                                    | Base64-encoded HMAC-SHA key              |
| Access token lifetime       | `JWT_ACCESS_EXPIRATION`      | `900000` (15 min)                             | Milliseconds                             |
| Refresh token lifetime      | `JWT_REFRESH_EXPIRATION`     | `604800000` (7 days)                          | Milliseconds                             |
| Cookie `Secure` flag        | `COOKIE_SECURE`              | `false`                                       | Set to `true` in production (HTTPS only) |
| Cookie `SameSite` attribute | `COOKIE_SAME_SITE`           | `Lax`                                         | `Strict`, `Lax`, or `None`               |
| Allowed CORS origins        | `CORS_ALLOWED_ORIGINS`       | `http://localhost:5173,http://localhost:3000` | Comma-separated list of allowed origins  |

---

## Running Locally

### With Docker Compose (recommended)

From the repository root:

```bash
make up
```

This starts PostgreSQL, runs Flyway migrations, and starts the backend on port 8080. No local Java installation is required.

### Standalone (requires local PostgreSQL)

```bash
cd backend

# Set required environment variable
export JWT_SECRET=<your-base64-encoded-secret>

# Run with Maven Wrapper
./mvnw spring-boot:run
```

The application expects a PostgreSQL instance at `localhost:5432` with a database named `applitracc`. Create it with:

```sql
CREATE DATABASE applitracc;
```

---

## Database Migrations

Schema management is handled entirely by Flyway. Migration scripts live in `src/main/resources/db/migration/` and follow the naming convention `V{version}__{description}.sql`. Flyway runs automatically on application startup and applies any pending migrations in order.

The initial migration (`V1__init_schema.sql`) creates the following tables:

- `app_users` — user accounts
- `job_applications` — application records linked to a user
- `custom_columns` — user-defined column definitions
- `custom_column_values` — per-application values for each custom column
- `refresh_tokens` — server-side refresh token records with revocation support

---

## API Reference

All API responses use a consistent envelope structure:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

Error responses include an additional `errorCode` field from a typed enum to allow the frontend to handle specific error cases programmatically.

### Authentication

All auth endpoints are public (no JWT required).

#### Register

```
POST /api/auth/register
```

**Request body:**

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": "User registered successfully"
}
```

---

#### Login

```
POST /api/auth/login
```

**Request body:**

```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`

Sets an `HttpOnly` cookie named `refreshToken` (path `/api/auth`).

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<access-jwt>",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe"
  }
}
```

---

#### Refresh Access Token

```
POST /api/auth/refresh
```

No request body. Reads the `refreshToken` cookie automatically. Issues a new access token and rotates the refresh token (old token is revoked).

**Response:** `200 OK` — same shape as login response, new cookie set.

---

#### Logout

```
POST /api/auth/logout
```

Revokes the refresh token in the database and instructs the browser to clear the cookie by setting `Max-Age=0`.

**Response:** `200 OK`

---

### Job Applications

All endpoints require a valid `Authorization: Bearer <access-token>` header. Requests are scoped to the authenticated user — users can only access their own applications.

#### Create Application

```
POST /api/applications
```

**Request body:**

```json
{
  "company": "Acme Corp",
  "role": "Software Engineer",
  "salary": "$120,000",
  "status": "APPLIED",
  "appliedDate": "2024-06-15",
  "link": "https://jobs.acme.com/posting/123",
  "notes": "Referred by a former colleague.",
  "customValues": {
    "42": "Remote"
  }
}
```

`status` must be one of: `SAVED`, `APPLIED`, `INTERVIEW`, `OFFER`, `ACCEPTED`, `REJECTED`.

`customValues` is a map of custom column ID (as string key) to the desired value for that column.

**Response:** `201 Created` — returns the created application with its assigned `id`, `createdAt`, and `updatedAt`.

---

#### Get All Applications

```
GET /api/applications
```

Supports pagination and filtering.

| Query parameter | Type   | Description                                          |
| --------------- | ------ | ---------------------------------------------------- |
| `status`        | string | Filter by status (e.g. `APPLIED`, `INTERVIEW`)       |
| `company`       | string | Filter by company name (exact match)                 |
| `page`          | int    | Zero-based page number (default `0`)                 |
| `size`          | int    | Page size (default `20`)                             |
| `sort`          | string | Spring Pageable sort format, e.g. `appliedDate,desc` |

**Response:** `200 OK` — Spring `Page<JobApplicationDTO>` wrapped in the standard envelope.

---

#### Get Single Application

```
GET /api/applications/{appId}
```

**Response:** `200 OK`

---

#### Update Application

```
PUT /api/applications/{appId}
```

Request body has the same shape as the create endpoint. All fields are replaced.

**Response:** `200 OK` — returns the updated application.

---

#### Delete Application

```
DELETE /api/applications/{appId}
```

**Response:** `204 No Content`

---

### Custom Columns

Custom columns extend the default schema with user-defined fields. Each user maintains their own column list. When a column is created, it applies to all of that user's applications. When deleted, all associated values are cascade-deleted.

#### Get Columns

```
GET /api/columns
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Columns retrieved",
  "data": [
    { "id": 42, "name": "Work Arrangement" },
    { "id": 43, "name": "Recruiter Name" }
  ]
}
```

---

#### Add Column

```
POST /api/columns
```

**Request body:**

```json
{ "name": "Work Arrangement" }
```

**Response:** `201 Created`

---

#### Delete Column

```
DELETE /api/columns/{columnId}
```

**Response:** `204 No Content`

---

### Health

```
GET /api/health
```

Public endpoint used by Railway for readiness checks.

**Response:** `200 OK`

---

## Authentication and Security Design

**Password storage**: Passwords are hashed with BCrypt before being written to the database. Plaintext passwords are never persisted.

**Access token**: A short-lived JWT (default 15 minutes) signed with HMAC-SHA using the configured secret key. The token is returned in the login/refresh response body and is stored in JavaScript module memory on the client — not in `localStorage` or `sessionStorage`. This prevents the token from being exfiltrated by XSS attacks. When the page is refreshed, the silent refresh flow restores it transparently.

**Refresh token**: An opaque UUID stored in the `refresh_tokens` table. It is delivered to and read from the browser exclusively via an `HttpOnly`, `Path=/api/auth` cookie, which means JavaScript has no access to it. Each successful refresh rotates the token (the old token is revoked and a new one is issued).

**Stateless session**: The server holds no HTTP session. `SessionCreationPolicy.STATELESS` is set explicitly. Each request is authenticated independently via the `JwtAuthenticationFilter`.

**CORS**: Allowed origins are configured via the `CORS_ALLOWED_ORIGINS` environment variable, preventing cross-origin requests from unauthorized domains.

**Request authorization**: All routes except `/api/auth/**` and `/api/health` require a valid access token. All data access is scoped to the authenticated user's ID, which is derived from the JWT subject — not from any user-supplied value in the request body or path.

---

## Data Model

```
app_users
  id (PK), first_name, last_name, email (unique), password (bcrypt)

job_applications
  id (PK), user_id (FK -> app_users), company, role, salary,
  status (enum), notes, link, applied_date,
  created_at, updated_at

custom_columns
  id (PK), user_id (FK -> app_users), name, created_at

custom_column_values
  id (PK), job_application_id (FK -> job_applications),
  custom_column_id (FK -> custom_columns), value

refresh_tokens
  id (PK), token (unique), user_id (FK -> app_users),
  expires_at, revoked
```

---

## Testing

Tests are located in `src/test/java/com/applitracc/backend/`. The suite uses JUnit 5 and Mockito.

```bash
./mvnw test
```

Test reports are written to `target/surefire-reports/`.

---

## Deployment

The backend is configured for Railway using `railway.toml`:

- Builder: Dockerfile
- Health check path: `/api/health`
- Health check timeout: 60 seconds
- Restart policy: on failure

Set the following environment variables in the Railway project dashboard:

- `JWT_SECRET`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=None` (if frontend and backend are on different domains)
- `CORS_ALLOWED_ORIGINS` (the deployed frontend URL)
