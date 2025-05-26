
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, Smartphone } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Analyses'
    },
    {
      path: '/infos',
      icon: Info,
      label: 'Infos'
    },
    {
      path: '/medias',
      icon: Smartphone,
      label: 'Médias'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'text-sport-primary bg-sport-primary/10' 
                  : 'text-gray-500 hover:text-sport-primary hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-sport-primary' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-sport-primary' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
