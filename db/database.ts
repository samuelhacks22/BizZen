import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  // db.execAsync is the new API in v14+ (we are on 16)
  
  // Check user_version
  let { user_version: currentDbVersion } = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  ) || { user_version: 0 };

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        category TEXT,
        image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL, -- 'SALE', 'RESTOCK', 'EXPENSE'
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      
      -- Seed some initial data for demo
      INSERT INTO products (name, price, stock, category) VALUES 
      ('Digital License', 49.99, 100, 'Software'),
      ('Premium Support', 29.99, 50, 'Service'),
      ('Consultation', 99.99, 10, 'Service');
      
      INSERT INTO transactions (type, amount, date, note) VALUES
      ('SALE', 49.99, datetime('now', '-1 day'), 'Initial Sale'),
      ('SALE', 149.99, datetime('now'), 'Bulk License');
    `);
    
    currentDbVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
