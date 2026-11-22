# PRADUMN BHARAT SAINDANE
### Software Engineer | Full-Stack Developer | AI Product Builder

<p align="center">
  <a href="https://praduman-portfolio-five.vercel.app/">Live Portfolio</a> •
  <a href="https://github.com/Pradumnsaindane">GitHub</a> •
  <a href="mailto:psaindane09@gmail.com">Contact</a>
</p>

---

## Portfolio Engineering System

An interactive, odometer-inspired developer portfolio engineered as a lightweight client-server application.

The application combines a mechanically inspired visual experience with a data-driven frontend, a Node.js API, server-side contact validation, and Vercel deployment support.

**Engineering focus:** Interactive UI engineering, API-driven rendering, modular architecture, backend development, and deployment.

## System Architecture

```text
                  PORTFOLIO APPLICATION
                          |
              +-----------+-----------+
              |                       |
          FRONTEND                  BACKEND
              |                       |
         index.html               Node.js API
         style.css                    |
         app.js                 HTTP / File System
              |                       |
              +--------- API ---------+
                         |
                    /api/content
                         |
                     content.json
                         |
                  Dynamic Rendering
```

## Repository Structure

```text
portfolio/
│
├── backend/
│   ├── data/
│   │   ├── content.json
│   │   └── messages.json
│   │
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── vercel.json
└── README.md
```

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js |
| API | HTTP REST endpoints |
| Storage | JSON file-based storage |
| Runtime | Node.js built-in modules |
| Deployment | Vercel |
| Architecture | Client-server, API-driven rendering |

## Core Features

- Interactive mechanical odometer animation.
- Eight dynamic portfolio scenes.
- Data-driven project and technical-stack rendering.
- Interactive PULL mechanism.
- Animated résumé ID card.
- Global adaptive cursor experience.
- Responsive navigation.
- Grayscale-to-color profile photograph transition.
- Reduced-motion accessibility support.
- Server-side contact-form validation.
- JSON-based local contact submission storage.
- API-driven portfolio content management.

## API Reference

**Local base URL:**

```text
http://localhost:3000
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| GET | `/api/content` | Complete portfolio content |
| GET | `/api/scenes` | Odometer scenes |
| GET | `/api/projects` | Project collection |
| GET | `/api/stack` | Technical stack |
| GET | `/api/experience` | Experience entries |
| POST | `/api/contact` | Contact-form submission |

### Contact API

**Request**

```json
{
  "name": "Your Name",
  "email": "your@email.com",
  "message": "Let's connect."
}
```

**Success response — 201 Created**

```json
{
  "ok": true,
  "id": "submission-id"
}
```

**Validation response — 422 Unprocessable Entity**

```json
{
  "ok": false,
  "errors": []
}
```

The backend validates incoming submissions before storing them.

## Local Development

### Prerequisites

- Node.js
- Git
- Terminal or code editor

### Clone the repository

```bash
git clone https://github.com/Pradumnsaindane/pradumn-saindane-portfolio.git
```

### Navigate to the backend

```bash
cd pradumn-saindane-portfolio/backend
```

### Start the server

```bash
node server.js
```

Open the application:

```text
http://localhost:3000
```

No dependency installation or frontend build step is required for the described local setup.

The backend also supports `npm start` and `npm run dev` through its package configuration.

## Content Management

All portfolio content is maintained in:

```text
backend/data/content.json
```

Example structure:

```json
{
  "profile": {
    "resumeUrl": "",
    "linkedinUrl": ""
  },
  "scenes": [],
  "projects": [],
  "stack": [],
  "experience": []
}
```

Update this file to modify the profile, scenes, projects, technologies, and experience entries.

### Profile configuration

Configure these values with your actual URLs:

- `profile.resumeUrl`
- `profile.linkedinUrl`

Experience entries can follow this structure:

```json
{
  "role": "Role",
  "org": "Organization",
  "period": "Time period",
  "note": "Description"
}
```

The experience collection is currently empty until actual entries are added.

## Contact Processing

The contact form follows this workflow:

```text
User submits form
        |
        v
POST /api/contact
        |
        v
Server-side validation
        |
    +---+---+
    |       |
  Valid   Invalid
    |       |
    v       v
JSON      422 Error
Storage   Response
    |
    v
201 Created
```

### Current implementation

- Server-side input validation.
- Local JSON-based message storage.
- Automatic creation of the messages file on first submission.
- Explicit success and validation responses.

**Important:** No email delivery provider is currently configured. Messages are stored locally but are not automatically emailed.

Local storage location:

```text
backend/data/messages.json
```

## Deployment

**Live website:**  
[https://praduman-portfolio-five.vercel.app/](https://praduman-portfolio-five.vercel.app/)

The root `vercel.json` configures frontend delivery and API routing through a Vercel Function.

### Deployment steps

1. Connect the GitHub repository to Vercel.
2. Configure the project using the existing `vercel.json`.
3. Verify frontend and API routing.
4. Configure résumé and LinkedIn URLs.
5. Verify production API responses.

### Production storage limitation

Vercel Functions do not provide durable local filesystem storage.

Therefore, persistent contact submissions are unavailable on Vercel until a durable storage provider is configured.

The local JSON storage implementation is intended for local development.

## Engineering Roadmap

The following are proposed improvements, not currently implemented features.

| Area | Planned improvement |
|---|---|
| Database | PostgreSQL integration |
| Contact system | Email notification integration |
| Security | Rate limiting and spam protection |
| Validation | Expanded API validation |
| Monitoring | Structured logging and observability |
| Storage | Persistent production storage |
| Testing | Automated API and browser regression tests |

## Engineering Principles

- **Separation of concerns:** Independent frontend and backend responsibilities.
- **Data-driven rendering:** Portfolio content is retrieved through API endpoints.
- **Minimal dependencies:** Native Node.js modules where appropriate.
- **Explicit error handling:** Clear responses for unsuccessful operations.
- **Accessibility:** Responsive behavior and reduced-motion support.
- **Maintainability:** Structured content and modular frontend assets.

---

## About

**Pradumn Bharat Saindane**

Software Engineer | Full-Stack Developer | AI Product Builder

Interested in building scalable software, interactive digital experiences, backend systems, and AI-powered products.

### Connect

- **Portfolio:** https://praduman-portfolio-five.vercel.app/
- **GitHub:** https://github.com/Pradumnsaindane
- **LeetCode:** https://leetcode.com/u/Pradum_saindane/
- **HackerRank:** https://www.hackerrank.com/profile/psaindane09
- **X:** https://x.com/pradumncodes7
- **Email:** psaindane09@gmail.com

---

<p align="center">
  <strong>Designed with intent. Engineered with precision.</strong>
  <br/>
  <sub>Pradumn Bharat Saindane | Portfolio Engineering</sub>
</p>
