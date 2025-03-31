import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Equipment from "@/pages/equipment";
import MyBookings from "@/pages/my-bookings";
import EquipmentDetails from "@/pages/equipment-details";
import AddEquipment from "@/pages/add-equipment";
import AppHeader from "@/components/app-header";
import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Alert, Snackbar } from '@mui/material';
import { useToast } from "@/hooks/use-toast";
import { Provider } from 'react-redux';
import { store } from './store/store';

// Создаем тему MUI
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Компонент для уведомлений (замена Toaster)
function MuiToaster() {
  const { toasts, dismiss } = useToast();
  // Создаем локальное состояние для отслеживания видимости каждого уведомления
  const [visibleToasts, setVisibleToasts] = useState<Record<string, boolean>>({});
  
  // При монтировании компонента или изменении toasts, устанавливаем все новые тосты как видимые
  useEffect(() => {
    const newVisibleState: Record<string, boolean> = {};
    toasts.forEach(toast => {
      // Если состояние уже есть в visibleToasts, сохраняем его
      // Иначе новый тост будет отображаться
      newVisibleState[toast.id] = visibleToasts[toast.id] !== false;
    });
    setVisibleToasts(newVisibleState);
  }, [toasts]);
  
  // Обработчик закрытия тоста
  const handleClose = (id: string) => {
    // Отмечаем тост как невидимый в локальном состоянии
    setVisibleToasts(prev => ({ ...prev, [id]: false }));
    // Также отправляем действие dismiss в глобальное состояние
    dismiss(id);
  };
  
  return (
    <>
      {toasts.map(({ id, title, description, variant }) => {
        // Проверяем, должен ли тост быть видимым
        const isVisible = visibleToasts[id] !== false;
        
        return isVisible ? (
          <Snackbar 
            key={id}
            open={true}
            autoHideDuration={6000}
            onClose={() => handleClose(id)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => handleClose(id)} 
              severity={variant === 'destructive' ? 'error' : 'success'} 
              sx={{ width: '100%' }}
            >
              {title && <div><strong>{title}</strong></div>}
              {description}
            </Alert>
          </Snackbar>
        ) : null;
      })}
    </>
  );
}

function Router() {
  // This state tracks which tab is currently active
  const [activeTab, setActiveTab] = useState<"equipment" | "myBookings">("equipment");

  return (
    <div>
      <AppHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Switch>
          <Route path="/equipment/add">
            <AddEquipment />
          </Route>
          <Route path="/equipment/:id">
            <EquipmentDetails onNavigateToBookings={() => setActiveTab("myBookings")} />
          </Route>
          <Route path="/">
            {activeTab === "equipment" ? (
              <Equipment onNavigateToBookings={() => setActiveTab("myBookings")} />
            ) : (
              <MyBookings onNavigateToEquipment={() => setActiveTab("equipment")} />
            )}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Container>
      
      <MuiToaster />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
