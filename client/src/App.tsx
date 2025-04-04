import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "./pages/not-found";
import Equipment from "./pages/equipment";
import MyBookings from "./pages/my-bookings";
import EquipmentDetails from "./pages/equipment-details";
import AddEquipment from "./pages/add-equipment";
import Contacts from "./pages/contacts";
import AppHeader from "./components/app-header";
import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Alert, Snackbar } from '@mui/material';
import { useToast } from "./hooks/use-toast";
import { Provider } from 'react-redux';
import { store } from './store/store';

// Создаем оптимизированную тему MUI без анимаций и теней
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: 'rgba(63, 81, 181, 0.08)',
            transition: 'none',
          },
          transition: 'none',
        },
      },
      defaultProps: {
        disableRipple: true,
        disableElevation: true,
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          transition: 'none',
        },
      },
      defaultProps: {
        elevation: 0,
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
          transition: 'none',
        },
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        },
      },
      defaultProps: {
        disablePortal: true,
      }
    },
    MuiMenuItem: {
      defaultProps: {
        disableRipple: true,
      }
    },
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true,
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          transition: 'none',
        },
        indicator: {
          transition: 'none',
        }
      }
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          animationDuration: '0.8s',
        }
      }
    },
  },
  transitions: {
    // Отключаем все анимации для повышения производительности
    create: () => 'none',
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
  const [, setLocation] = useLocation();
  
  // Обработчик изменения вкладки с перенаправлением на главную
  const handleTabChange = (tab: "equipment" | "myBookings") => {
    setActiveTab(tab);
    // Перенаправляем пользователя на главную страницу
    setLocation("/");
  };

  return (
    <div>
      <AppHeader 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
      />
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 4, 
          px: 0 // Убираем паддинги слева и справа
        }}
        disableGutters // Отключаем стандартные отступы (gutters)
      >
        <Switch>
          <Route path="/equipment/add">
            <AddEquipment />
          </Route>
          <Route path="/equipment/favorites">
            <Equipment onNavigateToBookings={() => handleTabChange("myBookings")} showFavorites={true} />
          </Route>
          <Route path="/equipment/:id">
            <EquipmentDetails onNavigateToBookings={() => handleTabChange("myBookings")} />
          </Route>
          <Route path="/contacts">
            <Contacts />
          </Route>
          <Route path="/">
            {activeTab === "equipment" ? (
              <Equipment onNavigateToBookings={() => handleTabChange("myBookings")} />
            ) : (
              <MyBookings onNavigateToEquipment={() => handleTabChange("equipment")} />
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
