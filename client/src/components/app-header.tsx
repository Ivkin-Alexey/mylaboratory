import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  useTheme
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ScienceIcon from "@mui/icons-material/Science";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import CloudIcon from "@mui/icons-material/Cloud";

interface AppHeaderProps {
  activeTab: "equipment" | "myBookings" | "externalEquipment";
  setActiveTab: (tab: "equipment" | "myBookings" | "externalEquipment") => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ activeTab, setActiveTab }) => {
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: "equipment" | "myBookings" | "externalEquipment") => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <ScienceIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Бронирование Лабораторного Оборудования
          </Typography>
          
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
        </Toolbar>
        
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
          <Tab 
            value="externalEquipment" 
            label="Внешний каталог" 
            icon={<CloudIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </AppBar>
    </Box>
  );
};

export default AppHeader;
