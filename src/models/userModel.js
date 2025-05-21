const { poolConnect, pool } = require("../config/dbConfig");

// Helper: Join or create institution, return institution_id
const joinInstitution = async (institutionName) => {
  try {
    await poolConnect;
    const request = pool.request();
    request.input("institutionName", institutionName);

    // Check if institution exists
    let result = await request.query(
      "SELECT institution_id FROM institutions WHERE institution_name = @institutionName"
    );

    if (result.recordset.length === 0) {
      // Institution doesn't exist, insert new one
      result = await pool
        .request()
        .input("institutionName", institutionName)
        .query(
          `INSERT INTO institutions (institution_name) VALUES (@institutionName);
           SELECT SCOPE_IDENTITY() AS institution_id;`
        );
      return result.recordset[0].institution_id;
    }

    return result.recordset[0].institution_id;
  } catch (error) {
    throw new Error(`Error fetching institution id: ${error}`);
  }
};

// Create user with institution handling
const createUser = async (
  institutionName,
  
  fname,
  lname,
  username,
  email,
  role,
  password
) => {
  try {
    const institutionId = await joinInstitution(institutionName);

    console.log("All details: ");
    console.log("Password: ", password);

    await poolConnect;
    const request = pool.request();

    request.input("institutionId", institutionId);
    request.input("fname", fname);
    request.input("lname", lname);
    request.input("username", username);
    request.input("email", email);
    request.input("role", role);
    request.input("password", password);

    const result = await request.query(
      `INSERT INTO users (institution_id, fname, lname, username, email, role, password)
       VALUES (@institutionId, @fname, @lname, @username, @email, @role, @password);
       SELECT SCOPE_IDENTITY() AS userId;`
    );

    return result.recordset[0].userId;
  } catch (error) {
    throw new Error(`Error creating user: ${error}`);
  }
};

// Read user by email
const readUserByMail = async (email) => {
  try {
    await poolConnect;
    const request = pool.request();
    request.input("email", email);

    const result = await request.query("SELECT * FROM users WHERE email = @email");
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Error reading user by email", error);
    return null;
  }
};

// Read user by id (with limited fields)
const readUserById = async (id) => {
  try {
    await poolConnect;
    const request = pool.request();
    request.input("id", id);

    const result = await request.query(
      "SELECT id, fname, lname, email, role FROM users WHERE id = @id"
    );
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Error reading user by id", error);
    return null;
  }
};

// Get authors by query (search fname, lname, username), limit default 10
const getAuthors = async (query, limit = 10) => {
  try {
    await poolConnect;
    const request = pool.request();

    request.input("query", `%${query}%`);
    request.input("limit", limit);

    const result = await request.query(`
      SELECT DISTINCT id, fname, lname, username, institution_id
      FROM users
      WHERE (fname LIKE @query OR lname LIKE @query OR username LIKE @query) AND role = 'Author'
      ORDER BY fname
      OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY;
    `);

    console.log("Fetched authors: ", result.recordset);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching authors", error);
    return [];
  }
};

module.exports = {
  createUser,
  readUserByMail,
  readUserById,
  getAuthors,
};
