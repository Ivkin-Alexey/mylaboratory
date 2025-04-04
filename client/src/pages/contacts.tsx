import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
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
        sx={{ fontWeight: 'bold', mb: 4 }}
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
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Центр коллективного пользования
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
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
        
        {/* Карта или дополнительная информация */}
        <Box sx={{ flex: 1 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                width: '100%', 
                height: '300px',
                bgcolor: '#eef5fd',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {/* Имитация карты Яндекса */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'url("https://avatars.mds.yandex.net/get-bunker/118781/01ffb5e5ef0e5a2da50e7dcce4d6b1cecd66b3c1/orig")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.8
                }}
              />
              
              {/* Маркер на карте */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'primary.main',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                  zIndex: 2
                }}
              />
              
              {/* Заголовок */}
              <Typography 
                variant="body1" 
                sx={{ 
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  p: 1,
                  borderRadius: 1,
                  zIndex: 1
                }}
              >
                Санкт-Петербург, 21 линия В.О., д. 2
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              Координаты: 59.930161, 30.268519
            </Typography>
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
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
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