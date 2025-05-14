
# Controllers Reference (`/controllers/`)

## Overview
Controllers handle the HTTP request/response cycle, implementing the business logic between routes and models.

Each controller file contains functions that process requests for specific resource types and return appropriate responses.

---

## 📚 Controller Categories

| Controller File   | Responsibilities                                         | Related Routes     |
|-------------------|----------------------------------------------------------|--------------------|
| `authController`  | User authentication and registration                    | `/api/auth/*`      |
| `paperController` | Paper upload, retrieval, and management                  | `/api/papers/*`    |
| `tagController`   | Tag creation and retrieval                               | `/api/tags/*`      |
| `categoryController` | Category management                                    | `/api/categories/*`|
| `devController`   | Development utilities                                   | `/dev/*`           |
| `userController`  | User data management (including author filtering)        | `/api/users/*`     |

---

### 🔐 **authController.js**

Handles user authentication, registration, and session management.

| Function        | Description                                    | Endpoint              | Request Body             |
|-----------------|------------------------------------------------|-----------------------|--------------------------|
| `register`      | Registers a new author user                    | `POST /api/auth/register` | `institution`, `username`, `fname`, `lname`, `email`, `password` |
| `registerAdmin` | Registers a new admin user                    | `POST /api/auth/register-admin` | `institution`, `username`, `fname`, `lname`, `email`, `password` |
| `login`         | Authenticates user and issues JWT              | `POST /api/auth/login`   | `email`, `password`     |
| `logout`        | Client-side logout helper                      | `POST /api/auth/logout`  | None                    |

**Dependencies:**
- `jsonwebtoken`: For JWT generation and validation
- `bcrypt`: For password hashing and comparison
- `userModel`: For user database operations

---

### 📄 **paperController.js**

Manages paper uploads, retrieval, updates, and deletion.

| Function        | Description                                    | Endpoint              | Request Body/Query       |
|-----------------|------------------------------------------------|-----------------------|--------------------------|
| `uploadPaper`   | Uploads paper to cloud storage                 | `POST /api/papers/`    | `file` (multipart)       |
| `localUploadPaper` | Uploads paper to local storage               | `POST /api/papers/local` | `file`, `name`, `category`, `publisher`, `coauthors[]`, `tags[]`, `description`, `meta` |
| `getPapers`     | Retrieves papers with optional filters         | `GET /api/papers/`     | Query params: `id`, `category`, `tag`, `publisher_id`, `author_id`, `q`, `offset`, `limit` |
| `getPaperById`  | **Deprecated** - Gets paper by ID              | `GET /api/papers/:id`  | None                    |
| `updatePaper`   | Updates paper metadata                         | `PUT /api/papers/:id`  | Paper data              |
| `deletePaper`   | Deletes a paper                                | `DELETE /api/papers/:id` | None                    |

**Dependencies:**
- `multerConfig`: For file upload handling
- `paperModel`: For paper database operations

**Notes:**
- Maximum of 10 tags per paper
- Default pagination limit is 30 records per request

---

### 🏷️ **tagController.js**

Handles tag creation and retrieval operations.

| Function        | Description                                    | Endpoint              | Request Body/Query       |
|-----------------|------------------------------------------------|-----------------------|--------------------------|
| `getTags`       | Retrieves tags with optional filters           | `GET /api/tags/`       | Query params: `field`, `id`, `q` |
| `addTags`       | Adds multiple tags to a field                  | `POST /api/tags/`      | `field`, `tags[]`         |
| `addTag`        | Adds a single tag                              | `POST /api/tags/single` | `field`, `tag`           |

**Dependencies:**
- `tagModel`: For tag database operations

**Validation:**
- Tags must be provided as arrays for bulk operations
- Single tag endpoint rejects arrays
- Field name is required for all operations

---

### 🗂️ **categoryController.js**

Manages research paper categories.

| Function        | Description                                    | Endpoint              | Request Body             |
|-----------------|------------------------------------------------|-----------------------|--------------------------|
| `getCategories` | Retrieves all available categories             | `GET /api/categories/` | None                    |
| `addCategories` | Creates a new category                         | `POST /api/categories/` | `category`              |

**Dependencies:**
- `categoryModel`: For category database operations

**Validation:**
- Prevents duplicate category creation

---

### 🛠️ **devController.js**

Development utilities for database management.

| Function        | Description                                    | Endpoint              | Request Body/Query       |
|-----------------|------------------------------------------------|-----------------------|--------------------------|
| `readTable`     | Displays contents of a database table          | `GET /dev/readtable`   | Query: `table`           |
| `resetTable`    | Resets a specific table                        | `DELETE /dev/table`    | Query: `table`           |
| `resetTables`   | Resets all database tables                     | `DELETE /dev/tables`   | None                    |
| `restoreTables` | Restores database from backup                  | `GET /dev/restore`     | `backupFile`             |

**Dependencies:**
- `devModel`: For development database operations

**Warning:**
- These endpoints should only be available in development environments
- Only accessible to admin users

---

### 👤 **userController.js**

Handles user-related actions, including fetching user data and filtering authors.

| Function        | Description                                    | Endpoint              | Request Body/Query       |
|-----------------|------------------------------------------------|-----------------------|--------------------------|
| `getUser`       | Retrieves authenticated user details           | `GET /api/users/`      | None (JWT required)      |
| `filterAuthors` | Filters authors based on name and limit        | `GET /api/users/authors` | Query params: `name`, `limit` |

**Dependencies:**
- `userModel`: For user database operations

**Notes:**
- `name` can be used for partial search (e.g., `Mark` will match `Mark` and `Mark Victor`)
- `limit` caps the result to a maximum of 15 authors

--- 
