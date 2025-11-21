import React, { useState, useEffect } from 'react';

// Mock da API - substitua pela chamada real
const api = {
  getCampaigns: async () => {
    // Simula uma chamada de API
    console.log('Buscando campanhas...');
    // Em um projeto real, você usaria fetch() ou axios() para chamar /api/whatsapp/campaigns
    return [
      { id: 1, name: 'Campanha de Boas-Vindas', status: 'completed', total_messages: 150, sent_count: 150, read_count: 120 },
      { id: 2, name: 'Promoção de Novembro', status: 'processing', total_messages: 500, sent_count: 250, read_count: 100 },
      { id: 3, name: 'Lançamento Produto X', status: 'draft', total_messages: 0, sent_count: 0, read_count: 0 },
    ];
  }
};

interface Campaign {
  id: number;
  name: string;
  status: string;
  total_messages: number;
  sent_count: number;
  read_count: number;
}

export function WhatsappCampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCampaigns().then(data => {
      setCampaigns(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Carregando campanhas...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Campanhas de WhatsApp</h1>
      <p>Este é um componente de exemplo para listar as campanhas. Conecte ao endpoint <strong>/api/whatsapp/campaigns</strong> para obter dados reais.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Nome</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Mensagens</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Enviadas</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Lidas</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(campaign => (
            <tr key={campaign.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{campaign.id}</td>
              <td style={{ padding: '8px' }}>{campaign.name}</td>
              <td style={{ padding: '8px' }}>{campaign.status}</td>
              <td style={{ padding: '8px' }}>{campaign.total_messages}</td>
              <td style={{ padding: '8px' }}>{campaign.sent_count}</td>
              <td style={{ padding: '8px' }}>{campaign.read_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
