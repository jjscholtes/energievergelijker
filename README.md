# ⚡ Energievergelijker

Een moderne, responsive web applicatie voor het vergelijken van Nederlandse energiecontracten, specifiek geoptimaliseerd voor huishoudens met zonnepanelen.

## 🚀 Live Demo

[Deploy naar Vercel](https://vercel.com/new) om de applicatie live te zetten.

## ✨ Features

### 🏠 Energiecontract Vergelijking
- **Vaste contracten** met traditionele tarieven
- **Dynamische contracten** gebaseerd op spotmarktprijzen
- **Accurate berekeningen** inclusief alle kostencomponenten
- **Saldering optimalisatie** voor zonnepanelen eigenaren

### 📊 Geavanceerde Berekeningen
- **Energiebelasting** en BTW berekeningen
- **Netbeheerkosten** per regio/postcode
- **Terugleververgoedingen** en terugleverkosten
- **Vermindering energiebelasting** (heffingskorting)
- **Monte Carlo sampling** voor risico-analyse

### 🎨 Modern Design
- **Responsive design** voor alle apparaten
- **Animated gradients** en hover effecten
- **Glassmorphism** styling
- **Custom CSS animaties**
- **SEO geoptimaliseerd**

### 📰 Content Management
- **Artikel systeem** met volledige pagina's
- **Categorieën** en tags
- **Social sharing** ready
- **Static Site Generation**

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** (App Router)
- **React 18** met TypeScript
- **Tailwind CSS** voor styling
- **shadcn/ui** component library
- **Recharts** voor data visualisatie

### State Management & Data
- **Zustand** voor state management
- **Zod** voor schema validatie
- **PapaParse** voor CSV parsing
- **date-fns** voor datum manipulatie

### Development Tools
- **Turbopack** voor snelle development
- **Jest** & **React Testing Library** voor testing
- **ESLint** voor code quality
- **TypeScript** strict mode

## 📁 Project Structuur

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles + animations
│   ├── artikelen/[slug]/  # Dynamic article pages
│   └── api/calculate-cost/ # API endpoint
├── components/            # React components
│   ├── forms/             # User input forms
│   ├── results/           # Results display
│   ├── articles/          # Article components
│   └── layout/            # Layout components
├── lib/                   # Business logic
│   ├── calculations/      # Energy calculation engines
│   ├── data/             # Static data (articles, contracts)
│   ├── stores/           # Zustand stores
│   └── utils/            # Utility functions
└── types/                # TypeScript definitions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm of yarn

### Installation

1. **Clone de repository**
```bash
git clone https://github.com/yourusername/energievergelijker.git
cd energievergelijker
```

2. **Installeer dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Linting
npm run lint         # Run ESLint
```

## 🌐 Deployment

### Vercel (Aanbevolen)

1. **Push naar GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy naar Vercel**
- Ga naar [vercel.com](https://vercel.com)
- Import je GitHub repository
- Vercel detecteert automatisch Next.js
- Deploy!

### Environment Variables

Voor productie, stel deze environment variables in:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 📊 Data Sources

### Energiecontracten
- **Vaste contracten**: Statische data met huidige marktprijzen
- **Dynamische contracten**: CSV bestanden met spotmarktprijzen
- **Netbeheerkosten**: Per regio/postcode gebaseerd

### Artikelen
- **Markdown content** met metadata
- **SEO geoptimaliseerd** met Open Graph
- **Static Site Generation** voor performance

## 🧪 Testing

```bash
# Run alle tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests met coverage
npm run test:coverage
```

## 📈 Performance

- **Next.js optimizations**: Automatic code splitting, image optimization
- **Static Site Generation**: Voor artikelen en statische content
- **Bundle optimization**: Met Turbopack voor development
- **Core Web Vitals**: Geoptimaliseerd voor Google's metrics

## 🔧 Configuration

### Next.js Config (`next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
```

## 🤝 Contributing

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je changes (`git commit -m 'Add amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 📞 Support

Voor vragen of support, open een [GitHub Issue](https://github.com/yourusername/energievergelijker/issues).

---

**Gemaakt met ❤️ voor de Nederlandse energiemarkt**