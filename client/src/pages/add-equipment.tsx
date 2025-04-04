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
          p: { xs: 1.5, md: 3 }, 
          textAlign: 'center',
          mb: { xs: 1, md: 2 },
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
        <CloudUploadIcon sx={{ fontSize: { xs: 32, md: 48 }, color: 'text.secondary', mb: { xs: 0.5, md: 1 } }} />
        <Typography 
          variant="body2" 
          gutterBottom 
          sx={{ fontSize: { xs: '0.8rem', md: '1rem' }, fontWeight: 'medium' }}
        >
          Нажмите для загрузки изображения
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
        >
          или перетащите файл в эту область
        </Typography>
        {errors.imageFile && (
          <Typography 
            color="error" 
            variant="body2" 
            sx={{ mt: 1, fontSize: { xs: '0.7rem', md: '0.75rem' } }}
          >
            {errors.imageFile}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Card sx={{ 
      mb: { xs: 1, md: 2 }, 
      position: 'relative', 
      maxWidth: { xs: '100%', md: 400 },
      mx: 'auto' 
    }}>
      <CardMedia
        component="img"
        sx={{ height: { xs: 180, md: 250 } }}
        image={previewUrl}
        alt="Предпросмотр загруженного изображения"
      />
      <IconButton
        color="error"
        size="small"
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: { xs: 0.5, md: 1 },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }
        }}
        onClick={handleRemoveImage}
      >
        <DeleteIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
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
      size="small"
      sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
    >
      <MenuItem value={EquipmentCategory.SCIENTIFIC} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Научное оборудование</MenuItem>
      <MenuItem value={EquipmentCategory.LABORATORY} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Лабораторное оборудование</MenuItem>
      <MenuItem value={EquipmentCategory.MEASUREMENT} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Измерительное оборудование</MenuItem>
      <MenuItem value={EquipmentCategory.MEDICAL} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Медицинское оборудование</MenuItem>
      <MenuItem value={EquipmentCategory.OTHER} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Прочее</MenuItem>
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
      size="small"
      sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
    >
      <MenuItem value={EquipmentStatus.AVAILABLE} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Доступно</MenuItem>
      <MenuItem value={EquipmentStatus.MAINTENANCE} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>На обслуживании</MenuItem>
      <MenuItem value={EquipmentStatus.BOOKED} sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>Забронировано</MenuItem>
    </TextField>
  ));
  
  return (
    <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      }>
        <Box sx={{ py: { xs: 2, md: 4 } }}>
          <Typography 
            variant="h5" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontWeight: 'bold',
              mb: { xs: 1, md: 2 }
            }}
          >
            Добавление нового оборудования
          </Typography>
          
          <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mt: { xs: 1, md: 3 } }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={{ xs: 2, md: 3 }}>
                <TextField
                  fullWidth
                  label="Название оборудования"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  size="small"
                  sx={{ '& .MuiFormHelperText-root': { fontSize: { xs: '0.7rem', md: '0.75rem' } } }}
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
                  rows={3}
                  required
                  size="small"
                  sx={{ '& .MuiFormHelperText-root': { fontSize: { xs: '0.7rem', md: '0.75rem' } } }}
                />
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 2 }}>
                  <Box sx={{ width: '100%' }}>
                    <CategorySelect />
                  </Box>
                  
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
                    size="small"
                    sx={{ '& .MuiFormHelperText-root': { fontSize: { xs: '0.7rem', md: '0.75rem' } } }}
                  />
                </Stack>
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 2 }}>
                  <Box sx={{ width: '100%' }}>
                    <StatusSelect />
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="URL изображения"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    error={!!errors.imageUrl}
                    helperText={errors.imageUrl || 'Оставьте пустым для изображения по умолчанию'}
                    placeholder="https://example.com/image.jpg"
                    size="small"
                    sx={{ '& .MuiFormHelperText-root': { fontSize: { xs: '0.7rem', md: '0.75rem' } } }}
                  />
                </Stack>
                
                <Divider sx={{ my: { xs: 1, md: 2 } }} />
                
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 'medium',
                    mt: { xs: 0, md: 1 }
                  }}
                >
                  Загрузка изображения
                </Typography>
                
                <Box sx={{ mb: { xs: 0, md: 2 } }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                  >
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
                
                <Box sx={{ 
                  mt: { xs: 1, md: 2 }, 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  gap: { xs: 1, md: 2 }
                }}>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => setLocation('/')}
                    size="small"
                    sx={{ 
                      py: { xs: 0.5, md: 1 },
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                      boxShadow: 'none',
                      '&:hover': { boxShadow: 'none' }
                    }}
                  >
                    Отмена
                  </Button>
                  
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={createEquipmentMutation.isPending}
                    size="small"
                    sx={{ 
                      py: { xs: 0.5, md: 1 }, 
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                      boxShadow: 'none',
                      '&:hover': { boxShadow: 'none' }
                    }}
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