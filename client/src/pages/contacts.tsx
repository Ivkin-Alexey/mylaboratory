import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

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
              p: 0, 
              height: '100%', 
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            {/* Можно вставить карту с местоположением */}
            <Box
              component="iframe"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1998.6035766107097!2d30.24372067711598!3d59.929533066522076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4696310b22b218d5%3A0xc0a7d245d6c57671!2z0KHQsNC90LrRgi3Qn9C10YLQtdGA0LHRg9GA0LPRgdC60LjQuSDQs9C-0YDQvdGL0Lkg0YPQvdC40LLQtdGA0YHQuNGC0LXRgg!5e0!3m2!1sru!2sru!4v1709221370529!5m2!1sru!2sru"
              width="100%"
              height="100%"
              sx={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Карта расположения"
            />
          </Paper>
        </Box>
      </Box>
        
      {/* Ключевые контактные лица */}
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Контактные лица
        </Typography>
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3} 
          sx={{ 
            flexWrap: 'wrap',
            '& > *': { 
              flexBasis: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' },
              minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' }
            }
          }}
        >
          {[
            {
              name: 'Иванов Иван Иванович',
              position: 'Директор центра',
              phone: '+7 (812) 328-83-45',
              email: 'ivanov@spmi.ru',
              photo: null
            },
            {
              name: 'Петрова Елена Сергеевна',
              position: 'Администратор',
              phone: '+7 (812) 328-84-56',
              email: 'petrova@spmi.ru',
              photo: null
            },
            {
              name: 'Сидоров Алексей Павлович',
              position: 'Технический специалист',
              phone: '+7 (812) 328-85-67',
              email: 'sidorov@spmi.ru',
              photo: null
            }
          ].map((person, index) => (
            <Card key={index} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {person.photo ? (
                      <img src={person.photo} alt={person.name} width="100%" height="100%" />
                    ) : (
                      <PersonIcon fontSize="large" />
                    )}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                      {person.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {person.position}
                    </Typography>
                  </Box>
                </Box>
                
                <List dense disablePadding>
                  <ListItem disablePadding sx={{ pb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <PhoneIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={person.phone} />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <EmailIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={person.email} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          ))}
        </Stack>
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