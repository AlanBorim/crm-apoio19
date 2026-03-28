import React from 'react';
import { Card, CardContent } from '../ui/card';

export function FinanceiroModule() {
  return (
    <div className="flex flex-col h-full items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
      <Card className="w-full max-w-md shadow-xl border-orange-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Financeiro</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Aguardando programação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
