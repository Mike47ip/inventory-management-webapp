'use client';

import React from 'react';
import { CategoryProvider } from './(context)/CategoryContext';

import NotificationProvider from './common/NotificationManager';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <CategoryProvider>
      <NotificationProvider maxVisible={5} position="bottom-right">
        {children}
      </NotificationProvider>
    </CategoryProvider>
  );
}