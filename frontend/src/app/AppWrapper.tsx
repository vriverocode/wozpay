import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { WalletApp } from './App';
import { useState } from "react";

export function AppWrapper() {
  const { user } = useAuth();

    if (!user) {
      return <AuthScreen />;
    }
  
    return <WalletApp />;
}
