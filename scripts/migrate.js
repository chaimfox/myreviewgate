#!/usr/bin/env node
/**
 * Runs pending SQL migrations from supabase/migrations/ against Supabase.
 * Tracks applied migrations in a `schema_migrations` table.
 *
 * Setup:
 *   1. Add DATABASE_URL to .env.local (from Supabase → Settings → Database → URI)
 *   2. npm run migrate
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations')

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌  Missing DATABASE_URL in .env.local')
    console.error('   Go to Supabase → Settings → Database → Connection string (URI mode)')
    process.exit(1)
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()

  // Create tracking table if needed
  await client.query(`
    create table if not exists schema_migrations (
      version text primary key,
      applied_at timestamptz default now()
    );
  `)

  const { rows } = await client.query('select version from schema_migrations')
  const applied = new Set(rows.map(r => r.version))

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  const pending = files.filter(f => !applied.has(f))

  if (pending.length === 0) {
    console.log('✅  No pending migrations.')
    await client.end()
    return
  }

  console.log(`🔄  Running ${pending.length} migration(s)...\n`)

  for (const file of pending) {
    process.stdout.write(`  → ${file} ... `)
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    try {
      await client.query(sql)
      await client.query('insert into schema_migrations (version) values ($1) on conflict do nothing', [file])
      console.log('✓')
    } catch (err) {
      // Ignore "already exists" errors — migrations are idempotent
      if (err.message.includes('already exists') || err.message.includes('duplicate column')) {
        await client.query('insert into schema_migrations (version) values ($1) on conflict do nothing', [file])
        console.log('✓ (skipped existing)')
      } else {
        console.log('FAILED')
        console.error(`\n     ${err.message}\n`)
        await client.end()
        process.exit(1)
      }
    }
  }

  console.log(`\n✅  Done.`)
  await client.end()
}

main().catch(err => { console.error(err); process.exit(1) })
