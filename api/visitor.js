import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured' });
  }

  try {
    const sql = neon(databaseUrl);

    // Increment and return count
    const [result] = await sql`
      INSERT INTO visitor_counter (page_name, visits_count, last_visited)
      VALUES ('portfolio_home', 1, CURRENT_TIMESTAMP)
      ON CONFLICT (page_name)
      DO UPDATE SET visits_count = visitor_counter.visits_count + 1, last_visited = CURRENT_TIMESTAMP
      RETURNING visits_count, last_visited;
    `;

    return res.status(200).json({
      success: true,
      visits: result.visits_count,
      lastVisited: result.last_visited
    });
  } catch (error) {
    console.error('Visitor Counter Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
