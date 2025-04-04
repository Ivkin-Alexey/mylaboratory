import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  useTheme,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Collapse,
  ListItemButton
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ScienceIcon from "@mui/icons-material/Science";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import ContactsIcon from "@mui/icons-material/Contacts";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useLocation } from "wouter";


interface AppHeaderProps {
  activeTab: "equipment" | "myBookings";
  setActiveTab: (tab: "equipment" | "myBookings") => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ activeTab, setActiveTab }) => {
  const theme = useTheme();
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [equipmentMenuOpen, setEquipmentMenuOpen] = useState(false);
  
  // Используем медиа-запрос для определения, является ли экран мобильным
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: "equipment" | "myBookings") => {
    setActiveTab(newValue);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleContactsClick = () => {
    setLocation("/contacts");
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleMenuOpen = () => {
    setDrawerOpen(true);
  };
  
  const handleMenuClose = () => {
    setDrawerOpen(false);
  };
  
  const handleNavigation = (tab: "equipment" | "myBookings" | "contacts") => {
    if (tab === "contacts") {
      handleContactsClick();
    } else {
      setActiveTab(tab);
    }
    setDrawerOpen(false);
  };

  // Обработчик для переключения состояния меню оборудования
  const handleToggleEquipmentMenu = (event: React.MouseEvent) => {
    event.stopPropagation(); // Предотвращаем закрытие всего drawer
    setEquipmentMenuOpen(!equipmentMenuOpen);
  };

  // Содержимое боковой панели для мобильных устройств
  const drawerContent = (
    <Box sx={{ width: 250 }}>
      <List>
        <ListItem sx={{ py: 2, bgcolor: 'primary.dark' }}>
          <ListItemIcon sx={{ color: 'white' }}>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Иван Петров" sx={{ color: 'white' }} />
        </ListItem>
      </List>
      
      <Divider />
      
      {/* Группа Оборудование - с выпадающим меню */}
      <List>
        <ListItemButton onClick={handleToggleEquipmentMenu}>
          <ListItemIcon>
            <ScienceIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Оборудование" 
            primaryTypographyProps={{
              color: 'primary',
              fontWeight: 'bold'
            }}
          />
          {equipmentMenuOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={equipmentMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton 
              sx={{ pl: 4 }}
              onClick={() => handleNavigation("equipment")}
              selected={activeTab === "equipment"}
            >
              <ListItemIcon>
                <SearchIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Поиск" />
            </ListItemButton>
            
            <ListItemButton 
              sx={{ pl: 4 }}
              onClick={() => {
                // Тут можно добавить логику для отображения только избранного
                handleNavigation("equipment");
                // И установить showOnlyFavorites = true
              }}
            >
              <ListItemIcon>
                <StarIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Избранное" />
            </ListItemButton>
            
            <ListItemButton 
              sx={{ pl: 4 }}
              onClick={() => handleNavigation("myBookings")}
              selected={activeTab === "myBookings"}
            >
              <ListItemIcon>
                <BookmarksIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Мои бронирования" />
            </ListItemButton>
            
            <ListItemButton 
              sx={{ pl: 4 }}
              onClick={() => {
                setLocation("/equipment/add");
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon>
                <AddCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Добавить" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
      
      <Divider />
      
      {/* Группа Сервис */}
      <List>
        <ListItemButton 
          onClick={() => handleNavigation("contacts")}
        >
          <ListItemIcon>
            <ContactsIcon />
          </ListItemIcon>
          <ListItemText primary="Контакты" />
        </ListItemButton>
        
        <ListItemButton>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Настройки" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          {isMobile ? (
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="menu" 
              sx={{ mr: 2 }}
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <ScienceIcon sx={{ mr: 2 }} />
          )}
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
            onClick={() => setActiveTab("equipment")}
          >
            {isMobile ? "Бронирование" : "Бронирование Лабораторного Оборудования"}
          </Typography>
          
          {/* Элементы, видимые только на десктопе */}
          {!isMobile && (
            <>
              <Button 
                color="inherit" 
                startIcon={<ContactsIcon />}
                onClick={handleContactsClick}
                sx={{ mr: 2 }}
              >
                Контакты
              </Button>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Иван Петров
                </Typography>
                <IconButton color="inherit" size="small">
                  <SettingsIcon />
                </IconButton>
                <Avatar 
                  sx={{ ml: 2, width: 32, height: 32 }}
                  alt="Иван Петров"
                >
                  ИП
                </Avatar>
              </Box>
            </>
          )}
          
          {/* Аватар для мобильных устройств */}
          {isMobile && (
            <Avatar 
              sx={{ width: 32, height: 32 }}
              alt="Иван Петров"
            >
              ИП
            </Avatar>
          )}
        </Toolbar>
        
        {/* Вкладки, видимые только на десктопе */}
        {!isMobile && (
          <Tabs 
            value={activeTab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ 
              bgcolor: theme.palette.primary.main,
              '& .MuiTab-root': { 
                minWidth: 'auto',
                py: 1.5,
                px: 2
              }
            }}
          >
            <Tab 
              value="equipment" 
              label="Оборудование" 
              icon={<ScienceIcon />} 
              iconPosition="start"
            />
            <Tab 
              value="myBookings" 
              label="Мои Бронирования" 
              icon={<BookmarksIcon />} 
              iconPosition="start"
            />
          </Tabs>
        )}
      </AppBar>
      
      {/* Боковая панель для мобильных устройств */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleMenuClose}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default AppHeader;
