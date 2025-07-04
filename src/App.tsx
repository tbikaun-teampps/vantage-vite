import { AppRouter } from '@/router/AppRouter';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="vantage-theme"
    >
      <AuthProvider>
        <AppRouter />
        <Toaster richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
