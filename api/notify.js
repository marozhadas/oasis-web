export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { full_name, phone, email, subject, message } = req.body || {};

  if (!full_name || !phone || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Oasis Website <onboarding@resend.dev>',
        to: ['marozhadas@gmail.com'],
        subject: `פנייה חדשה מהאתר Oasis: ${subject || 'ללא נושא'}`,
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;color:#2b2f36;">
            <h2 style="color:#0e3d38;">התקבלה פנייה חדשה מהאתר</h2>
            <p><b>שם מלא:</b> ${escapeHtml(full_name)}</p>
            <p><b>טלפון:</b> ${escapeHtml(phone)}</p>
            <p><b>אימייל:</b> ${escapeHtml(email)}</p>
            <p><b>נושא:</b> ${escapeHtml(subject || '')}</p>
            <p><b>הודעה:</b><br>${escapeHtml(message || '').replace(/\n/g, '<br>')}</p>
          </div>
        `
      })
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      return res.status(502).json({ error: data });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
