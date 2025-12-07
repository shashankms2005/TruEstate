# Architecture Documentation

## Backend Architecture

### Architecture Pattern
Three-layer architecture with clear separation of concerns:

**Layers:**
1. **Presentation Layer**: Routes and Controllers
2. **Business Logic Layer**: Services
3. **Data Access Layer**: Database queries via pg Pool

**Request Flow:**
```
Client Request
    ↓
Express Server (CORS, JSON middleware)
    ↓
Routes (endpoint mapping)
    ↓
Controllers (parameter extraction & validation)
    ↓
Services (business logic & query building)
    ↓
PostgreSQL Database
    ↓
Response with JSON data
```

### Components

**Express Server (`src/index.js`)**
- Application entry point
- Middleware configuration (CORS, JSON parser)
- Route registration
- Database initialization on startup
- Global error handling
- Health check endpoint

**Database Configuration (`src/config/database.js`)**
- PostgreSQL connection pool management
- Hardcoded Railway public URL for local development
- Environment variable support for production
- Connection event handlers
- Graceful shutdown handling

**Routes (`src/routes/transactionRoutes.js`)**
- API endpoint definitions
- Maps URLs to controller methods
- Endpoints: `/api/transactions`, `/api/transactions/filter-options`

**Controllers (`src/controllers/transactionController.js`)**
- HTTP request/response handling
- Query parameter extraction and validation
- Filter parameter parsing (comma-separated to arrays)
- Service layer invocation
- Error handling with appropriate HTTP status codes

**Services (`src/services/transactionService.js`)**
- Core business logic
- Dynamic SQL query construction
- Database operations execution
- Key functions:
  - `getFilteredTransactions()`: Main query with filters, search, sort, pagination
  - `getFilterOptions()`: Retrieve distinct values for filter dropdowns
  - `buildWhereClause()`: Dynamic WHERE clause generation
  - `buildOrderByClause()`: Dynamic ORDER BY generation

**Utilities (`src/utils/`)**
- `databaseSetup.js`: Table and index creation
- `dateUtils.js`: Date parsing and formatting helpers

**Scripts (`src/scripts/`)**
- `importData.js`: CSV import utility (one-time data migration)

### Database Design

**Schema:**
```sql
Table: transactions
- id (SERIAL PRIMARY KEY)
- transaction_id, date, customer_id, customer_name, phone_number
- gender, age, customer_region, customer_type
- product_id, product_name, brand, product_category, tags
- quantity, price_per_unit, discount_percentage
- total_amount, final_amount
- payment_method, order_status, delivery_type
- store_id, store_location, salesperson_id, employee_name
- created_at (TIMESTAMP)
```

**Indexes:**
- customer_name, phone_number, customer_region
- gender, product_category, payment_method, date

### Query Optimization
- Parameterized queries prevent SQL injection
- Connection pooling for concurrent requests
- Indexed columns for fast lookups
- Batch inserts (500 rows) for data import
- Separate COUNT query for pagination metadata

---

## Frontend Architecture

### Architecture Pattern
Component-based architecture using React hooks for state management:

**Structure:**
```
Components (UI) → Hooks (State & Data) → Services (API) → Backend
```

### Key Components

**App.jsx**
- Root component
- State management orchestration
- Layout structure with Sidebar and main content
- Coordinates all child components

**Header.jsx**
- Search bar with real-time input
- Application title
- Passes search query to parent via `onSearchChange`

**FilterBar.jsx**
- Seven filter dropdowns
- Sort dropdown
- Refresh button
- Filter state management through callbacks

**FilterDropdown Component**
- Reusable dropdown with three types:
  - Checkbox (multi-select)
  - Range (min/max inputs)
  - Date range (start/end dates)
- Click-outside detection for auto-close
- Independent state per filter

**TransactionTable.jsx**
- Two view modes: Standard and Full
- Phone number copy-to-clipboard
- Loading and error states
- Empty state handling
- Responsive table layout

**Pagination.jsx**
- Smart page number display with ellipsis
- Previous/Next navigation
- Disabled states at boundaries
- Smooth scroll to top on page change

**SummaryCards.jsx**
- Statistical calculations from current page data
- Total units, amount, discount display

**LoadingSkeleton.jsx**
- Animated loading placeholder
- Mimics table structure

### State Management

**useTransactions Hook (`hooks/useTransactions.js`)**
Central state management for:
- Transactions data
- Loading and error states
- Pagination (currentPage, totalPages, totalRecords)
- Search query with debouncing
- Filters (7 types)
- Filter options (from backend)
- Sort parameters (sortBy, sortOrder)

**Custom useDebounce Hook**
- Delays value updates by 500ms
- Optimizes API calls during typing
- Prevents excessive backend requests

### API Layer

**Services (`services/api.js`)**
- Centralized API communication
- `fetchTransactions()`: Main data fetching with all parameters
- `fetchFilterOptions()`: One-time filter options load
- Query parameter construction
- Error handling

---

## Data Flow

### Initial Load
```
1. App.jsx mounts
2. useTransactions hook initializes
3. loadFilterOptions() fetches filter dropdowns
4. loadTransactions() fetches first page (default: date desc)
5. Data renders in TransactionTable
```

### Search Flow
```
1. User types in Header search input
2. setSearchQuery() updates state
3. useDebounce delays 500ms
4. useEffect triggers on debouncedSearchQuery change
5. loadTransactions() called with search param
6. Backend LOWER(customer_name) LIKE %search%
7. Results update, page resets to 1
```

### Filter Flow
```
1. User selects filter in FilterBar dropdown
2. handleFilterChange() updates filter state
3. Filters convert to comma-separated strings
4. useEffect triggers on filters change
5. API call with filter query params
6. Backend builds WHERE clause with ANY/range operators
7. Filtered results return, page resets to 1
```

### Sort Flow
```
1. User selects sort option from dropdown
2. handleSortChange() updates sortBy & sortOrder
3. useEffect triggers
4. API call with sortBy/sortOrder params
5. Backend generates ORDER BY clause
6. Sorted results return, page resets to 1
```

### Pagination Flow
```
1. User clicks page number or Next/Prev
2. handlePageChange() updates currentPage
3. Smooth scroll to top
4. useEffect triggers on currentPage change
5. API call with page param (LIMIT/OFFSET)
6. New page data renders
7. Active filters/search/sort maintained
```

### Complete Request Flow
```
Frontend: User Action
    ↓
Frontend: State Update (React hooks)
    ↓
Frontend: Query Param Construction (api.js)
    ↓
HTTP: GET /api/transactions?page=1&search=john&customerRegion=North&sortBy=date
    ↓
Backend: Express Route Handler
    ↓
Backend: Controller (parse params)
    ↓
Backend: Service (build SQL query)
    ↓
Backend: PostgreSQL Execution
    ↓
Backend: Format Response
    ↓
Frontend: Update State
    ↓
Frontend: Re-render Components
```

---

## Folder Structure

### Backend
```
backend/
├── src/
│   ├── config/
│   │   └── database.js              # PostgreSQL connection pool
│   ├── controllers/
│   │   └── transactionController.js # Request handlers
│   ├── routes/
│   │   └── transactionRoutes.js     # API endpoints
│   ├── services/
│   │   └── transactionService.js    # Business logic & queries
│   ├── scripts/
│   │   └── importData.js            # CSV import utility
│   ├── utils/
│   │   ├── databaseSetup.js         # Schema initialization
│   │   └── dateUtils.js             # Date helpers
│   └── index.js                     # Application entry
├── data/
│   └── sales_data.csv               # Not in git
├── docs/
│   └── architecture.md              # This file
├── package.json
└── README.md
```

### Frontend
```
frontend/my-app/
├── src/
│   ├── components/
│   │   ├── FilterBar.jsx            # Filter dropdowns & sort
│   │   ├── Header.jsx               # Search bar
│   │   ├── LoadingSkeleton.jsx      # Loading state
│   │   ├── Pagination.jsx           # Page navigation
│   │   ├── SideBar.jsx              # Side navigation
│   │   ├── SummaryCards.jsx         # Statistics display
│   │   └── TransactionTable.jsx     # Data table
│   ├── hooks/
│   │   └── useTransactions.js       # State management hook
│   ├── services/
│   │   └── api.js                   # API communication
│   ├── utils/
│   │   └── filterHelpers.js         # Filter utilities
│   ├── App.jsx                      # Root component
│   └── main.jsx                     # Entry point
├── public/                          # Static assets
├── package.json
└── README.md
```

---

## Module Responsibilities

### Backend Modules

**index.js**
- Bootstrap Express application
- Register middleware (CORS, JSON)
- Mount routes
- Initialize database
- Start HTTP server
- Handle graceful shutdown

**database.js**
- Create and manage PostgreSQL connection pool
- Provide database connection to other modules
- Handle connection events (connect, error)
- Support both local (public URL) and production (env var)

**transactionRoutes.js**
- Define RESTful API endpoints
- Map HTTP methods to controller functions
- Route: `GET /api/transactions`
- Route: `GET /api/transactions/filter-options`

**transactionController.js**
- Extract query parameters from request
- Validate and parse parameters
- Convert comma-separated strings to arrays
- Invoke service methods
- Format and send JSON responses
- Handle errors with appropriate status codes

**transactionService.js**
- Implement core business logic
- Build dynamic SQL queries based on filters
- Execute database operations
- Process and transform data
- Methods:
  - `getFilteredTransactions()`: Main query execution
  - `getFilterOptions()`: Get distinct filter values
  - `buildWhereClause()`: Generate WHERE conditions
  - `buildOrderByClause()`: Generate sorting clause

**databaseSetup.js**
- Create transactions table with schema
- Create performance indexes
- Verify database state on startup
- Log record counts

**importData.js**
- Read CSV file via streams
- Parse CSV data
- Batch insert to database (500 rows/batch)
- Transaction handling for data integrity
- Progress reporting

### Frontend Modules

**App.jsx**
- Root component orchestrating entire UI
- Manage global state via useTransactions hook
- Calculate summary statistics
- Handle user interactions (search, filter, sort, paginate)
- Coordinate data flow between components

**Header.jsx**
- Render search input
- Capture search query changes
- Emit search events to parent

**FilterBar.jsx**
- Render 7 filter dropdowns
- Render sort dropdown
- Render refresh button
- Manage filter interactions
- Emit filter/sort changes to parent

**FilterDropdown (within FilterBar.jsx)**
- Reusable dropdown component
- Support checkbox, range, dateRange types
- Handle click-outside to close
- Manage internal open/close state

**TransactionTable.jsx**
- Render transaction data in table format
- Support two view modes (standard/full)
- Display loading skeleton during fetch
- Show error and empty states
- Phone number copy functionality

**Pagination.jsx**
- Render page navigation controls
- Display smart page numbers with ellipsis
- Handle Previous/Next navigation
- Disable buttons at boundaries
- Trigger page changes with scroll

**SummaryCards.jsx**
- Calculate statistics from current page data
- Display total units, amount, discount
- Show transaction counts

**LoadingSkeleton.jsx**
- Provide animated loading placeholder
- Match table structure for smooth UX

**useTransactions.js**
- Custom hook for centralized state management
- Fetch transactions on dependency changes
- Fetch filter options on mount
- Implement debounced search
- Manage pagination, filters, sort state
- Return all state and setter functions

**api.js**
- Centralize API communication
- Construct query parameters
- Make HTTP requests via fetch
- Handle responses and errors
- Export fetchTransactions and fetchFilterOptions

**filterHelpers.js**
- Utility functions for filter operations
- Count active filters
- Get initial filter state
- Reusable filter logic

---

## Security & Performance

### Security Measures
- Parameterized SQL queries prevent injection
- CORS enabled for cross-origin requests
- Input validation in controllers
- No sensitive data exposure in errors

### Performance Optimizations
- Database connection pooling
- Indexed columns for fast queries
- Debounced search (500ms)
- Batch CSV imports
- Smart pagination with metadata
- Efficient WHERE clause construction
- React component memoization via hooks

### Scalability
- Stateless backend design
- Horizontal scaling capability
- Cloud database (Railway PostgreSQL)
- Efficient offset-based pagination
- Optimized SQL queries for millions of records

---

## Deployment Architecture

### Local Development
```
Frontend (localhost:5173)
    ↓ HTTP
Backend (localhost:5000)
    ↓ TCP
Railway PostgreSQL (Public URL)
```

### Production
```
Vercel (Frontend)
    ↓ HTTPS
Vercel/Railway (Backend)
    ↓ TCP (Internal Network)
Railway PostgreSQL
```

**Environment Variables:**
- Backend: `DATABASE_URL` (set by Railway)
- Backend: `PORT` (set by hosting platform)
- Frontend: `VITE_API_URL` (API endpoint)

**Data Storage:**
- CSV data imported once locally
- All data persists in PostgreSQL cloud
- No CSV files in GitHub repository