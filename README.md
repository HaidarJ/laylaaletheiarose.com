# laylaaletheiarose.com

Website for Layla Aletheia Rose: tarot and divination readings online.

Plain HTML, CSS and JavaScript. No build step, no dependencies, no cookies, no analytics. Hosted on GitHub Pages.

## Files

```
index.html          Home
about.html          About
contact.html        Contact: prices, WhatsApp enquiry form, FAQ
privacy.html        Privacy notice (footer)
terms.html          Reading terms (footer)
404.html            Not-found page (GitHub Pages serves it automatically)
assets/css/site.css Design system: colours, type, layout, motion
assets/js/site.js   Sample-question hand-off, WhatsApp enquiry form, motion
assets/fonts/       IM Fell English and Spectral, self-hosted (SIL Open Font License)
assets/img/         Favicon, Apple touch icon, social share image
CNAME               Custom domain for GitHub Pages
robots.txt, sitemap.xml
```

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## How the enquiry form works

The form checks the required fields in the browser, then opens WhatsApp with the enquiry written out. The website stores and sends nothing itself.

- The WhatsApp number is the `data-whatsapp` attribute on the form in `contact.html`, in international format, digits only (for example `353857364285`).
- If the attribute is empty, the form shows a preview of the message instead of opening WhatsApp.
- Visitors without WhatsApp see the email address under the form.

## Deploy

GitHub Pages serves the `main` branch from the repository root (**Settings → Pages → Build and deployment → Deploy from a branch → main / (root)**). The `CNAME` file sets the custom domain.

DNS records at the domain registrar (GoDaddy):

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | haidarj.github.io |

Remove any other `A` record on `@` (such as GoDaddy's parking record) and turn off domain forwarding. Once GitHub has issued the certificate, tick **Enforce HTTPS** in Settings → Pages.

## Keeping things in step

- **Prices** appear in `contact.html` (price cards and meta description), `terms.html` and the JSON-LD in `index.html`.
- **Sample questions** live in `index.html` (the cards) and in the `QUESTIONS` map in `assets/js/site.js`. Keep the ids (`year`, `timing`, `decision`, `work`, `impasse`, `daily`, `relationship`, `home`) in sync.
- **Contact details** (WhatsApp number and email) appear in `contact.html`, every page footer, `privacy.html`, `terms.html` and the JSON-LD in `index.html`.

## Design reference

| Token | Hex | Use |
|---|---|---|
| Sub Rosa | `#1E1618` | Dark grounds |
| Aletheia Rose | `#8A3644` | Buttons and links (`#D9A1A9` on dark) |
| Vellum | `#F3ECE8` | Light grounds |
| Petal | `#E8D2CC` | Soft panels |
| Ma'at Ochre | `#A6824A` | Hairlines and marks (`#6F5126` for small text on light, `#C9A86E` on dark) |
| Ink | `#3B3133` | Body text |

Text pairings meet WCAG 2.2 AA. Fonts: IM Fell English (display) and Spectral / Spectral SC (text and labels), both under the SIL Open Font License. Licences are in `assets/fonts/`.
