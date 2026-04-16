# MediPort

MediPort is a desktop-first medical record management application built with Electron, Express, and MongoDB.  
It supports secure authentication, medical readings management, and device-assisted data entry workflows.

## Tech Stack

- Node.js + Express
- Electron
- MongoDB + Mongoose
- Vanilla JavaScript frontend

## Features

- JWT-based authentication
- Medical readings CRUD APIs
- Device integration and simulated device data
- Import workflow for records
- Responsive dashboard UI

## Project Structure

```text
.
├── Public/          # Frontend assets
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── server.js        # Express app and API entry
├── main.js          # Electron main process
└── package.json
```

## Prerequisites

- Node.js 18+ recommended
- MongoDB running locally (`mongodb://127.0.0.1:27017/medical_readings`)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Update values if needed

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/medical_readings
PORT=8080
NODE_ENV=development
```

## Run Locally

Install dependencies:

```bash
npm install
```

Run backend server:

```bash
npm run server
```

Run Electron app:

```bash
npm start
```

For backend auto-reload in development:

```bash
npm run dev
```

## Packaging

Build distributables:

```bash
npm run package
```

## Notes

- Sensitive files (like `.env`) and generated artifacts are excluded via `.gitignore`.
- This repository is cleaned for source-first GitHub publishing.


