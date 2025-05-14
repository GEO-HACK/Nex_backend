# ⚙️ Configuration Reference (`/config/`)

## Overview
The config directory contains configuration files that establish connections to external services, set up the database schema, and configure middleware.

These files are typically imported at application startup to initialize core dependencies.

---

## 📚 Configuration Files

| Config File | Purpose | Dependencies |
|-------------|---------|--------------|
| b2Config.js | Backblaze B2 cloud storage connection | `@aws-sdk/client-s3` |
| dbConfig.js | Database connection initialization | `better-sqlite3` |
| dbSetupConfig.js | Database schema creation | `dbConfig.js` |
| multerConfig.js | File upload configuration | `multer`, `multer-s3`, `b2Config.js` |

*(Scroll down for details on each configuration file)*

---

### ☁️ **b2Config.js**

Configures connection to Backblaze B2 cloud storage service.

#### Required Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `B2_ENDPOINT` | Backblaze B2 service endpoint URL | `https://s3.us-west-004.backblazeb2.com` |
| `B2_KEY_ID` | Backblaze application key ID | `0011223344556677889900aab` |
| `B2_APPLICATION_KEY` | Backblaze application key secret | `K000abcdefghijklmnopqrstuvwxyz` |
| `B2_BUCKET_NAME` | Target bucket name for file storage | `research-papers-bucket` |

#### Self-Testing
- Automatically tests connection on import
- Optional bucket existence test (commented out)
- Logs connection status to console

#### Exports
- Configured S3Client instance for use with file uploads

---

### 🗄️ **dbConfig.js**

Establishes connection to SQLite database.

#### Dependencies
- `better-sqlite3`: SQLite database driver

#### Database Location
- Creates/connects to `database.db` in the project root directory

#### Exports
- Database connection instance

---

### 📝 **dbSetupConfig.js**

Defines database schema and creates tables if they don't exist.

#### Database Schema

**institutions**
| Column | Type | Constraints |
|--------|------|-------------|
| institution_id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| institution_name | TEXT | NOT NULL |

**users**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| institution_id | INTEGER | NOT NULL, FOREIGN KEY |
| fname | TEXT | NOT NULL |
| lname | TEXT | NOT NULL |
| username | TEXT | NOT NULL |
| email | TEXT | UNIQUE, NOT NULL |
| role | TEXT | NOT NULL |
| password | TEXT | NOT NULL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**categories**
| Column | Type | Constraints |
|--------|------|-------------|
| category_id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| category | TEXT | UNIQUE, NOT NULL |

**tags**
| Column | Type | Constraints |
|--------|------|-------------|
| tag_id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| field | TEXT | NOT NULL |
| tag | TEXT | UNIQUE, NOT NULL |

**papers**
| Column | Type | Constraints |
|--------|------|-------------|
| paper_id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| category_id | INTEGER | NOT NULL, FOREIGN KEY |
| publisher_id | INTEGER | NOT NULL |
| paper_name | TEXT | NOT NULL |
| file_url | TEXT | NOT NULL |
| description | TEXT | |
| meta | TEXT | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| deleted | INTEGER | NOT NULL, DEFAULT 0, CHECK (0,1) |

**paper_tags** (Junction Table)
| Column | Type | Constraints |
|--------|------|-------------|
| paper_id | INTEGER | NOT NULL, FOREIGN KEY |
| tag_id | INTEGER | NOT NULL, FOREIGN KEY |
| | | PRIMARY KEY (paper_id, tag_id) |

**author_papers** (Junction Table)
| Column | Type | Constraints |
|--------|------|-------------|
| rauthor_id | INTEGER | NOT NULL, FOREIGN KEY to users(id) |
| rpaper_id | INTEGER | NOT NULL, FOREIGN KEY to papers(paper_id) |
| | | PRIMARY KEY (rauthor_id, rpaper_id) |

#### Notes
- Foreign key constraints are enabled
- Includes commented code for a timestamp trigger
- Research papers must have a "research" prefix (see comment)

#### Exports
- `setupDb` function to initialize database schema

---

### 📤 **multerConfig.js**

Configures file upload middleware for both cloud and local storage.

#### Cloud Storage (Backblaze B2)
- Uses `multer-s3` to connect to B2
- Files stored with unique timestamps in their names
- Sets ACL to "public-read" for direct access
- Path format: `research-papers/[timestamp]-[originalname]`

#### Local Storage (Development)
- Stores files in `../uploads` directory relative to config file
- Adds uploaded file URL to the request object as `req.fileUrl`
- Path format: `../uploads/[timestamp]-[originalname]`

#### Commented Validation
- Contains commented code for field validation
- Could validate presence of `name`, `category`, and `description` fields

#### Exports
- `upload`: Configured multer middleware for B2 cloud storage
- `localstore`: Configured multer middleware for local file storage

---