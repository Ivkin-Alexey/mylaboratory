import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Equipment from "@/pages/equipment";
import MyBookings from "@/pages/my-bookings";
import EquipmentDetails from "@/pages/equipment-details";
import AppHeader from "@/components/app-header";
import { useState } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Alert, Snackbar } from '@mui/material';
import { useToast } from "@/hooks/use-toast";

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
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Компонент для уведомлений (замена Toaster)
function MuiToaster() {
  const { toasts, dismiss } = useToast();
  
  return (
    <>
      {toasts.map(({ id, title, description, variant }) => (
        <Snackbar 
          key={id}
          open={true}
          autoHideDuration={6000}
          onClose={() => dismiss(id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => dismiss(id)} 
            severity={variant === 'destructive' ? 'error' : 'success'} 
            sx={{ width: '100%' }}
          >
            {title && <div><strong>{title}</strong></div>}
            {description}
          </Alert>
        </Snackbar>
      ))}
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
          <Route path="/equipment/:id">
            <EquipmentDetails onNavigateToBookings={() => setActiveTab("myBookings")} />
          </Route>
          <Route path="/">
            {activeTab === "equipment" ? <Equipment onNavigateToBookings={() => setActiveTab("myBookings")} /> : <MyBookings onNavigateToEquipment={() => setActiveTab("equipment")} />}
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
