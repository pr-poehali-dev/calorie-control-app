import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface CapturedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

interface CameraCaptureProps {
  onFoodDetected: (food: CapturedFood) => void;
  onClose: () => void;
}

const CameraCapture = ({ onFoodDetected, onClose }: CameraCaptureProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      setCapturedImage(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFoodImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch(
        'https://functions.poehali.dev/769bc0c4-3832-41b6-9edb-e3395ec68ff1',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: capturedImage,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка анализа');
      }

      const result = await response.json();

      toast({
        title: 'Блюдо распознано!',
        description: `${result.name} - ${result.calories} kcal`,
      });

      onFoodDetected(result);
      onClose();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description:
          error instanceof Error ? error.message : 'Не удалось распознать блюдо',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!capturedImage ? (
        <Card className="p-8 text-center bg-muted">
          <Icon name="Camera" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Сфотографируйте блюдо для анализа
          </p>
          <Button onClick={() => fileInputRef.current?.click()} size="lg">
            <Icon name="Camera" className="mr-2" size={20} />
            Открыть камеру
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-2">
            <img
              src={capturedImage}
              alt="Captured food"
              className="w-full rounded-lg"
            />
          </Card>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCapturedImage(null);
                fileInputRef.current?.click();
              }}
              className="flex-1"
            >
              Переснять
            </Button>
            <Button
              onClick={analyzeFoodImage}
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                  Анализирую...
                </>
              ) : (
                <>
                  <Icon name="Sparkles" className="mr-2" size={20} />
                  Распознать
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;