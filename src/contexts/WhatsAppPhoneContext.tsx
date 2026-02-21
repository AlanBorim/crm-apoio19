import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { whatsappService } from '../services/whatsappService';

export interface PhoneNumber {
  id: number;
  name: string;
  phone_number: string;
  phone_number_id: string;
  status: 'active' | 'inactive';
}

interface WhatsAppPhoneContextType {
  selectedPhone: PhoneNumber | null;
  setSelectedPhone: (phone: PhoneNumber | null) => void;
  phoneNumbers: PhoneNumber[];
  loading: boolean;
  error: string | null;
  refreshPhoneNumbers: () => Promise<void>;
}

const WhatsAppPhoneContext = createContext<WhatsAppPhoneContextType | undefined>(undefined);

const STORAGE_KEY = 'whatsapp_selected_phone';

export function WhatsAppPhoneProvider({ children }: { children: ReactNode }) {
  const [selectedPhone, setSelectedPhoneState] = useState<PhoneNumber | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load phone numbers from API
  const loadPhoneNumbers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await whatsappService.getPhoneNumbers();
      const activeNumbers = (data || []).filter((phone: any) => phone.status?.toLowerCase() !== 'inactive');
      setPhoneNumbers(activeNumbers);

      // If there's a saved selection, try to restore it
      const savedPhone = localStorage.getItem(STORAGE_KEY);
      if (savedPhone && data) {
        const parsed = JSON.parse(savedPhone);
        const found = data.find((p: PhoneNumber) => p.id === parsed.id);
        if (found) {
          setSelectedPhoneState(found);
        }
      }
    } catch (err) {
      console.error('Error loading phone numbers:', err);
      setError('Erro ao carregar números de telefone');
    } finally {
      setLoading(false);
    }
  };

  // Set selected phone and persist to localStorage
  const setSelectedPhone = (phone: PhoneNumber | null) => {
    setSelectedPhoneState(phone);
    if (phone) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(phone));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Refresh phone numbers
  const refreshPhoneNumbers = async () => {
    await loadPhoneNumbers();
  };

  // Load on mount
  useEffect(() => {
    loadPhoneNumbers();
  }, []);

  return (
    <WhatsAppPhoneContext.Provider
      value={{
        selectedPhone,
        setSelectedPhone,
        phoneNumbers,
        loading,
        error,
        refreshPhoneNumbers
      }}
    >
      {children}
    </WhatsAppPhoneContext.Provider>
  );
}

export function useWhatsAppPhone() {
  const context = useContext(WhatsAppPhoneContext);
  if (context === undefined) {
    throw new Error('useWhatsAppPhone must be used within a WhatsAppPhoneProvider');
  }
  return context;
}
