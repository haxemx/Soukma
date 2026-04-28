import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  await transporter.sendMail({
    from: `"soukMA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Activation de votre compte Soukma",
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 560px; margin: auto; background: #faf8f5; border: 1px solid #e0d6c8;">
        <div style="background: #1a1a2e; padding: 36px 30px 28px; text-align: center;">
          <h1 style="color: #c9a84c; margin: 0; font-size: 26px; letter-spacing: 6px; text-transform: uppercase;">Soukma</h1>
        </div>
        <div style="background: #c9a84c; height: 3px;"></div>
        <div style="padding: 40px; background: #faf8f5;">
          <p style="color: #3a2e1e; font-size: 15px;">Bienvenue,</p>
          <p style="color: #5a4a35; font-size: 14px; line-height: 1.9;">
            Pour finaliser la création de votre compte <strong>Soukma</strong>, utilisez ce code :
          </p>
          <div style="border: 1px solid #c9a84c; background: #1a1a2e; padding: 28px; text-align: center; margin: 20px 0;">
            <div style="color: #8a7a5a; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 14px;">Code d'activation</div>
            <div style="font-size: 38px; font-weight: bold; letter-spacing: 16px; color: #c9a84c; font-family: monospace;">${code}</div>
            <div style="color: #5a4a35; font-size: 10px; margin-top: 14px;">Valable 24 heures</div>
          </div>
          <p style="color: #8a7a5a; font-size: 12px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <p style="color: #5a4a35; font-size: 11px; margin: 0;">© 2026 Soukma · Tous droits réservés</p>
        </div>
      </div>
    `,
  });
};
