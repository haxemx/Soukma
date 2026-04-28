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
      subject: "Activation de votre compte soukMA",
      htmlContent: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: auto; background: #faf8f2; border: 1px solid #e8ddd0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #d4512a 0%, #b8431f 100%); padding: 8px 0; text-align: center;">
            <div style="color: rgba(255,255,255,0.4); font-size: 13px; letter-spacing: 6px;">✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</div>
          </div>
          <div style="background: #261a10; padding: 36px 30px 28px; text-align: center;">
            <h1 style="color: #d4512a; margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 8px; text-transform: uppercase;">soukMA</h1>
            <p style="color: #8a7060; margin: 8px 0 0; font-size: 11px; letter-spacing: 4px; text-transform: uppercase;">Marketplace Marocaine</p>
          </div>
          <div style="background: linear-gradient(90deg, #d4512a, #e8743a, #d4512a); height: 3px;"></div>

          <!-- Body -->
          <div style="padding: 40px 40px 30px; background: #faf8f2;">
            <p style="color: #261a10; font-size: 15px; line-height: 1.8; margin: 0 0 12px;">Bienvenue,</p>
            <p style="color: #5a4535; font-size: 14px; line-height: 1.9; margin: 0 0 28px;">
              Nous sommes ravis de vous accueillir sur <strong style="color: #261a10;">soukMA</strong>. 
              Pour activer votre compte, utilisez le code ci-dessous.
            </p>

            <!-- Code box -->
            <div style="border: 2px solid #d4512a; background: #261a10; padding: 30px 20px; text-align: center; margin: 0 0 28px; border-radius: 4px;">
              <div style="color: #8a7060; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 14px;">Code d'activation</div>
              <div style="font-size: 42px; font-weight: bold; letter-spacing: 18px; color: #d4512a; font-family: 'Courier New', monospace;">${code}</div>
              <div style="color: #8a7060; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-top: 14px;">Valable 24 heures</div>
            </div>

            <!-- Zellige divider -->
            <div style="text-align: center; margin: 20px 0; color: #d4512a; font-size: 16px; letter-spacing: 8px;">◆ ◆ ◆</div>

            <p style="color: #8a7060; font-size: 12px; line-height: 1.8; margin: 0;">
              Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #261a10; padding: 20px 30px; text-align: center;">
            <p style="color: #d4512a; font-size: 13px; letter-spacing: 3px; margin: 0 0 6px; text-transform: uppercase;">soukMA</p>
            <p style="color: #5a4535; font-size: 11px; letter-spacing: 1px; margin: 0;">© 2026 soukMA · Marketplace Marocaine · Fait avec ♥ à Casablanca</p>
          </div>
          <div style="background: linear-gradient(135deg, #d4512a 0%, #b8431f 100%); padding: 6px 0; text-align: center;">
            <div style="color: rgba(255,255,255,0.4); font-size: 13px; letter-spacing: 6px;">✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</div>
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
