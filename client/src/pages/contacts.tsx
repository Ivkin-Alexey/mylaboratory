import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Contacts = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold', mb: 4, fontSize: '1rem', textAlign: 'center' }}
      >
        Контактная информация
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
        {/* Контактная информация */}
        <Box sx={{ flex: 1 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2
            }}
          >
            <List>
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Адрес" 
                  secondary="199106, Санкт-Петербург, Васильевский остров, 21 линия, д. 2" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Телефон" 
                  secondary="+7 (812) 328-82-12" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary="ckp@spmi.ru" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Время работы" 
                  secondary="Пн-Пт: 9:00 - 17:30, Сб-Вс: выходной" 
                />
              </ListItem>
            </List>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Центр коллективного пользования обеспечивает доступ к современному научному и лабораторному оборудованию для проведения исследований и учебных работ.
            </Typography>
          </Paper>
        </Box>
        
        {/* Карта Яндекс */}
        <Box sx={{ flex: 1.5 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 0, 
              height: '500px', 
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <iframe 
              src="https://yandex.ru/map-widget/v1/?um=constructor%3A4580c3c1cccfe5fd7f97ed59d71865cec1d7f8de25dc5c5dd84be6c4bdea3adb&amp;source=constructor&amp;ll=30.268519%2C59.930161&amp;z=16&amp;width=100%&amp;height=600" 
              width="100%" 
              height="600" 
              frameBorder="0"
              title="Яндекс Карта"
              style={{ 
                border: 0,
                width: '100%',
                height: '100%',
                flexGrow: 1
              }}
            />
          </Paper>
        </Box>
      </Box>
      
      {/* Форма для обратной связи или дополнительная информация */}
      <Box sx={{ width: '100%', mt: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'white'
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}>
            Нужна помощь?
          </Typography>
          <Typography variant="body1">
            Если у вас есть вопросы о доступности оборудования, возможностях бронирования или технических характеристиках, пожалуйста, свяжитесь с нами по указанным контактам. Наши специалисты с радостью вам помогут.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Contacts;