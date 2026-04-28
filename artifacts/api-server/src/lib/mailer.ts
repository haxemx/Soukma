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

export const sendWeeklyReport = async () => {
  const { db, productsTable, ordersTable, usersTable } = await import("@workspace/db");
  const { desc, sql, gte } = await import("drizzle-orm");

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [topProducts, newUsers, recentOrders] = await Promise.all([
    db.select({ title: productsTable.title, viewCount: productsTable.viewCount, salesCount: productsTable.salesCount })
      .from(productsTable).orderBy(desc(productsTable.viewCount)).limit(5),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(gte(usersTable.createdAt, oneWeekAgo)),
    db.select({ count: sql<number>`count(*)::int`, total: sql<number>`sum(total::numeric)::int` })
      .from(ordersTable).where(gte(ordersTable.createdAt, oneWeekAgo)),
  ]);

  const topHtml = topProducts.map((p, i) => `
    <tr>
      <td style="padding:8px;color:#8a7060;">${i + 1}</td>
      <td style="padding:8px;color:#261a10;font-weight:bold;">${p.title}</td>
      <td style="padding:8px;text-align:center;color:#d4512a;">${p.viewCount}</td>
      <td style="padding:8px;text-align:center;color:#3a7d44;">${p.salesCount}</td>
    </tr>`).join("");

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": process.env.BREVO_API_KEY! },
    body: JSON.stringify({
      sender: { name: "soukMA", email: "hachemlamrini2004@gmail.com" },
      to: [{ email: "hachemlamrini2004@gmail.com" }],
      subject: `📊 Rapport hebdomadaire soukMA — ${new Date().toLocaleDateString("fr-FR")}`,
      htmlContent: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:auto;background:#faf8f2;border:1px solid #e8ddd0;">
          <div style="background:#261a10;padding:28px 30px;text-align:center;">
            <h1 style="color:#d4512a;margin:0;font-size:24px;letter-spacing:6px;">soukMA</h1>
            <p style="color:#8a7060;margin:6px 0 0;font-size:11px;letter-spacing:3px;">RAPPORT HEBDOMADAIRE</p>
          </div>
          <div style="padding:32px 40px;">
            <div style="display:flex;gap:16px;margin-bottom:28px;">
              <div style="flex:1;border:1px solid #e8ddd0;border-radius:8px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:bold;color:#d4512a;">${recentOrders[0]?.total ?? 0} MAD</div>
                <div style="font-size:11px;color:#8a7060;margin-top:4px;">Ventes cette semaine</div>
              </div>
              <div style="flex:1;border:1px solid #e8ddd0;border-radius:8px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:bold;color:#3a7d44;">${recentOrders[0]?.count ?? 0}</div>
                <div style="font-size:11px;color:#8a7060;margin-top:4px;">Commandes</div>
              </div>
              <div style="flex:1;border:1px solid #e8ddd0;border-radius:8px;padding:16px;text-align:center;">
                <div style="font-size:28px;font-weight:bold;color:#5b8dd9;">${newUsers[0]?.count ?? 0}</div>
                <div style="font-size:11px;color:#8a7060;margin-top:4px;">Nouveaux utilisateurs</div>
              </div>
            </div>
            <h3 style="color:#261a10;font-size:14px;letter-spacing:2px;margin:0 0 12px;">TOP PRODUITS</h3>
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#f0ebe3;">
                  <th style="padding:8px;text-align:left;color:#8a7060;">#</th>
                  <th style="padding:8px;text-align:left;color:#8a7060;">Produit</th>
                  <th style="padding:8px;text-align:center;color:#8a7060;">Vues</th>
                  <th style="padding:8px;text-align:center;color:#8a7060;">Ventes</th>
                </tr>
              </thead>
              <tbody>${topHtml}</tbody>
            </table>
          </div>
          <div style="background:#261a10;padding:16px;text-align:center;">
            <p style="color:#5a4535;font-size:11px;margin:0;">© 2026 soukMA · Rapport automatique</p>
          </div>
        </div>
      `,
    }),
  });
};
