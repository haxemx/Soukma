import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  await transporter.sendMail({
    from: `"Soukma" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Activation de votre compte Soukma',
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 560px; margin: auto; background: #faf8f5; border: 1px solid #e0d6c8;">

        <!-- Moroccan Header Border -->
        <div style="background: #1a1a2e; padding: 6px 0; text-align: center;">
          <div style="color: #c9a84c; font-size: 18px; letter-spacing: 8px;">✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</div>
        </div>

        <!-- Header -->
        <div style="background: #1a1a2e; padding: 36px 30px 28px; text-align: center;">
          <!-- Geometric Moroccan Star (SVG) -->
          <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block; margin: 0 auto 16px;">
            <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="none" stroke="#c9a84c" stroke-width="2"/>
            <polygon points="50,18 58,38 80,38 63,51 70,73 50,60 30,73 37,51 20,38 42,38" fill="#c9a84c" opacity="0.15"/>
            <circle cx="50" cy="50" r="12" fill="none" stroke="#c9a84c" stroke-width="1.5"/>
          </svg>
          <h1 style="color: #c9a84c; margin: 0; font-size: 26px; font-weight: normal; letter-spacing: 6px; text-transform: uppercase;">Soukma</h1>
          <p style="color: #8a7a5a; margin: 8px 0 0; font-size: 11px; letter-spacing: 4px; text-transform: uppercase;">Artisanat & Authenticité</p>
        </div>

        <!-- Zellige Pattern Divider -->
        <div style="background: #c9a84c; height: 3px;"></div>
        <div style="background: #1a1a2e; height: 1px;"></div>
        <div style="background: #c9a84c; height: 1px; opacity: 0.4;"></div>

        <!-- Body -->
        <div style="padding: 40px 40px 30px; background: #faf8f5;">
          
          <!-- Arabesque top ornament -->
          <div style="text-align: center; color: #c9a84c; font-size: 22px; letter-spacing: 6px; margin-bottom: 28px;">
            &#10070; &nbsp; &#10070; &nbsp; &#10070;
          </div>

          <p style="color: #3a2e1e; font-size: 15px; line-height: 1.8; margin: 0 0 12px;">Bienvenue,</p>
          <p style="color: #5a4a35; font-size: 14px; line-height: 1.9; margin: 0 0 28px;">
            Nous sommes ravis de vous accueillir au sein de la communauté <strong style="color: #1a1a2e;">Soukma</strong>. 
            Pour finaliser la création de votre compte, veuillez utiliser le code d'activation ci-dessous.
          </p>

          <!-- Code Box -->
          <div style="border: 1px solid #c9a84c; background: #1a1a2e; padding: 28px 20px; text-align: center; margin: 0 0 28px; position: relative;">
            <div style="color: #8a7a5a; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 14px;">Code d'activation</div>
            <div style="font-size: 38px; font-weight: bold; letter-spacing: 16px; color: #c9a84c; font-family: 'Courier New', monospace;">
              ${code}
            </div>
            <div style="color: #5a4a35; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-top: 14px;">Valable 24 heures</div>
          </div>

          <p style="color: #8a7a5a; font-size: 12px; line-height: 1.8; margin: 0;">
            Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
          </p>

          <!-- Arabesque bottom ornament -->
          <div style="text-align: center; color: #c9a84c; font-size: 22px; letter-spacing: 6px; margin-top: 28px;">
            &#10070; &nbsp; &#10070; &nbsp; &#10070;
          </div>
        </div>

        <!-- Zellige Pattern Divider -->
        <div style="background: #c9a84c; height: 1px; opacity: 0.4;"></div>
        <div style="background: #1a1a2e; height: 1px;"></div>
        <div style="background: #c9a84c; height: 3px;"></div>

        <!-- Footer -->
        <div style="background: #1a1a2e; padding: 20px 30px; text-align: center;">
          <div style="color: #c9a84c; font-size: 14px; letter-spacing: 6px; margin-bottom: 8px;">✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</div>
          <p style="color: #5a4a35; font-size: 11px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">
            &copy; 2026 Soukma &nbsp;|&nbsp; Tous droits réservés
          </p>
        </div>

      </div>
    `,
  });
};
