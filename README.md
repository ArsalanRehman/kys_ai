# KYS AI

Small Node.js/Express API that routes normal REST requests and natural-language prompts to approved controller actions. The AI route uses Google Gemini function calling to choose one of the supported API actions.

## Features

- Express 5 API server
- CORS and JSON request body support
- In-memory user table for demo data
- Direct REST endpoints for test actions and users
- Gemini-powered prompt route for intent routing

## Requirements

- Node.js 20 or newer
- npm
- Google Gemini API key

## Setup

Install dependencies:

```bash
npm install
```

Create `config.env` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_MODEL` is optional. If it is not set, the app uses `gemini-2.5-flash`.

## Run

Start with the configured npm script:

```bash
npm start
```

The current script uses `nodemon app.js`. If `nodemon` is not installed on your machine, run the server directly:

```bash
node app.js
```

The API runs at:

```text
http://localhost:9090
```

All routes are mounted under `/api`.

## API Endpoints

### `GET /api/function1`

Triggers Function 1.

```bash
curl http://localhost:9090/api/function1
```

### `GET /api/function2`

Triggers Function 2.

```bash
curl http://localhost:9090/api/function2
```

### `GET /api/users`

Returns the current in-memory user table.

```bash
curl http://localhost:9090/api/users
```

### `POST /api/users`

Adds a user to the in-memory user table.

```bash
curl -X POST http://localhost:9090/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Ali Kaya",
    "dateOfBirth": "1995-06-20",
    "department": "Production"
  }'
```

Required fields:

- `username`
- `dateOfBirth` in `YYYY-MM-DD` format
- `department`

### `POST /api/getPrompt`

Sends a natural-language command to Gemini. Gemini selects one approved action, and the matching controller is executed.

```bash
curl -X POST http://localhost:9090/api/getPrompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add a user named Zeynep Arslan, born on 1998-03-14, to Human Resources."
  }'
```

Other example prompts:

```text
Show all users.
Run function 1.
Trigger function 2.
Add a user named Mehmet Demir, born on 1990-11-05, to Information Technology.
```

Supported Gemini-selected actions:

- `functionOne`
- `functionTwo`
- `readUsers`
- `writeUser`
- `rejectCommand`

## Project Structure

```text
.
|-- app.js
|-- controllers/
|   `-- testController.js
|-- routers/
|   `-- testRouter.js
|-- services/
|   `-- geminiRouter.js
|-- package.json
`-- config.env
```

## Notes

- User data is stored in memory, so added users are lost when the server restarts.
- `config.env` is ignored by Git and should not be committed.
- The Gemini router only allows known function names and rejects unrelated commands.
