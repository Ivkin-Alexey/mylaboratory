import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Paper, 
  Stack, 
  Container
} from '@mui/material';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { EquipmentCategory, EquipmentStatus, type InsertEquipment } from '@shared/schema';

const AddEquipment = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Состояние формы
  const [formData, setFormData] = useState<Omit<InsertEquipment, 'id'>>({
    name: '',
    description: '',
    category: EquipmentCategory.MICROSCOPES,
    location: '',
    status: EquipmentStatus.AVAILABLE,
    imageUrl: '',
  });

  // Валидация формы
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    location: '',
    imageUrl: '',
  });

  // Мутация для создания оборудования
  const createEquipmentMutation = useMutation({
    mutationFn: async (data: Omit<InsertEquipment, 'id'>) => {
      const response = await apiRequest('POST', '/api/equipment', data);
      return response.json();
    },
    onSuccess: () => {
      // Инвалидируем кеш для обновления списка оборудования
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      
      // Показываем уведомление об успехе
      toast({
        title: "Оборудование добавлено",
        description: "Новое оборудование успешно добавлено в систему.",
        variant: "default",
      });
      
      // Перенаправляем на страницу со списком оборудования
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла ошибка при добавлении оборудования.",
        variant: "destructive",
      });
    }
  });

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Сбрасываем ошибку при изменении поля
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Валидация формы перед отправкой
  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      location: '',
      imageUrl: '',
    };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Пожалуйста, введите название оборудования';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Пожалуйста, введите описание оборудования';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Пожалуйста, укажите местоположение оборудования';
    }
    
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Пожалуйста, введите корректный URL изображения';
    }
    
    setErrors(newErrors);
    
    // Проверяем наличие ошибок
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Проверка URL на валидность
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      createEquipmentMutation.mutate(formData);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Добавление нового оборудования
        </Typography>
        
        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Название оборудования"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
              
              <TextField
                fullWidth
                label="Описание"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
                required
              />
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  select
                  label="Категория"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value={EquipmentCategory.MICROSCOPES}>Микроскопы</MenuItem>
                  <MenuItem value={EquipmentCategory.ANALYZERS}>Анализаторы</MenuItem>
                  <MenuItem value={EquipmentCategory.SPECTROMETERS}>Спектрометры</MenuItem>
                  <MenuItem value={EquipmentCategory.CENTRIFUGES}>Центрифуги</MenuItem>
                </TextField>
                
                <TextField
                  fullWidth
                  label="Местоположение"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!errors.location}
                  helperText={errors.location}
                  required
                  placeholder="Например, Лаборатория 101"
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  select
                  label="Статус"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value={EquipmentStatus.AVAILABLE}>Доступно</MenuItem>
                  <MenuItem value={EquipmentStatus.MAINTENANCE}>На обслуживании</MenuItem>
                  <MenuItem value={EquipmentStatus.BOOKED}>Забронировано</MenuItem>
                </TextField>
                
                <TextField
                  fullWidth
                  label="URL изображения"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  error={!!errors.imageUrl}
                  helperText={errors.imageUrl || 'Оставьте пустым для изображения по умолчанию'}
                  placeholder="https://example.com/image.jpg"
                />
              </Stack>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => setLocation('/')}
                >
                  Отмена
                </Button>
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={createEquipmentMutation.isPending}
                >
                  {createEquipmentMutation.isPending ? 'Добавление...' : 'Добавить оборудование'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddEquipment;