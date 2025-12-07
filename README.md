# Retail Sales Management System

## Overview
A full-stack web application for managing and analyzing retail sales data with 1 million+ transaction records. Features advanced search, multi-select filtering, dynamic sorting, and pagination. Built with React frontend and Node.js/Express backend, using PostgreSQL for data persistence on Railway cloud infrastructure.

## Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS
- Lucide React
- Native Fetch API

**Backend:**
- Node.js with Express
- PostgreSQL (Railway)
- pg (node-postgres)
- csv-parser

## Search Implementation Summary
Frontend implements debounced search with 500ms delay using custom `useDebounce` hook to optimize API calls. Backend performs case-insensitive search across Customer Name and Phone Number fields using PostgreSQL LOWER() and LIKE operators with parameterized queries. Search works alongside all filters and sorting.

## Filter Implementation Summary
Frontend provides dropdown components with checkbox selection for multi-select filters and range inputs for Age and Date. Filter values are converted to comma-separated strings and sent as query parameters. Backend dynamically constructs WHERE clauses using PostgreSQL ANY operator for arrays and comparison operators for ranges. All seven filter types (Customer Region, Gender, Age Range, Product Category, Tags, Payment Method, Date Range) work independently and in combination.

## Sorting Implementation Summary
Frontend offers six sorting options through a dropdown: Customer Name (A-Z/Z-A), Date (Newest/Oldest), Quantity (High/Low). Backend generates dynamic ORDER BY clauses based on sortBy and sortOrder parameters. Sorting maintains active search and filter states through query parameters.

## Pagination Implementation Summary
Frontend displays smart pagination with ellipsis for large page counts, showing first, last, current, and adjacent pages. Backend implements offset-based pagination using LIMIT and OFFSET SQL clauses. Returns metadata including current page, total pages, total records, and page size. Page size is fixed at 10 items per page.

## Setup Instructions

### Clone Repository

```bash
git clone https://github.com/shashankms2005/TruEstate.git
cd TruEstate
```

### Backend Setup

1. Navigate to backend folder
   ```bash
   cd backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start server
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder (from root)
   ```bash
   cd frontend/my-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Update API URL in `src/services/api.js`
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

4. Start development server
   ```bash
   npm run dev
   ```
   Application runs on `http://localhost:5173`

### Live URLs
- Frontend: https://tru-estate-yi26.vercel.app/
- Backend API: https://tru-estate-ki3w.vercel.app/api