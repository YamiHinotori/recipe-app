import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChefHat, Package, Store, Users, UserCog, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isAdmin } = useAdmin();

  const handleLogout = async () => {
    if (window.confirm('Möchtest du dich wirklich abmelden?')) {
      await logout();
    }
  };

  const sections = [
    {
      title: 'Inhalte',
      items: [
        {
          icon: ChefHat,
          label: 'Rezepte verwalten',
          description: 'Rezepte hinzufügen und bearbeiten',
          to: '/admin',
          iconColor: 'text-orange-500',
          iconBg: 'bg-orange-100',
        },
        {
          icon: Package,
          label: 'Produktdatenbank',
          description: 'Produkte für die Autocomplete-Suche pflegen',
          to: '/products',
          iconColor: 'text-blue-500',
          iconBg: 'bg-blue-100',
        },
        {
          icon: Store,
          label: 'Läden & Layouts',
          description: 'Einkaufslisten-Sortierung nach Laden einrichten',
          to: '/stores',
          iconColor: 'text-green-500',
          iconBg: 'bg-green-100',
        },
      ],
    },
    {
      title: 'Gruppe',
      items: [
        {
          icon: Users,
          label: 'Gruppenverwaltung',
          description: 'Mitglieder einladen und verwalten',
          to: '/gruppe',
          iconColor: 'text-purple-500',
          iconBg: 'bg-purple-100',
        },
        ...(isAdmin
          ? [
              {
                icon: UserCog,
                label: 'Nutzerverwaltung',
                description: 'Benutzerkonten einsehen und verwalten',
                to: '/admin/users',
                iconColor: 'text-rose-500',
                iconBg: 'bg-rose-100',
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">

      {/* Sticky Header – gleiche Struktur wie alle anderen Seiten */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Zurück"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Einstellungen</h1>
              {user && (
                <p className="text-sm text-gray-600">
                  {user.displayName || user.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inhalt */}
      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-6">

        {sections.map(section => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map(({ icon: Icon, label, description, to, iconColor, iconBg }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow text-left w-full"
                >
                  <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Abmelden */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Konto
          </h2>
          <button
            onClick={handleLogout}
            className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow text-left w-full md:w-auto"
          >
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-600">Abmelden</p>
              <p className="text-sm text-gray-500 mt-0.5">{user?.displayName || user?.email}</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
