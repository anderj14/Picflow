using System.Globalization;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Core.Services;

public class EmailSettings
{
  public string FromAddress { get; set; } = string.Empty;
  public string FromPassword { get; set; } = string.Empty;
  public string DisplayName { get; set; } = "Picflow Studio";
}

public class EmailService(IOptions<EmailSettings> options) : IEmailService
{
  public async Task SendConfirmacionCitaAsync(
      string toEmail, string nombreCliente, DateTime fechaHora, string servicio, string citaId)
  {
    var cfg = options.Value;
    var from = cfg.FromAddress is { Length: > 0 } f ? f : throw new InvalidOperationException("Email:FromAddress not configured.");
    var password = cfg.FromPassword is { Length: > 0 } p ? p : throw new InvalidOperationException("Email:FromPassword not configured.");
    var display = cfg.DisplayName;

    var culture = new CultureInfo("es-DO");
    var fechaFormateada = fechaHora.ToString("dddd, dd 'de' MMMM 'de' yyyy", culture);
    var horaFormateada = fechaHora.ToString("hh:mm tt", CultureInfo.InvariantCulture);
    var referencia = citaId.Length >= 8 ? citaId[..8].ToUpper() : citaId.ToUpper();

    var body = $"""
            <!DOCTYPE html>
            <html lang="es">
            <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width"/></head>
            <body style="margin:0;padding:0;background:#f6f7f8;font-family:'Inter',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f8;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:#186adc;padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">📷 Picflow Studio</h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Confirmación de solicitud de cita</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 24px;color:#374151;font-size:16px;">Hola <strong>{nombreCliente}</strong>,</p>
                        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                          Hemos recibido tu solicitud de cita. A continuación los detalles:
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0"
                               style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:10px;margin-bottom:28px;">
                          <tr><td style="padding:24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding:8px 0;color:#374151;font-size:14px;font-weight:600;width:140px;">📅 Fecha:</td>
                                <td style="padding:8px 0;color:#1e40af;font-size:14px;font-weight:700;">{fechaFormateada}</td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;color:#374151;font-size:14px;font-weight:600;">🕐 Hora:</td>
                                <td style="padding:8px 0;color:#1e40af;font-size:14px;font-weight:700;">{horaFormateada}</td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;color:#374151;font-size:14px;font-weight:600;">📸 Servicio:</td>
                                <td style="padding:8px 0;color:#374151;font-size:14px;">{servicio}</td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;color:#374151;font-size:14px;font-weight:600;">🔖 Referencia:</td>
                                <td style="padding:8px 0;color:#6b7280;font-size:13px;font-family:monospace;">{referencia}</td>
                              </tr>
                            </table>
                          </td></tr>
                        </table>
                        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:28px;">
                          <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                            ⚠️ <strong>Tu cita está pendiente de confirmación.</strong>
                            Nuestro equipo la revisará y te notificará por correo en breve.
                          </p>
                        </div>
                        <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                          Si tienes alguna pregunta no dudes en contactarnos.<br>
                          Gracias por elegir <strong>Picflow Studio</strong>.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 Picflow Studio — Santiago, República Dominicana</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

    using var client = new SmtpClient("smtp.gmail.com", 587)
    {
      EnableSsl = true,
      Credentials = new NetworkCredential(from, password),
    };

    var mail = new MailMessage
    {
      From = new MailAddress(from, display),
      Subject = "Confirmación de Solicitud de Cita — Picflow Studio",
      Body = body,
      IsBodyHtml = true,
    };
    mail.To.Add(toEmail);

    await client.SendMailAsync(mail);
  }

  public async Task SendCitaConfirmadaAsync(
      string toEmail, string nombreCliente, DateTime fechaHora, string servicio, string ubicacion, string citaId)
  {
    var cfg      = options.Value;
    var from     = cfg.FromAddress  is { Length: > 0 } f ? f : throw new InvalidOperationException("Email:FromAddress not configured.");
    var password = cfg.FromPassword is { Length: > 0 } p ? p : throw new InvalidOperationException("Email:FromPassword not configured.");
    var display  = cfg.DisplayName;

    var culture         = new CultureInfo("es-DO");
    var fechaFormateada = fechaHora.ToString("dddd, dd 'de' MMMM 'de' yyyy", culture);
    var horaFormateada  = fechaHora.ToString("hh:mm tt", CultureInfo.InvariantCulture);
    var referencia      = citaId.Length >= 8 ? citaId[..8].ToUpper() : citaId.ToUpper();
    var ubicacionRow    = string.IsNullOrWhiteSpace(ubicacion) ? "" : $"""
        <tr>
          <td style="padding:8px 0;color:#374151;font-size:14px;font-weight:600;width:140px;">📍 Ubicación:</td>
          <td style="padding:8px 0;color:#374151;font-size:14px;">{ubicacion}</td>
        </tr>
        """;

    var body = $"""
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width"/></head>
        <body style="margin:0;padding:0;background:#f6f7f8;font-family:'Inter',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f8;padding:40px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0"
                     style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#16a34a;padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">📷 Picflow Studio</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">¡Tu cita ha sido confirmada!</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 24px;color:#374151;font-size:16px;">Hola <strong>{nombreCliente}</strong>,</p>
                    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                      Nos complace informarte que tu cita ha sido <strong style="color:#16a34a;">confirmada</strong>.
                      Te esperamos en la fecha y hora indicada.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0"
                           style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:28px;">
                      <tr><td style="padding:24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:8px 0;color:#374151;font-size:14px;font-weight:600;width:140px;">📅 Fecha:</td>
                            <td style="padding:8px 0;color:#15803d;font-size:14px;font-weight:700;">{fechaFormateada}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;color:#374151;font-size:14px;font-weight:600;">🕐 Hora:</td>
                            <td style="padding:8px 0;color:#15803d;font-size:14px;font-weight:700;">{horaFormateada}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;color:#374151;font-size:14px;font-weight:600;">📸 Servicio:</td>
                            <td style="padding:8px 0;color:#374151;font-size:14px;">{servicio}</td>
                          </tr>
                          {ubicacionRow}
                          <tr>
                            <td style="padding:8px 0;color:#374151;font-size:14px;font-weight:600;">🔖 Referencia:</td>
                            <td style="padding:8px 0;color:#6b7280;font-size:13px;font-family:monospace;">{referencia}</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:28px;">
                      <p style="margin:0;color:#1e40af;font-size:13px;line-height:1.5;">
                        💡 <strong>Recuerda llegar 10 minutos antes</strong> de tu sesión.
                        Si necesitas cancelar o reagendar, contáctanos con anticipación.
                      </p>
                    </div>
                    <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                      ¡Te esperamos!<br>
                      El equipo de <strong>Picflow Studio</strong>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 Picflow Studio — Santiago, República Dominicana</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;

    using var client = new SmtpClient("smtp.gmail.com", 587)
    {
      EnableSsl = true,
      Credentials = new NetworkCredential(from, password),
    };

    var mail = new MailMessage
    {
      From       = new MailAddress(from, display),
      Subject    = "✅ Cita Confirmada — Picflow Studio",
      Body       = body,
      IsBodyHtml = true,
    };
    mail.To.Add(toEmail);

    await client.SendMailAsync(mail);
  }
}
