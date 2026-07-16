import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// User-supplied values must never be interpolated into these HTML emails
// unescaped — otherwise a review comment or contact message can inject
// active HTML (links, images) into a mail that looks like it's from us.
function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

function wrap(body) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;direction:rtl;text-align:right">
    <div style="background:#1B3F6E;padding:24px 32px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:22px">myReviewGate ★★★★★</h1>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
      ${body}
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">
      © ${new Date().getFullYear()} myReviewGate &nbsp;|&nbsp; myreviewgate.com
    </p>
  </div>
  `
}

async function send({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"myReviewGate" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: wrap(html),
    })
  } catch (err) {
    console.error('[email] failed:', err.message)
  }
}

/* ── 0. איפוס סיסמה ─────────────────────────────────────── */
export async function sendPasswordResetEmail({ email, resetLink }) {
  await send({
    to: email,
    subject: 'איפוס סיסמה — myReviewGate',
    html: `
      <h2 style="color:#1B3F6E;margin-top:0">בקשת איפוס סיסמה</h2>
      <p style="color:#374151;font-size:15px">
        קיבלנו בקשה לאיפוס הסיסמה שלך ב-myReviewGate.<br>
        לחץ על הכפתור למטה כדי לבחור סיסמה חדשה:
      </p>
      <div style="text-align:center;margin:28px 0">
        <a href="${resetLink}"
           style="display:inline-block;background:#1B3F6E;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
          איפוס סיסמה
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px">
        הקישור תקף ל-60 דקות.<br>
        אם לא ביקשת איפוס סיסמה, ניתן להתעלם ממייל זה.
      </p>
    `,
  })
}

/* ── 1. בעל עסק → אושר ──────────────────────────────────── */
export async function sendApprovalEmail({ ownerEmail, storeName, slug }) {
  await send({
    to: ownerEmail,
    subject: `✅ העסק שלך אושר — ${storeName}`,
    html: `
      <h2 style="color:#1B3F6E;margin-top:0">ברכות! העסק שלך אושר 🎉</h2>
      <p style="color:#374151;font-size:15px">
        שלום,<br><br>
        העסק <strong>${esc(storeName)}</strong> אושר ועכשיו פעיל במערכת myReviewGate.
      </p>
      <p style="color:#374151;font-size:15px">הקישור שלך לסריקת NFC / QR:</p>
      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
        <a href="https://myreviewgate.com/${esc(slug)}" style="color:#C8960C;font-size:18px;font-weight:bold;direction:ltr;display:inline-block">
          https://myreviewgate.com/${esc(slug)}
        </a>
      </div>
      <p style="color:#374151;font-size:15px">
        כנס ל<a href="https://myreviewgate.com/dashboard" style="color:#1B3F6E">לוח הבקרה</a>
        שלך כדי לראות משובים, לעדכן פרטים ולהגדיר קישורים מותאמים.
      </p>
      <p style="color:#6b7280;font-size:13px;margin-top:24px">
        בהצלחה!<br>צוות myReviewGate
      </p>
    `,
  })
}

/* ── 2. בעל עסק → משוב פרטי חדש ─────────────────────────── */
export async function sendFeedbackEmail({ ownerEmail, storeName, rating, comment, customerPhone, customerEmail }) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const contactLine = [
    customerEmail ? `מייל: ${esc(customerEmail)}` : '',
    customerPhone ? `טלפון: ${esc(customerPhone)}` : '',
  ].filter(Boolean).join(' &nbsp;|&nbsp; ')

  await send({
    to: ownerEmail,
    subject: `💬 משוב פרטי חדש — ${storeName} (${stars})`,
    html: `
      <h2 style="color:#1B3F6E;margin-top:0">התקבל משוב פרטי חדש</h2>
      <p style="color:#374151;font-size:15px">
        לקוח השאיר משוב פרטי לעסק <strong>${esc(storeName)}</strong>:
      </p>
      <div style="background:#f9fafb;border-right:4px solid #1B3F6E;border-radius:4px;padding:16px 20px;margin:16px 0">
        <div style="font-size:24px;color:#f59e0b;margin-bottom:8px">${stars}</div>
        <p style="color:#111827;font-size:15px;margin:0;white-space:pre-wrap">${esc(comment)}</p>
      </div>
      ${contactLine ? `<p style="color:#6b7280;font-size:13px">${contactLine}</p>` : ''}
      <a href="https://myreviewgate.com/dashboard"
         style="display:inline-block;background:#1B3F6E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
        צפה בכל המשובים
      </a>
    `,
  })
}

/* ── 2b. לקוח → תגובת בעל העסק למשוב שלו ─────────────────── */
export async function sendOwnerReplyEmail({ customerEmail, storeName, originalComment, reply }) {
  await send({
    to: customerEmail,
    subject: `${storeName} הגיבו למשוב שלך`,
    html: `
      <h2 style="color:#1B3F6E;margin-top:0">קיבלת תגובה מ-${esc(storeName)}</h2>
      <div style="background:#f9fafb;border-right:4px solid #d1d5db;border-radius:4px;padding:16px 20px;margin:16px 0">
        <p style="color:#6b7280;font-size:12px;margin:0 0 6px">המשוב שלך:</p>
        <p style="color:#374151;font-size:14px;margin:0;white-space:pre-wrap">${esc(originalComment)}</p>
      </div>
      <div style="background:#eff6ff;border-right:4px solid #1B3F6E;border-radius:4px;padding:16px 20px;margin:16px 0">
        <p style="color:#6b7280;font-size:12px;margin:0 0 6px">התגובה של ${esc(storeName)}:</p>
        <p style="color:#111827;font-size:15px;margin:0;white-space:pre-wrap">${esc(reply)}</p>
      </div>
      <p style="color:#6b7280;font-size:13px">תודה שעזרת לעסק להשתפר!</p>
    `,
  })
}

/* ── 3. אדמין → עסק חדש ממתין לאישור ───────────────────── */
export async function sendNewStoreAdminEmail({ storeName, slug, ownerEmail, ownerName }) {
  await send({
    to: process.env.ADMIN_EMAIL,
    subject: `🆕 עסק חדש ממתין לאישור — ${storeName}`,
    html: `
      <h2 style="color:#1B3F6E;margin-top:0">עסק חדש נרשם ומחכה לאישורך</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151">
        <tr><td style="padding:8px 0;font-weight:bold;width:140px">שם העסק:</td><td>${esc(storeName)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">כתובת:</td><td dir="ltr">myreviewgate.com/${esc(slug)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">שם הבעלים:</td><td>${esc(ownerName) || '—'}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">מייל הבעלים:</td><td dir="ltr">${esc(ownerEmail)}</td></tr>
      </table>
      <a href="https://myreviewgate.com/admin"
         style="display:inline-block;background:#C8960C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
        פתח פאנל ניהול לאישור
      </a>
    `,
  })
}

/* ── 4. אדמין → פניה חדשה מצור קשר ─────────────────────── */
export async function sendContactAdminEmail({ name, email, phone, subject, message }) {
  await send({
    to: process.env.ADMIN_EMAIL,
    subject: `📩 פניה חדשה מהאתר — ${subject || 'ללא נושא'}`,
    html: `
      <h2 style="color:#1B3F6E;margin-top:0">התקבלה פניה חדשה דרך האתר</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151">
        <tr><td style="padding:8px 0;font-weight:bold;width:100px">שם:</td><td>${esc(name)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">מייל:</td><td dir="ltr">${esc(email)}</td></tr>
        ${phone ? `<tr><td style="padding:8px 0;font-weight:bold">טלפון:</td><td dir="ltr">${esc(phone)}</td></tr>` : ''}
        ${subject ? `<tr><td style="padding:8px 0;font-weight:bold">נושא:</td><td>${esc(subject)}</td></tr>` : ''}
      </table>
      <div style="background:#f9fafb;border-right:4px solid #C8960C;border-radius:4px;padding:16px 20px;margin:16px 0">
        <p style="color:#111827;font-size:15px;margin:0;white-space:pre-wrap">${esc(message)}</p>
      </div>
      <p style="color:#6b7280;font-size:13px">
        להשיב, שלח מייל ל: <a href="mailto:${esc(email)}" style="color:#1B3F6E">${esc(email)}</a>
      </p>
    `,
  })
}

/* ── 5. אדמין → פנייה מלקוח קיים (דשבורד) ─────────────────────── */
export async function sendSupportAdminEmail({ storeName, ownerEmail, category, message }) {
  await send({
    to: process.env.ADMIN_EMAIL,
    subject: `🛟 פנייה מלקוח — ${storeName}${category ? ` (${category})` : ''}`,
    html: `
      <h2 style="color:#1B3F6E;margin-top:0">התקבלה פנייה מלקוח קיים</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151">
        <tr><td style="padding:8px 0;font-weight:bold;width:100px">עסק:</td><td>${esc(storeName)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">מייל:</td><td dir="ltr">${esc(ownerEmail)}</td></tr>
        ${category ? `<tr><td style="padding:8px 0;font-weight:bold">סוג פנייה:</td><td>${esc(category)}</td></tr>` : ''}
      </table>
      <div style="background:#f9fafb;border-right:4px solid #C8960C;border-radius:4px;padding:16px 20px;margin:16px 0">
        <p style="color:#111827;font-size:15px;margin:0;white-space:pre-wrap">${esc(message)}</p>
      </div>
      <p style="color:#6b7280;font-size:13px">
        להשיב, שלח מייל ל: <a href="mailto:${esc(ownerEmail)}" style="color:#1B3F6E">${esc(ownerEmail)}</a>
      </p>
    `,
  })
}
