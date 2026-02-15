import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 4; // Incremented for tycoon stats
  
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
      
      CREATE TABLE IF NOT EXISTS tycoon_stats (
        id INTEGER PRIMARY KEY DEFAULT 1,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0
      );
      
      INSERT INTO tycoon_stats (id, level, xp, total_revenue) VALUES (1, 1, 0, 0);

      INSERT INTO assets (name, asset_tag, category, location, cost, status, purchase_date) VALUES 
      ('Dell XPS 15', 'TAG-001', 'Laptops', 'Office 101', 1500.00, 'Active', datetime('now', '-30 days')),
      ('Herman Miller Chair', 'TAG-002', 'Furniture', 'Office 101', 800.00, 'Active', datetime('now', '-60 days')),
      ('Projector 4K', 'TAG-003', 'Electronics', 'Conf Room A', 1200.00, 'In Repair', datetime('now', '-10 days'));
    `);
    currentDbVersion = 1;
  }

  // Migration from 1 to 2
  if (currentDbVersion === 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        asset_tag TEXT UNIQUE,
        category TEXT,
        location TEXT,
        serial_number TEXT,
        purchase_date TEXT,
        cost REAL,
        status TEXT,
        image_url TEXT
      );
    `);
    currentDbVersion = 2;
  }

  // Migration from 2 to 3: Multi-category Seeding
  if (currentDbVersion === 2) {
    const assetsCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets');
    
    // Only seed if empty or very few items (to avoid double seeding if version was somehow 2 but data already exists)
    if (!assetsCount || assetsCount.count < 5) {
       await db.execAsync(`
         INSERT INTO assets (name, asset_tag, category, location, cost, status, purchase_date) VALUES 
         ('iPhone 15 Pro', 'TAG-004', 'Mobile', 'Main Office', 1099.00, 'Active', datetime('now', '-5 days')),
         ('Tesla Model 3', 'TAG-005', 'Vehicles', 'Garage A', 35000.00, 'Active', datetime('now', '-180 days')),
         ('Sony A7 IV', 'TAG-006', 'Electronics', 'Studio', 2499.00, 'Active', datetime('now', '-45 days')),
         ('Standing Desk', 'TAG-007', 'Furniture', 'Home Office', 599.00, 'Active', datetime('now', '-20 days')),
         ('Cisco Router', 'TAG-008', 'Network', 'Server Room', 1200.00, 'Active', datetime('now', '-90 days')),
         ('iPad Pro', 'TAG-009', 'Tablets', 'Office 102', 899.00, 'In Repair', datetime('now', '-2 days')),
         ('MacBook Air M3', 'TAG-010', 'Laptops', 'Remote', 1299.00, 'Active', datetime('now', '-15 days'));
       `);
    }
    currentDbVersion = 3;
  }

  // Migration from 3 to 4: Tycoon Stats
  if (currentDbVersion === 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tycoon_stats (
        id INTEGER PRIMARY KEY DEFAULT 1,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0
      );
      INSERT OR IGNORE INTO tycoon_stats (id, level, xp, total_revenue) VALUES (1, 1, 0, 0);
    `);
    currentDbVersion = 4;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);

}
