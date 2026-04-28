export const sendVerificationEmail = async (email: string, code: string) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: { name: "soukMA", email: "hachemlamrini2004@gmail.com" },
      to: [{ email }],
      subject: "Activation de votre compte Soukma",
      htmlContent: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: auto; background: #faf8f5; border: 1px solid #e0d6c8;">
          <div style="background: #1a1a2e; padding: 36px 30px; text-align: center;">
            <h1 style="color: #c9a84c; margin: 0; font-size: 26px; letter-spacing: 6px;">Soukma</h1>
          </div>
          <div style="background: #c9a84c; height: 3px;"></div>
          <div style="padding: 40px; background: #faf8f5;">
            <p style="color: #3a2e1e;">Bienvenue,</p>
            <p style="color: #5a4a35;">Votre code d'activation :</p>
            <div style="background: #1a1a2e; padding: 28px; text-align: center; margin: 20px 0;">
              <div style="font-size: 38px; font-weight: bold; letter-spacing: 16px; color: #c9a84c; font-family: monospace;">${code}</div>
              <div style="color: #5a4a35; font-size: 11px; margin-top: 10px;">Valable 24 heures</div>
            </div>
          </div>
          <div style="background: #1a1a2e; padding: 20px; text-align: center;">
            <p style="color: #5a4a35; font-size: 11px; margin: 0;">© 2026 Soukma</p>
          </div>
        </div>
      `,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
};
