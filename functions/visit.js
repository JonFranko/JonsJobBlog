// functions/visit.js
export const onRequestGet = async ({ env }) => {
  // Bootstrap table (safe to run each request)
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS counter (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      visits INTEGER NOT NULL DEFAULT 0
    );
    INSERT OR IGNORE INTO counter (id, visits) VALUES (1, 0);
  `);

  // Increment then read
  await env.DB.prepare('UPDATE counter SET visits = visits + 1 WHERE id = 1').run();
  const row = await env.DB.prepare('SELECT visits FROM counter WHERE id = 1').get();

  return new Response(String(row?.visits ?? 0), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
  });
};
