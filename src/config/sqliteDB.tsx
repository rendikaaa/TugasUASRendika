import SQLite from 'react-native-sqlite-storage';

// Mengaktifkan promise untuk SQLite
SQLite.enablePromise(true);

const databaseName = 'MyDatabase.db';

// Fungsi untuk mendapatkan koneksi ke database
export const getDBConnection = async () => {
  try {
    const db = await SQLite.openDatabase({
      name: databaseName,
      location: 'default',
    });
    console.log('Database connected successfully.');
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw new Error('Unable to open database.');
  }
};

// Fungsi untuk membuat tabel jika belum ada
export const createTable = async () => {
  const db = await getDBConnection();
  const query = `
    CREATE TABLE IF NOT EXISTS user_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `;
  try {
    await db.executeSql(query);
    console.log("Table 'user_credentials' created or already exists.");
  } catch (error) {
    console.error('Error creating table:', error);
    throw new Error('Failed to create table.');
  }
};

// Fungsi untuk menyimpan kredensial ke database
export const saveCredentials = async (email: string, password: string) => {
  // Validasi input sebelum menyimpan
  if (!email || !password) {
    console.error('Invalid input: email and password are required.');
    throw new Error('Email and password are required.');
  }

  const db = await getDBConnection();
  const query = `
    INSERT INTO user_credentials (email, password) VALUES (?, ?);
  `;

  try {
    await db.executeSql(query, [email, password]);
    console.log('Credentials saved successfully.');
  } catch (error) {
    console.error('Error saving credentials:', error);
    throw new Error('Failed to save credentials.');
  }
};

// Fungsi untuk mengambil kredensial dari database
export const getCredentials = async () => {
  const db = await getDBConnection();
  const query = `SELECT email, password FROM user_credentials LIMIT 1;`;

  try {
    const results = await db.executeSql(query);
    if (results[0].rows.length > 0) {
      return results[0].rows.item(0);
    }
    return null; // Jika tidak ada data
  } catch (error) {
    console.error('Error fetching credentials:', error);
    throw new Error('Failed to fetch credentials.');
  }
};

// Fungsi untuk menghapus kredensial dari database
export const clearCredentials = async () => {
  const db = await getDBConnection();
  const query = `DELETE FROM user_credentials;`;

  try {
    await db.executeSql(query);
    console.log('Credentials cleared successfully.');
  } catch (error) {
    console.error('Error clearing credentials:', error);
    throw new Error('Failed to clear credentials.');
  }
};
