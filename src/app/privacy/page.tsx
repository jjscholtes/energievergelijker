import { Metadata } from 'next';
import { ArrowLeft, Shield, Eye, Database, Lock } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacybeleid | Beste Energiecontract',
  description: 'Privacybeleid van Beste Energiecontract - Hoe wij uw gegevens beschermen en gebruiken.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Terug naar homepage</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Shield className="w-5 h-5" />
              <span>Privacy & Beveiliging</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Privacybeleid
            </h1>
            <p className="text-xl text-gray-600">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-600" />
                Wie zijn wij?
              </h2>
              <p className="text-gray-700 mb-4">
                Beste Energiecontract is een specialistische energievergelijker die zich richt op het vinden van de beste energiecontracten voor huishoudens met zonnepanelen, warmtepompen en elektrische auto's.
              </p>
              <p className="text-gray-700">
                Wij respecteren uw privacy en zijn verplicht om uw persoonlijke gegevens te beschermen volgens de Algemene Verordening Gegevensbescherming (AVG/GDPR).
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Database className="w-6 h-6 text-green-600" />
                Welke gegevens verzamelen wij?
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Gegevens die u vrijwillig verstrekt:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Energieverbruik:</strong> Jaarlijks stroom- en gasverbruik</li>
                  <li>• <strong>Zonnepanelen informatie:</strong> Opbrengst en capaciteit</li>
                  <li>• <strong>Warmtepomp/Elektrische auto:</strong> Verbruiksgegevens</li>
                  <li>• <strong>Contactgegevens:</strong> Email voor resultaten (optioneel)</li>
                  <li>• <strong>Locatie:</strong> Postcode voor netbeheerder bepaling</li>
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Automatisch verzamelde gegevens:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Website gebruik:</strong> Pagina's bekeken, tijd op site</li>
                  <li>• <strong>Technische gegevens:</strong> Browser type, IP-adres, apparaat</li>
                  <li>• <strong>Cookies:</strong> Voor website functionaliteit en analyse</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-purple-600" />
                Hoe gebruiken wij uw gegevens?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Primaire doeleinden:</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Energiecontract vergelijking</li>
                    <li>• Kostenberekeningen</li>
                    <li>• Salderingsberekeningen</li>
                    <li>• Website functionaliteit</li>
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Secundaire doeleinden:</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Website verbetering</li>
                    <li>• Gebruikerservaring optimalisatie</li>
                    <li>• Statistieken en analyse</li>
                    <li>• Service ontwikkeling</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies en tracking</h2>
              <div className="bg-yellow-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Noodzakelijke cookies:</h3>
                <p className="text-gray-700 text-sm">
                  Deze cookies zijn essentieel voor het functioneren van de website en kunnen niet worden uitgeschakeld.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Analytische cookies:</h3>
                <p className="text-gray-700 text-sm">
                  Wij gebruiken Vercel Analytics om te begrijpen hoe bezoekers onze website gebruiken. Deze gegevens zijn geanonimiseerd.
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Uw keuzes:</h3>
                <p className="text-gray-700 text-sm">
                  U kunt uw cookie voorkeuren op elk moment aanpassen via de cookie-instellingen in de footer van onze website.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Uw rechten</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Toegang</h3>
                  <p className="text-gray-700 text-sm">Vraag welke gegevens wij van u hebben</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Rectificatie</h3>
                  <p className="text-gray-700 text-sm">Corrigeer onjuiste gegevens</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Verwijdering</h3>
                  <p className="text-gray-700 text-sm">Vraag om verwijdering van uw gegevens</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Beperking</h3>
                  <p className="text-gray-700 text-sm">Beperk de verwerking van uw gegevens</p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact</h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Heeft u vragen over dit privacybeleid of wilt u gebruik maken van uw rechten?
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@besteenergiecontract.nl<br />
                  <strong>Telefoon:</strong> +31 123 456 789
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
