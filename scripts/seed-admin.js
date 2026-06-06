const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.khglumxeeoycjfjjqiwq:Amapola0123!@aws-1-us-west-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Conectado ao banco!');

  const hash = await bcrypt.hash('CineAdmin@2025', 12);
  const now = new Date().toISOString();
  const cuid = 'admin-' + Date.now();

  // Verificar se já existe
  const existing = await client.query(
    'SELECT id FROM users WHERE email = $1',
    ['admin@cineverse.com']
  );

  if (existing.rows.length > 0) {
    await client.query(
      'UPDATE users SET role = $1, password = $2, name = $3, "updatedAt" = $4 WHERE email = $5',
      ['ADMIN', hash, 'Admin CineVerse', now, 'admin@cineverse.com']
    );
    console.log('✅ Admin atualizado! Email: admin@cineverse.com | Senha: CineAdmin@2025');
  } else {
    await client.query(
      'INSERT INTO users (id, name, email, password, role, banned, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [cuid, 'Admin CineVerse', 'admin@cineverse.com', hash, 'ADMIN', false, now, now]
    );
    console.log('✅ Admin criado! Email: admin@cineverse.com | Senha: CineAdmin@2025');
  }

  await client.end();
}

main().catch(e => { console.error('Erro:', e.message); process.exit(1); });
