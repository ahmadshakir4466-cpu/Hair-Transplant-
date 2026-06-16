import { Resend } from 'resend';

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is missing. Email simulated:', { to, subject });
      return res.status(200).json({ 
        message: 'Email simulated successfully (API key missing)',
        simulated: true 
      });
    }

    const data = await resend.emails.send({
      from: 'Appointments <onboarding@resend.dev>', // Update with your verified domain
      to: [to],
      subject: subject,
      html: html,
    });

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: error.message || 'Error sending email' });
  }
}
