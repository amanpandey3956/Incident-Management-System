import { Pool } from 'pg';
import mongoose from 'mongoose';

// PostgreSQL
export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  user: process.env.POSTGRES_USER || 'ims_user',
  password: process.env.POSTGRES_PASSWORD || 'ims_password',
  database: process.env.POSTGRES_DB || 'ims_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize PostgreSQL tables
export const initPostgres = async () => {
  const client = await pgPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        component_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'OPEN',
        priority VARCHAR(10) DEFAULT 'P2',
        signal_count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP,
        closed_at TIMESTAMP,
        mttr_seconds INTEGER
      );

      CREATE TABLE IF NOT EXISTS rca_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        work_item_id UUID REFERENCES work_items(id),
        incident_start TIMESTAMP NOT NULL,
        incident_end TIMESTAMP NOT NULL,
        root_cause_category VARCHAR(100) NOT NULL,
        fix_applied TEXT NOT NULL,
        prevention_steps TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_work_items_status ON work_items(status);
      CREATE INDEX IF NOT EXISTS idx_work_items_component ON work_items(component_id);
    `);
    console.log('✅ PostgreSQL tables initialized');
  } finally {
    client.release();
  }
};

// MongoDB
export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ims_signals');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  }
};
