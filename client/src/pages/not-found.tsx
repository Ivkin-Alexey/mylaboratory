import React from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Container
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: "70vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <Card sx={{ width: "100%", maxWidth: "500px", mt: 4, mb: 4 }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <ErrorOutlineIcon 
              sx={{ fontSize: 64, color: "error.main", mb: 2 }} 
            />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: '1rem' }}>
              404 Страница не найдена
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Запрашиваемая страница не существует или была перемещена.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleGoHome}
              sx={{ mt: 2 }}
            >
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
