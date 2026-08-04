export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Secret RESEND_API_KEY strictly kept on Server-side (Vercel Environment Variables)
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log('ℹ️ Admin Email Notification skipped: RESEND_API_KEY is not configured in Environment Variables.');
      return res.status(200).json({ skipped: true, message: 'RESEND_API_KEY missing' });
    }

    const { email, userId, teacherName, schoolName } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const signupDate = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    const emailSubject = 'MathBoxx - มีสมาชิกใหม่สมัครใช้งาน';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 8px;">
          🎉 มีสมาชิกใหม่สมัครใช้งาน MathBoxx
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 140px;">Email:</td><td style="padding: 8px;">${email}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">วันที่สมัคร:</td><td style="padding: 8px;">${signupDate} (เวลาประเทศไทย)</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Plan:</td><td style="padding: 8px;">Free Tier (เริ่มต้น)</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Subscription Status:</td><td style="padding: 8px;">active</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">User ID:</td><td style="padding: 8px; font-family: monospace;">${userId || '-'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">ชื่อครูผู้สอน:</td><td style="padding: 8px;">${teacherName || '-'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">โรงเรียน:</td><td style="padding: 8px;">${schoolName || '-'}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;" />
        <p style="font-size: 12px; color: #64748b;">ข้อความนี้ส่งอัตโนมัติจากระบบ MathBoxx Primary Admin Notification</p>
      </div>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'MathBoxx <onboarding@resend.dev>',
        to: ['sakarinmam999@gmail.com'],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();
    return res.status(200).json({ success: true, data: resendData });
  } catch (err: any) {
    console.warn('Server Admin Notification Error:', err?.message || err);
    return res.status(200).json({ success: false, error: err?.message || 'Internal Error' });
  }
}
