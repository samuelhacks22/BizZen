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
      
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        asset_tag TEXT UNIQUE,
        category TEXT,
        location TEXT,
        serial_number TEXT,
        purchase_date TEXT,
        cost REAL,
        status TEXT, -- 'Active', 'In Repair', 'Disposed'
        image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      
      -- Seed some initial data for demo
      INSERT INTO assets (name, asset_tag, category, location, cost, status, purchase_date) VALUES 
      ('Dell XPS 15', 'TAG-001', 'Laptops', 'Office 101', 1500.00, 'Active', datetime('now', '-30 days')),
      ('Herman Miller Chair', 'TAG-002', 'Furniture', 'Office 101', 800.00, 'Active', datetime('now', '-60 days')),
      ('Projector 4K', 'TAG-003', 'Electronics', 'Conf Room A', 1200.00, 'In Repair', datetime('now', '-10 days'));
    `);
    
    currentDbVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
