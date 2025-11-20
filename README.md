# Library-Book-Search

Simple full-stack project for searching and browsing a library of books.

## Project Structure

- `backend/` — Node.js API and data seeding scripts
	- `src/server.js` — Express server
	- `data/books.json` — seed data used by `seed.js`
	- `seed.js` — script to load or refresh data
- `frontend/my-react-app/` — React + Vite front-end

## Features

- Search books by title, author or ISBN
- Browse book details
- Minimal REST API powering the frontend

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

## Backend — Setup & Run

1. Install dependencies

```
cd backend
npm install
```

2. Seed the data (optional — uses `data/books.json`)

```
node seed.js
```

3. Start the API server

```
npm start
```

By default the server runs on the port defined in `src/config/database.js` or `src/server.js` (check the file for the exact config).

## Frontend — Setup & Run

1. Install dependencies

```
cd frontend/my-react-app
npm install
```

2. Start the dev server

```
npm run dev
```

Open the app in your browser at the URL printed by Vite (usually `http://localhost:5173`).

## Notes

- Seed data is located in `backend/data/books.json`. Edit that file to add or change entries used by `seed.js`.
- Backend code lives in `backend/src/` and the React source is in `frontend/my-react-app/src/`.

## Contributing

PRs are welcome. For small projects like this, open an issue or a pull request describing your change.

## License

This repository does not include a license file. Add one if you plan to publish or share the project publicly.
