import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 13;
  
  // Siempre asegurar modo WAL para evitar bloqueos de lectura/escritura
  await db.execAsync('PRAGMA journal_mode = WAL');

  let { user_version: currentDbVersion } = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  ) || { user_version: 0 };

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL);
      INSERT OR IGNORE INTO users (username, password) VALUES ('admin', '1234');
      CREATE TABLE IF NOT EXISTS assets (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, asset_tag TEXT UNIQUE, category TEXT, location TEXT, purchase_date TEXT, cost REAL, status TEXT, last_validated TEXT);
      CREATE TABLE IF NOT EXISTS tycoon_stats (id INTEGER PRIMARY KEY DEFAULT 1, level INTEGER DEFAULT 1, xp INTEGER DEFAULT 0, total_revenue REAL DEFAULT 0, satisfaction_rate REAL DEFAULT 100, reputation_score REAL DEFAULT 50, employees_count INTEGER DEFAULT 0, days_active INTEGER DEFAULT 1, unlocked_achievements TEXT DEFAULT '[]');
      INSERT OR IGNORE INTO tycoon_stats (id, level, xp, total_revenue) VALUES (1, 1, 0, 0);
      CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL, department TEXT, salary REAL, hire_date TEXT, status TEXT DEFAULT 'Active', last_validated TEXT);
    `);
    currentDbVersion = DATABASE_VERSION;
  }

  if (currentDbVersion < 9) {
      await db.execAsync('CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL, department TEXT, salary REAL, hire_date TEXT, status TEXT DEFAULT "Active", last_validated TEXT);');
      currentDbVersion = 9;
  }

  // MIGRACIÓN V13: Asegurar columna last_validated en tabla employees de forma defensiva
  if (currentDbVersion < 13) {
    try {
        const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(employees)');
        const hasColumn = columns.some(c => c.name === 'last_validated');
        if (!hasColumn) {
            await db.execAsync('ALTER TABLE employees ADD COLUMN last_validated TEXT;');
            console.log('[Database] Columna last_validated añadida con éxito en V13');
        }
    } catch (e) {
        console.error('[Database] Error crítico en migración V13:', e);
    }
    currentDbVersion = 13;
  }

  // Final Verification: Ensure we have at least seed data for UX
  try {
    const assetCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets');
    if (assetCount && assetCount.count === 0) {
      await db.execAsync(`
        INSERT INTO assets (name, asset_tag, category, location, cost, status, purchase_date) VALUES 
        ('Dell XPS 15', 'TAG-001', 'Laptops', 'Office 101', 1500.00, 'Active', datetime('now', '-30 days')),
        ('Herman Miller Chair', 'TAG-002', 'Furniture', 'Office 101', 800.00, 'Active', datetime('now', '-60 days')),
        ('Projector 4K', 'TAG-003', 'Electronics', 'Conf Room A', 1200.00, 'In Repair', datetime('now', '-10 days')),
        ('Mac Studio', 'TAG-004', 'Electronics', 'Office 102', 3500.00, 'Active', datetime('now', '-5 days')),
        ('iPad Pro', 'TAG-005', 'Mobile', 'Office 102', 1100.00, 'Active', datetime('now', '-15 days')),
        ('Ergo Desk', 'TAG-006', 'Furniture', 'Office 101', 600.00, 'Active', datetime('now', '-2 days'));
      `);
    }

    const employeeCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM employees');
    if (employeeCount && employeeCount.count === 0) {
      await db.execAsync(`
        INSERT INTO employees (name, role, department, salary, hire_date, status) VALUES 
        ('Ana García', 'CTO', 'Tecnología', 8500.00, datetime('now', '-365 days'), 'Active'),
        ('Carlos Ruiz', 'Lead Developer', 'Tecnología', 6200.00, datetime('now', '-200 days'), 'Active'),
        ('Diana Prince', 'Operations Mgr', 'Logística', 4800.00, datetime('now', '-120 days'), 'Active'),
        ('Steve Trevor', 'Security Chief', 'Seguridad', 3500.00, datetime('now', '-60 days'), 'Active');
      `);
    }

    const userCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users');
    if (userCount && userCount.count === 0) {
      await db.runAsync('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', '1234']);
    }

    const tycoonCheck = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tycoon_stats');
    if (tycoonCheck && tycoonCheck.count === 0) {
      await db.runAsync('INSERT INTO tycoon_stats (id, level, xp) VALUES (1, 1, 0)');
    }
  } catch (e) {
    console.error('Error in post-migration seeding:', e);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
