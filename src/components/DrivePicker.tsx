import React, { useEffect, useState } from 'react';
import { getAccessToken } from '../lib/auth';
import { Cloud, FileUp } from 'lucide-react';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export const DrivePicker: React.FC<{ onResult: (files: any[]) => void }> = ({ onResult }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadScript = () => {
      if (document.getElementById('google-api-script')) return;
      
      const script = document.createElement('script');
      script.id = 'google-api-script';
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('picker', () => {
          setIsLoaded(true);
        });
      };
      document.body.appendChild(script);
    };

    loadScript();
  }, []);

  const openPicker = () => {
    if (!isLoaded) return;
    const token = getAccessToken();
    if (!token) {
      alert('براہ کرم پہلے گوگل میں سائن ان کریں۔');
      return;
    }

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(token)
      .setDeveloperKey((import.meta as any).env.VITE_GOOGLE_API_KEY || '') // Placeholder, should be configured
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          onResult(data.docs);
        }
      })
      .build();
      
    picker.setVisible(true);
  };

  return (
    <button 
      onClick={openPicker}
      disabled={!isLoaded}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50"
    >
      <Cloud className="w-4 h-4" />
      گوگل ڈرائیو سے منتخب کریں
    </button>
  );
};
