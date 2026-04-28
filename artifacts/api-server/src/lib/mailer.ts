import { Resend } from 'resend';

export const sendVerificationEmail = async (email: string, code: string) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'Soukma <onboarding@resend.dev>',
    to: email,
    subject: 'Activation de votre compte Soukma',
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 560px; margin: auto; background: #faf8f5; border: 1px solid #e0d6c8;">
        <div style="background: #1a1a2e; padding: 6px 0; text-align: center;">
          <div style="color: #c9a84c; font-size: 18px; letter-spacing: 8px;">✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</div>
        </div>
        <div style="background: #1a1a2e; padding: 36px 30px 28px; text-align: center;">
          <h1 style="color: #c9a84c; margin: 0; font-size: 26px; font-weight: normal; letter-spacing: 6px; text-transform: uppercase;">Soukma</h1>
          <p style="color: #8a7a5a; margin: 8px 0 0; font-size: 11px; letter-spacing: 4px; text-transform: uppercase;">Artisanat & Authenticité</p>
        </div>
        <div style="background: #c9a84c; height: 3px;"></div>
        <div style="padding: 40px 40px 30px; background: #faf8f5;">
          <p style="color: #3a2e1e; font-size: 15px; line-height: 1.8; margin: 0 0 12px;">Bienvenue,</p>
          <p style="color: #5a4a35; font-size: 14px; line-height: 1.9; margin: 0 0 28px;">
            Nous sommes ravis de vous accueillir au sein de la communauté <strong style="color: #1a1a2e;">Soukma</strong>. 
            Pour finaliser la création de votre compte, veuillez utiliser le code d'activation ci-dessous.
          </p>
          <div style="border: 1px solid #c9a84c; background: #1a1a2e; padding: 28px 20px; text-align: center; margin: 0 0 28px;">
            <div style="color: #8a7a5a; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 14px;">Code d'activation</div>
            <div style="font-size: 38px; font-weight: bold; letter-spacing: 16px; color: #c9a84c; font-family: 'Courier New', monospace;">${code}</div>
            <div style="color: #5a4a35; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-top: 14px;">Valable 24 heures</div>
          </div>
          <p style="color: #8a7a5a; font-size: 12px; line-height: 1.8; margin: 0;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
        </div>
        <div style="background: #1a1a2e; padding: 20px 30px; text-align: center;">
          <p style="color: #5a4a35; font-size: 11px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">&copy; 2026 Soukma &nbsp;|&nbsp; Tous droits réservés</p>
        </div>
      </div>
    `,
  });
};
