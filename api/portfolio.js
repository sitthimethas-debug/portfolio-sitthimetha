import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    return res.status(500).json({ error: 'DATABASE_URL environment variable is not configured' });
  }

  try {
    const sql = neon(databaseUrl);

    const [profile] = await sql`SELECT * FROM portfolio_profile LIMIT 1;`;
    const experience = await sql`SELECT * FROM work_experience ORDER BY sort_order ASC;`;
    const certificates = await sql`SELECT * FROM certificates ORDER BY sort_order ASC;`;
    const innovations = await sql`SELECT * FROM innovations ORDER BY sort_order ASC;`;
    const gallery = await sql`SELECT * FROM activity_gallery ORDER BY sort_order ASC;`;

    return res.status(200).json({
      success: true,
      data: {
        profile,
        experience,
        certificates,
        innovations,
        gallery
      }
    });
  } catch (error) {
    console.error('API Database Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
