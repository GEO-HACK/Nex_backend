
# 📡 API Routes Reference (`/api/`)

## Swagger/OpenAPI spec available
A Swagger/OpenAPI spec is available for this API.

You can use it to:
- Explore all routes and expected payloads
- Test requests interactively
- Inspect role-based access and headers
- Avoid guessing what a route expects or returns

### How to use
- Open [https://editor.swagger.io](https://editor.swagger.io)
- Paste the contents of the `swagger.yaml` file
- Use the “Authorize” button to add your JWT if needed

Alternatively, import the YAML file into Postman via:
> **Postman → APIs → Import → OpenAPI**

---

## 📚 Route Categories

| Route Group | Path Prefix     | Description                    |
|-------------|------------------|--------------------------------|
| Auth        | `/api/auth`      | User registration & login      |
| Papers      | `/api/papers`    | Upload, view, update papers    |
| Categories  | `/api/categories`| Manage research categories     |
| Tags        | `/api/tags`      | Tagging system for papers      |
| Dev Tools   | `/dev`           | Reset DB, restore backups, etc |

*(Scroll down for route details for each group)*

---



### 🧑‍💻 **Auth Routes** (`/api/auth`)
| Method | Endpoint              | Auth Required | Roles      | Description                       |
|--------|-----------------------|----------------|------------|-----------------------------------|
| POST   | `/register`           | ❌             | –          | Register a new user               |
| POST   | `/register-admin`     | ✅             | admin      | Register a new admin              |
| POST   | `/login`              | ❌             | –          | Login and receive auth token      |
| POST   | `/logout`             | ❌             | –          | Logout user (handled on client)   |
| GET    | `/user`               | ✅             | any        | Get currently logged-in user info |

---

### 📁 **Paper Routes** (`/api/papers`)
| Method | Endpoint              | Auth Required | Roles           | Description                         |
|--------|-----------------------|----------------|------------------|-------------------------------------|
| GET    | `/`                   | ❌             | –                | Get all uploaded papers             |
| POST   | `/`                   | ✅             | admin, author    | Upload paper (multipart form-data) |
| POST   | `/local`              | ❌             | –                | Local file upload (for dev/test)    |
| PUT    | `/:id`                | ✅             | admin, author    | Update paper by ID                  |
| DELETE | `/:id`                | ✅             | admin, author    | Delete paper by ID                  |

---

### 🏷️ **Tag Routes** (`/api/tags`)
| Method | Endpoint              | Auth Required | Roles      | Description                      |
|--------|-----------------------|----------------|------------|----------------------------------|
| GET    | `/`                   | ❌             | –          | Get all tags                     |
| POST   | `/`                   | ✅             | admin      | Add multiple tags                |
| POST   | `/single`             | ✅             | admin      | Add a single tag                 |

---

### 🗂️ **Category Routes** (`/api/categories`)
| Method | Endpoint              | Auth Required | Roles      | Description                      |
|--------|-----------------------|----------------|------------|----------------------------------|
| GET    | `/`                   | ❌             | –          | Get all categories               |
| POST   | `/`                   | ✅             | admin      | Add a new category               |

---

### 🛠️ **Dev Routes** (`/dev`)
**Note:** Only available to `admin` users during development.

| Method | Endpoint              | Auth Required | Roles      | Description                      |
|--------|-----------------------|----------------|------------|----------------------------------|
| DELETE | `/tables`             | ✅             | admin      | Reset all tables (ensure backup path exists) |
| DELETE | `/table`              | ✅             | admin      | Reset a single table             |
| GET    | `/restore`            | ✅             | admin      | Restore all tables from backup   |
| GET    | `/readtable`          | ✅             | admin      | Read and inspect table contents  |

---

