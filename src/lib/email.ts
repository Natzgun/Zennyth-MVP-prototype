import { Resend } from "resend";
import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Falta RESEND_API_KEY en .env.local");
  return new Resend(key);
}

type SendResult = { ok: true; id: string } | { ok: false; error: string };

export async function validateEmail(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

export async function sendBetaInvite(
  email: string
): Promise<SendResult> {
  const from =
    process.env.EMAIL_FROM ?? "Zennyth <onboarding@resend.dev>";

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from,
      to: [email],
      subject: "Has sido seleccionado para Zennyth Beta 🎉",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden">
          <tr>
            <td style="padding:40px 32px 24px;text-align:center;background:linear-gradient(135deg,#2d6a4f 0%,#40916c 100%)">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700">Zennyth</h1>
              <p style="margin:8px 0 0;color:#d8f3dc;font-size:14px">Beta exclusiva</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px">
              <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:18px;font-weight:600">
                Has sido seleccionado 🎉
              </h2>
              <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.6">
                Gracias por tu paciencia. Has sido elegido para probar Zennyth en exclusiva
                antes de que esté disponible para todos.
              </p>
              <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.6">
                <strong>Tu acceso:</strong><br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}"
                   style="color:#2d6a4f;font-weight:600;text-decoration:underline">
                  ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}
                </a>
              </p>
              <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6">
                Simplemente ingresa con el mismo correo con el que te registraste
                y empieza a organizar tu día con calma.
              </p>
              <div style="text-align:center;margin:24px 0">
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}"
                   style="display:inline-block;background:#2d6a4f;color:#ffffff;text-decoration:none;
                          padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600">
                  Comenzar ahora
                </a>
              </div>
              <p style="margin:0;color:#888;font-size:12px;line-height:1.5;text-align:center">
                Si tienes preguntas, responde a este correo.<br>
                Disfruta del viaje — el equipo de Zennyth
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
