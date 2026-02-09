import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const fromAddress = () =>
  process.env.EMAIL_FROM || process.env.SMTP_USER || "Woo-Huahua Microchipping Database <noreply@woo-huahua.co.uk>";

const productName = "Woo-Huahua Microchipping Database";

const primaryColor = "#c2185b";
const primaryHover = "#a01448";
const textColor = "#333333";
const mutedColor = "#666666";
const borderColor = "#eeeeee";
const bgLight = "#f9f9f9";

function getVerificationEmailHtml(verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
  <style type="text/css">
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
    table { border-collapse: collapse; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    @media only screen and (max-width: 620px) {
      .wrapper { width: 100% !important; max-width: 100% !important; }
      .pad { padding-left: 16px !important; padding-right: 16px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.5; color: ${textColor}; background-color: #f0f0f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f0f0; padding: 24px 0;">
    <tr>
      <td align="center" class="pad">
        <table role="presentation" class="wrapper" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color: ${primaryColor}; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: 0.5px;">Woo-Huahua</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.9);">Microchipping Database</p>
            </td>
          </tr>
          <tr>
            <td class="pad" style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: ${textColor};">Thanks for signing up to the <strong>${productName}</strong>.</p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: ${textColor};">Please verify your email by clicking the button below. This confirms we can reach you for your account.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="left" style="margin: 0;">
                <tr>
                  <td style="border-radius: 6px; background-color: ${primaryColor};">
                    <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none;">Verify my email</a>
                  </td>
                </tr>
              </table>
              <div style="clear: both; height: 24px;"></div>
              <p style="margin: 24px 0 0 0; font-size: 13px; color: ${mutedColor};">If the button doesn’t work, copy and paste this link into your browser:</p>
              <p style="margin: 8px 0 0 0; font-size: 12px; word-break: break-all; color: #888888;">${verificationUrl}</p>
              <p style="margin: 24px 0 0 0; font-size: 13px; color: ${mutedColor};">This link expires in 24 hours.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: ${bgLight}; border-top: 1px solid ${borderColor}; font-size: 12px; color: ${mutedColor}; text-align: center;">
              You’re receiving this because you signed up at Woo-Huahua Microchipping Database.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Send verification email with link. Returns true if sent, false if SMTP not configured or send failed.
 */
export async function sendVerificationEmail(
  to: string,
  verificationUrl: string
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("Email not sent: SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS).");
    return false;
  }
  try {
    await transporter.sendMail({
      from: fromAddress(),
      to,
      subject: `Verify your ${productName} account`,
      text: `Thanks for signing up to the ${productName}.\n\nPlease verify your email by opening this link:\n\n${verificationUrl}\n\nThe link expires in 24 hours.`,
      html: getVerificationEmailHtml(verificationUrl),
    });
    return true;
  } catch (e) {
    console.error("Failed to send verification email:", e);
    return false;
  }
}
