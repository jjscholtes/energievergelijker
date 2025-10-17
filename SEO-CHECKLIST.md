# SEO Checklist & Verbeteringen - Beste Energiecontract

## ✅ Uitgevoerde Verbeteringen (17 oktober 2025)

### 1. Robots.txt Optimalisatie
- ✅ Verwijderd dubbele `User-agent: *` statements
- ✅ Toegevoegd `Google-Extended` bot met crawl-delay
- ✅ Verbeterde structuur voor betere leesbaarheid
- 📍 Locatie: `/public/robots.txt`

### 2. Sitemap Verbetering
- ✅ Geüpdatete datums naar 2025-10-17
- ✅ Toegevoegde ontbrekende pagina's:
  - `/tool` (priority: 0.9)
  - `/tool/vergelijken` (priority: 0.9)
  - `/tool/batterij` (priority: 0.8)
  - `/artikelen` (priority: 0.8)
  - `/privacy` (priority: 0.3)
- ✅ **Dynamische sitemap generator** aangemaakt (`/src/app/sitemap.ts`)
  - Genereert automatisch URLs voor alle artikelen
  - Gebruikt actuele datums
  - Handhaaft correcte prioriteiten
- 📍 Locaties: 
  - `/public/sitemap.xml` (statisch backup)
  - `/src/app/sitemap.ts` (dynamisch, primair)

### 3. Dynamische Robots.txt Generator
- ✅ Aangemaakt dynamische robots.txt generator
- ✅ Automatisch gegenereerd via Next.js
- 📍 Locatie: `/src/app/robots.ts`

### 4. Metadata Verbeteringen
- ✅ Geüpdatet jaar van "2024" naar "2025" in hoofdmetadata
- ✅ Verwijderd placeholder Google verification code
- ✅ Toegevoegd layout.tsx bestanden met metadata voor tool pagina's:
  - `/src/app/tool/layout.tsx`
  - `/src/app/tool/batterij/layout.tsx`
  - `/src/app/tool/vergelijken/layout.tsx`

### 5. Bestaande Sterke Punten
- ✅ Structured data (JSON-LD) aanwezig op:
  - Homepage (WebApplication + Organization schema)
  - Artikelpagina's (Article + Breadcrumb schema)
- ✅ Open Graph metadata op alle belangrijke pagina's
- ✅ Twitter Card metadata
- ✅ Canonical URLs correct ingesteld
- ✅ Security headers goed geconfigureerd
- ✅ Mobile-friendly responsive design
- ✅ Lazy loading voor below-the-fold content

## 📋 SEO Checklist - Toekomstige Optimalisaties

### High Priority

#### 1. Google Search Console Setup
- [ ] Registreer website in Google Search Console
- [ ] Voeg verificatiecode toe aan `src/app/layout.tsx` (regel 60)
- [ ] Submit sitemap.xml naar Google
- [ ] Monitor indexatiestatus en errors
- [ ] Controleer Core Web Vitals

#### 2. Bing Webmaster Tools
- [ ] Registreer website in Bing Webmaster Tools
- [ ] Submit sitemap

#### 3. Images & Alt Text
- [ ] Audit alle images op alt text
- [ ] Voeg descriptieve alt text toe waar nodig
- [ ] Optimaliseer image formaten (gebruik Next.js Image component)
- [ ] Implementeer responsive images

#### 4. Rich Snippets & Structured Data
- [ ] Voeg FAQ schema toe aan FAQ sectie
- [ ] Voeg HowTo schema toe voor tool instructies
- [ ] Test structured data met Google Rich Results Test
- [ ] Voeg Product schema toe voor batterij showcase

### Medium Priority

#### 5. Content Optimalisatie
- [ ] Voeg meer interne links toe tussen gerelateerde pagina's
- [ ] Optimaliseer heading hierarchie (H1, H2, H3)
- [ ] Verbeter meta descriptions (max 155-160 karakters)
- [ ] Voeg meer long-tail keywords toe
- [ ] Update oude artikelen met nieuwe data

#### 6. Performance
- [ ] Implementeer lazy loading voor images
- [ ] Optimaliseer JavaScript bundles
- [ ] Implementeer route prefetching
- [ ] Enable Gzip/Brotli compressie
- [ ] Minimaliseer CSS

#### 7. Technical SEO
- [ ] Implementeer XML sitemap index voor grote sites
- [ ] Voeg hreflang tags toe (indien internationale versies)
- [ ] Implementeer breadcrumb markup op alle pagina's
- [ ] Voeg 404 error pagina toe met goede UX
- [ ] Implementeer 301 redirects voor oude URLs

### Low Priority

#### 8. Social Media
- [ ] Voeg Open Graph images toe (1200x630px)
- [ ] Test social media previews
- [ ] Voeg social media share buttons toe
- [ ] Implementeer Twitter Card images

#### 9. Analytics & Tracking
- [ ] Setup Google Analytics 4
- [ ] Implementeer event tracking voor conversies
- [ ] Setup conversion goals
- [ ] Monitor bounce rate en time on page
- [ ] Setup heatmap tracking (Hotjar/Clarity)

#### 10. Local SEO (indien relevant)
- [ ] Voeg LocalBusiness schema toe
- [ ] Registreer in Google My Business
- [ ] Voeg NAP (Name, Address, Phone) toe aan footer

## 🔍 SEO Monitoring - Belangrijke Metrics

### Google Search Console
- Impressions (vertoningen)
- Click-through rate (CTR)
- Average position
- Coverage errors
- Core Web Vitals (LCP, FID, CLS)

### Analytics
- Organic traffic groei
- Bounce rate
- Time on page
- Pages per session
- Conversion rate

### Technical
- Page load speed (< 3 seconden)
- Mobile usability
- HTTPS security
- Crawl errors

## 📊 Huidige SEO Status

### Sterke Punten
✅ Moderne Next.js 13+ App Router implementatie
✅ Server-side rendering (SSR) voor SEO
✅ Dynamische sitemap en robots.txt
✅ Structured data aanwezig
✅ Responsive mobile design
✅ Security headers geconfigureerd
✅ Clean URL structuur
✅ Fast page loads met Vercel hosting

### Aandachtspunten
⚠️ Google Search Console nog niet geregistreerd
⚠️ Enkele images missen mogelijk alt text
⚠️ Geen FAQ schema op FAQ secties
⚠️ Open Graph images kunnen worden toegevoegd

## 🔗 Handige Links

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema.org Documentation](https://schema.org/)

## 📝 Onderhoud

### Maandelijks
- [ ] Check Google Search Console voor errors
- [ ] Review organic traffic trends
- [ ] Update artikel publicatiedatums in sitemap
- [ ] Check broken links

### Kwartaalmatig
- [ ] Content audit - update oude content
- [ ] Keyword research voor nieuwe content
- [ ] Competitor analysis
- [ ] Backlink profile review

### Jaarlijks
- [ ] Volledige SEO audit
- [ ] Update all jaar-specifieke content (2025 → 2026)
- [ ] Review en update structured data
- [ ] Comprehensive competitor analysis

## 🎯 Next Steps (Aanbevolen Volgorde)

1. **Nu**: Google Search Console registratie
2. **Deze week**: Alt text audit voor alle images
3. **Deze maand**: FAQ schema implementatie
4. **Volgend kwartaal**: Content expansie met meer artikelen

---

**Laatste update**: 17 oktober 2025
**Volgende review**: November 2025

