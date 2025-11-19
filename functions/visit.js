// functions/visit.js
export const onRequestGet = async ({ env }) => {
  try {
    if (!env.DB) {
      throw new Error('Missing D1 binding "DB" on this environment.');
    }

    // Bootstrap: ensure table exists and has a row
    await env.DB.batch([
      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS counter (
          id INTEGER PRIMARY KEY,
          visits INTEGER NOT NULL DEFAULT 0
        )
      `),
      // Use INSERT OR IGNORE to safely add the initial row
      env.DB.prepare(`INSERT OR IGNORE INTO counter (id, visits) VALUES (1, 0)`)
    ]);

    // Increment the counter
    await env.DB.prepare('UPDATE counter SET visits = visits + 1 WHERE id = 1').run();
    
    // Read the current value
    const result = await env.DB.prepare('SELECT visits FROM counter WHERE id = 1').first();
    
    const visits = result?.visits ?? 0;

    return new Response(String(visits), {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  } catch (err) {
    console.error('Counter error:', err);
    return new Response(`Counter error: ${err.message}`, {
      status: 500,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  }
};
