import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  serving_size: string;
}

interface FoodSearchProps {
  onFoodSelect: (food: FoodItem) => void;
}

const FoodSearch = ({ onFoodSelect }: FoodSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      searchFood(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchFood = async (query: string) => {
    setIsLoading(true);

    try {
      const url = new URL(
        'https://functions.poehali.dev/eb5025ec-3104-454f-bdb6-3bff66775a3a'
      );
      if (query) {
        url.searchParams.append('q', query);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error('Ошибка поиска');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить поиск',
        variant: 'destructive',
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Icon
          name="Search"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={20}
        />
        <Input
          placeholder="Поиск продуктов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" className="animate-spin" size={32} />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'Продукты не найдены' : 'Начните вводить название продукта'}
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((food) => (
              <Card
                key={food.id}
                className="p-3 cursor-pointer hover-scale"
                onClick={() => onFoodSelect(food)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-medium">{food.name}</h4>
                    <p className="text-xs text-muted-foreground">{food.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{food.calories}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>Б: {food.protein}г</span>
                  <span>У: {food.carbs}г</span>
                  <span>Ж: {food.fat}г</span>
                  <span className="ml-auto">{food.serving_size}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default FoodSearch;