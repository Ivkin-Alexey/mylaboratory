import React, { useState, useCallback, memo, lazy, Suspense } from 'react';
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
  Container,
  Card,
  CardMedia,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { EquipmentCategory, EquipmentStatus, type InsertEquipment } from '@shared/schema';

// Компонент для отложенной загрузки области загрузки изображений
const ImageUploadArea = memo(({
  previewUrl,
  errors,
  handleImageUpload,
  handleRemoveImage
}: {
  previewUrl: string;
  errors: { imageFile: string };
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
}) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Используем безопасное приведение типов с проверкой
    const currentTarget = e.currentTarget as HTMLElement;
    if (currentTarget && currentTarget.style) {
      currentTarget.style.borderColor = '#ccc';
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.files = e.dataTransfer.files;
        handleImageUpload({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Используем безопасное приведение типов с проверкой
    const currentTarget = e.currentTarget as HTMLElement;
    if (currentTarget && currentTarget.style) {
      currentTarget.style.borderColor = '#3f51b5';
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Используем безопасное приведение типов с проверкой
    const currentTarget = e.currentTarget as HTMLElement;
    if (currentTarget && currentTarget.style) {
      currentTarget.style.borderColor = '#ccc';
    }
  }, []);

  if (!previewUrl) {
    return (
      <Box 
        sx={{ 
          border: '2px dashed #ccc', 
          borderRadius: 2, 
          p: 3, 
          textAlign: 'center',
          mb: 2,
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
          }
        }}
        onClick={() => document.getElementById('image-upload')?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" gutterBottom>
          Нажмите для загрузки изображения
        </Typography>
        <Typography variant="body2" color="text.secondary">
          или перетащите файл в эту область
        </Typography>
        {errors.imageFile && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {errors.imageFile}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Card sx={{ mb: 2, position: 'relative', maxWidth: 400, mx: 'auto' }}>
      <CardMedia
        component="img"
        height="250"
        image={previewUrl}
        alt="Предпросмотр загруженного изображения"
      />
      <IconButton
        color="error"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }
        }}
        onClick={handleRemoveImage}
      >
        <DeleteIcon />
      </IconButton>
    </Card>
  );
});

// Основной компонент
const AddEquipment = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Состояние формы
  const [formData, setFormData] = useState<Omit<InsertEquipment, 'id'>>({
    name: '',
    description: '',
    category: EquipmentCategory.SCIENTIFIC,
    location: '',
    status: EquipmentStatus.AVAILABLE,
    imageUrl: '',
  });

  // Состояние для загруженного изображения
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Валидация формы
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    location: '',
    imageUrl: '',
    imageFile: '',
  });

  // Мутация для создания оборудования с useCallback для предотвращения повторных рендеров
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

  // Обработчик изменения полей формы с useCallback
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Сбрасываем ошибку при изменении поля
    setErrors(prev => {
      if (prev[name as keyof typeof prev]) {
        return {
          ...prev,
          [name]: ''
        };
      }
      return prev;
    });
  }, []);

  // Обработчик загрузки изображения с useCallback
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Проверяем, что файл является изображением
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        imageFile: 'Пожалуйста, загрузите изображение'
      }));
      return;
    }
    
    // Сбрасываем ошибку, если она была
    setErrors(prev => ({
      ...prev,
      imageFile: ''
    }));
    
    // Сохраняем файл
    setUploadedImage(file);
    
    // Создаем URL для предпросмотра с оптимизацией
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // Очищаем URL изображения, так как будем использовать загруженный файл
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  }, []);
  
  // Обработчик удаления загруженного изображения с useCallback
  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  }, [previewUrl]);

  // Проверка URL на валидность - мемоизированная функция
  const isValidUrl = useCallback((url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Валидация формы перед отправкой с useCallback
  const validateForm = useCallback(() => {
    const newErrors = {
      name: '',
      description: '',
      location: '',
      imageUrl: '',
      imageFile: '',
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
  }, [formData, isValidUrl]);

  // Функция для конвертации файла в base64 - мемоизированная
  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }, []);

  // Обработчик отправки формы с useCallback
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (uploadedImage) {
        try {
          // Конвертируем изображение в base64
          const base64Image = await convertFileToBase64(uploadedImage);
          
          // Обновляем данные формы, добавляя изображение в base64
          const dataWithImage = {
            ...formData,
            imageBase64: base64Image,
          };
          
          createEquipmentMutation.mutate(dataWithImage);
        } catch (error) {
          toast({
            title: "Ошибка",
            description: "Произошла ошибка при обработке изображения",
            variant: "destructive",
          });
        }
      } else {
        // Если изображение не загружено, отправляем обычные данные формы
        createEquipmentMutation.mutate(formData);
      }
    }
  }, [formData, uploadedImage, validateForm, convertFileToBase64, createEquipmentMutation, toast]);

  // Мемоизированный компонент для селекта категории
  const CategorySelect = memo(() => (
    <TextField
      fullWidth
      select
      label="Категория"
      name="category"
      value={formData.category}
      onChange={handleChange}
      required
    >
      <MenuItem value={EquipmentCategory.SCIENTIFIC}>Научное оборудование</MenuItem>
      <MenuItem value={EquipmentCategory.LABORATORY}>Лабораторное оборудование</MenuItem>
      <MenuItem value={EquipmentCategory.MEASUREMENT}>Измерительное оборудование</MenuItem>
      <MenuItem value={EquipmentCategory.MEDICAL}>Медицинское оборудование</MenuItem>
      <MenuItem value={EquipmentCategory.OTHER}>Прочее</MenuItem>
    </TextField>
  ));
  
  // Мемоизированный компонент для селекта статуса
  const StatusSelect = memo(() => (
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
  ));
  
  return (
    <Container maxWidth="md">
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      }>
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
                  <CategorySelect />
                  
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
                  <StatusSelect />
                  
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
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Загрузка изображения
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Вы можете загрузить изображение с устройства или указать ссылку на изображение в поле выше
                  </Typography>
                </Box>
                
                {/* Используем оптимизированный компонент для области загрузки */}
                <ImageUploadArea 
                  previewUrl={previewUrl}
                  errors={{ imageFile: errors.imageFile }}
                  handleImageUpload={handleImageUpload}
                  handleRemoveImage={handleRemoveImage}
                />
                
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
      </Suspense>
    </Container>
  );
};

export default AddEquipment;