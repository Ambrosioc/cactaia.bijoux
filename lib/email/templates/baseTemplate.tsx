import React from 'react';

interface BaseTemplateProps {
  previewText?: string;
  children: React.ReactNode;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({ previewText = 'Email de Cactaia.Bijoux', children }) => {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>{previewText}</title>
        <style dangerouslySetInnerHTML={{
          __html: `
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
            background-color: #f5f5f4;
            color: #333333;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #e5e5e5;
          }
          .logo {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 24px;
            font-weight: 500;
            color: #333333;
          }
          .logo-dot {
            color: #4A7C59;
          }
          .content {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            font-size: 12px;
            color: #666666;
          }
          .button {
            display: inline-block;
            background-color: #4A7C59;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: 500;
            margin: 20px 0;
          }
          .text-muted {
            color: #666666;
          }
          .text-center {
            text-align: center;
          }
          .mt-4 {
            margin-top: 16px;
          }
          .mb-4 {
            margin-bottom: 16px;
          }
          h1, h2, h3 {
            font-family: 'Playfair Display', Georgia, serif;
            color: #333333;
          }
          p {
            line-height: 1.6;
          }
          a {
            color: #4A7C59;
            text-decoration: none;
          }
          .divider {
            border-top: 1px solid #e5e5e5;
            margin: 20px 0;
          }
          .social-links {
            margin-top: 20px;
          }
          .social-link {
            display: inline-block;
            margin: 0 10px;
          }
          @media only screen and (max-width: 600px) {
            .container {
              width: 100%;
              padding: 10px;
            }
            .content {
              padding: 20px;
            }
          }
        `}} />
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="logo">
              Cactaia<span className="logo-dot">.</span>Bijoux
            </div>
          </div>
          <div className="content">
            {children}
          </div>
          <div className="footer">
            <p>
              © {new Date().getFullYear()} Cactaia.Bijoux. Tous droits réservés.
            </p>
            <p>
              42 rue Maurice Violette, 28600 Luisant, France
            </p>
            <div className="social-links">
              <a href="https://instagram.com" className="social-link">Instagram</a>
              <a href="https://facebook.com" className="social-link">Facebook</a>
            </div>
            <div className="mt-4">
              <a href="https://cactaiabijoux.fr/mentions-legales">Mentions légales</a> |
              <a href="https://cactaiabijoux.fr/politique-de-confidentialite">Politique de confidentialité</a>
            </div>
            <p className="mt-4 text-muted">
              Vous recevez cet email car vous avez effectué une action sur notre site.
              Pour vous désabonner de nos communications marketing, cliquez <a href="https://cactaiabijoux.fr/unsubscribe">ici</a>.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

// Simple HTML template function that doesn't use React rendering
export function createEmailHTML(content: string, previewText: string = 'Email de Cactaia.Bijoux'): string {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${previewText}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
            background-color: #f5f5f4;
            color: #333333;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #e5e5e5;
        }
        .logo {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 24px;
            font-weight: 500;
            color: #333333;
        }
        .logo-dot {
            color: #4A7C59;
        }
        .content {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px 0;
            font-size: 12px;
            color: #666666;
        }
        .button {
            display: inline-block;
            background-color: #4A7C59;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: 500;
            margin: 20px 0;
        }
        .text-muted {
            color: #666666;
        }
        .text-center {
            text-align: center;
        }
        .mt-4 {
            margin-top: 16px;
        }
        .mb-4 {
            margin-bottom: 16px;
        }
        h1, h2, h3 {
            font-family: 'Playfair Display', Georgia, serif;
            color: #333333;
        }
        p {
            line-height: 1.6;
        }
        a {
            color: #4A7C59;
            text-decoration: none;
        }
        .divider {
            border-top: 1px solid #e5e5e5;
            margin: 20px 0;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-link {
            display: inline-block;
            margin: 0 10px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100%;
                padding: 10px;
            }
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                Cactaia<span class="logo-dot">.</span>Bijoux
            </div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>
                © ${currentYear} Cactaia.Bijoux. Tous droits réservés.
            </p>
            <p>
                42 rue Maurice Violette, 28600 Luisant, France
            </p>
            <div class="social-links">
                <a href="https://instagram.com" class="social-link">Instagram</a>
                <a href="https://facebook.com" class="social-link">Facebook</a>
            </div>
            <div class="mt-4">
                <a href="https://cactaiabijoux.fr/mentions-legales">Mentions légales</a> |
                <a href="https://cactaiabijoux.fr/politique-de-confidentialite">Politique de confidentialité</a>
            </div>
            <p class="mt-4 text-muted">
                Vous recevez cet email car vous avez effectué une action sur notre site.
                Pour vous désabonner de nos communications marketing, cliquez <a href="https://cactaiabijoux.fr/unsubscribe">ici</a>.
            </p>
        </div>
    </div>
</body>
</html>`;
}

// Keep the old function name for backward compatibility
export function renderEmailTemplate(template: React.ReactElement): string {
  // This function is deprecated - use createEmailHTML instead
  return createEmailHTML('<div>Template content</div>');
}