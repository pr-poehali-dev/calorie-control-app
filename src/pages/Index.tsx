import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CameraCapture from '@/components/CameraCapture';
import FoodSearch from '@/components/FoodSearch';
import { useToast } from '@/hooks/use-toast';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [userGoal, setUserGoal] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [addMealMode, setAddMealMode] = useState<'camera' | 'search' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!showOnboarding) {
      loadMeals();
    }
  }, [showOnboarding]);

  const loadMeals = async () => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/72b398eb-ab94-4f41-bf1f-973d8d60a5ea'
      );
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (error) {
      console.error('Failed to load meals:', error);
    }
  };

  const saveMeal = async (mealData: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/72b398eb-ab94-4f41-bf1f-973d8d60a5ea',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...mealData,
            meal_time: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Добавлено!',
          description: `${mealData.name} - ${mealData.calories} kcal`,
        });
        loadMeals();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить приём пищи',
        variant: 'destructive',
      });
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);
  const dailyLimit = 2000;
  const calorieProgress = (totalCalories / dailyLimit) * 100;

  const weekData = [
    { day: 'Пн', calories: 1850 },
    { day: 'Вт', calories: 2100 },
    { day: 'Ср', calories: 1920 },
    { day: 'Чт', calories: 1780 },
    { day: 'Пт', calories: 2050 },
    { day: 'Сб', calories: 1650 },
    { day: 'Вс', calories: totalCalories },
  ];

  const maxCalories = Math.max(...weekData.map((d) => d.calories));

  const onboardingSteps = [
    {
      title: 'Выберите вашу цель',
      content: (
        <div className="space-y-3">
          {[
            { value: 'lose', label: 'Похудеть', icon: 'TrendingDown' },
            { value: 'maintain', label: 'Поддерживать вес', icon: 'Minus' },
            { value: 'gain', label: 'Набрать массу', icon: 'TrendingUp' },
            { value: 'iron', label: 'Больше железа', icon: 'Zap' },
            { value: 'calcium', label: 'Больше кальция', icon: 'Bone' },
          ].map((goal) => (
            <Button
              key={goal.value}
              variant={userGoal === goal.value ? 'default' : 'outline'}
              className="w-full justify-start text-left h-14 text-base"
              onClick={() => setUserGoal(goal.value)}
            >
              <Icon name={goal.icon} className="mr-3" size={20} />
              {goal.label}
            </Button>
          ))}
        </div>
      ),
    },
    {
      title: 'Расскажите о себе',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="age">Возраст</Label>
            <Input id="age" type="number" placeholder="25" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Вес (кг)</Label>
            <Input id="weight" type="number" placeholder="70" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Рост (см)</Label>
            <Input id="height" type="number" placeholder="175" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity">Уровень активности</Label>
            <Select>
              <SelectTrigger id="activity">
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: 'Предпочтения в питании',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Кухня</Label>
            <div className="flex flex-wrap gap-2">
              {['Европейская', 'Азиатская', 'Средиземноморская', 'Веганская'].map(
                (cuisine) => (
                  <Button key={cuisine} variant="outline" size="sm">
                    {cuisine}
                  </Button>
                )
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dislikes">Не люблю</Label>
            <Input id="dislikes" placeholder="Например: грибы, морепродукты" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Аллергии</Label>
            <Input id="allergies" placeholder="Например: орехи, лактоза" />
          </div>
        </div>
      ),
    },
  ];

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 animate-scale-in">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                {onboardingSteps[currentStep].title}
              </h2>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1}/3
              </span>
            </div>
            <Progress value={((currentStep + 1) / 3) * 100} className="h-1" />
          </div>

          <div className="mb-6">{onboardingSteps[currentStep].content}</div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Назад
              </Button>
            )}
            <Button
              onClick={() => {
                if (currentStep < 2) {
                  setCurrentStep(currentStep + 1);
                } else {
                  setShowOnboarding(false);
                }
              }}
              className="flex-1"
            >
              {currentStep < 2 ? 'Далее' : 'Начать'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="pt-6 pb-4">
          <h1 className="text-3xl font-bold mb-1">Дневник питания</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('ru-RU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>

        <Card className="p-6 bg-primary text-primary-foreground animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Калории сегодня</p>
              <p className="text-5xl font-bold">{totalCalories}</p>
              <p className="text-sm opacity-75 mt-1">из {dailyLimit} kcal</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Осталось</p>
              <p className="text-2xl font-semibold">{dailyLimit - totalCalories}</p>
            </div>
          </div>
          <Progress value={calorieProgress} className="h-2 bg-primary-foreground/20" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-xs opacity-75">Белки</p>
              <p className="text-lg font-semibold">{totalProtein}г</p>
            </div>
            <div>
              <p className="text-xs opacity-75">Углеводы</p>
              <p className="text-lg font-semibold">{totalCarbs}г</p>
            </div>
            <div>
              <p className="text-xs opacity-75">Жиры</p>
              <p className="text-lg font-semibold">{totalFat}г</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="diary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diary">Дневник</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="menu">Меню</TabsTrigger>
          </TabsList>

          <TabsContent value="diary" className="space-y-3 mt-4">
            {meals.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon name="Utensils" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Приёмы пищи не добавлены</p>
                <p className="text-sm text-muted-foreground">
                  Добавьте первое блюдо с помощью камеры или поиска
                </p>
              </Card>
            ) : (
              meals.map((meal) => (
                <Card
                  key={meal.id}
                  className="p-4 hover-scale cursor-pointer animate-fade-in"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{meal.name}</h3>
                      <p className="text-sm text-muted-foreground">{meal.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {meal.calories}
                      </p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Б: <span className="font-medium text-foreground">{meal.protein}г</span>
                    </span>
                    <span className="text-muted-foreground">
                      У: <span className="font-medium text-foreground">{meal.carbs}г</span>
                    </span>
                    <span className="text-muted-foreground">
                      Ж: <span className="font-medium text-foreground">{meal.fat}г</span>
                    </span>
                  </div>
                </Card>
              ))
            )}

            <Dialog open={addMealMode !== null} onOpenChange={(open) => !open && setAddMealMode(null)}>
              <DialogTrigger asChild>
                <Button className="w-full h-14 text-base" size="lg">
                  <Icon name="Plus" className="mr-2" size={20} />
                  Добавить приём пищи
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {addMealMode === null && 'Новый приём пищи'}
                    {addMealMode === 'camera' && 'Анализ фото'}
                    {addMealMode === 'search' && 'Поиск продукта'}
                  </DialogTitle>
                </DialogHeader>
                <div className="pt-4">
                  {addMealMode === null && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2"
                        onClick={() => setAddMealMode('camera')}
                      >
                        <Icon name="Camera" size={28} />
                        <span className="text-sm">Сканировать</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-24 flex-col gap-2"
                        onClick={() => setAddMealMode('search')}
                      >
                        <Icon name="Utensils" size={28} />
                        <span className="text-sm">Из списка</span>
                      </Button>
                    </div>
                  )}
                  {addMealMode === 'camera' && (
                    <CameraCapture
                      onFoodDetected={(food) => {
                        saveMeal(food);
                        setAddMealMode(null);
                      }}
                      onClose={() => setAddMealMode(null)}
                    />
                  )}
                  {addMealMode === 'search' && (
                    <FoodSearch
                      onFoodSelect={(food) => {
                        saveMeal(food);
                        setAddMealMode(null);
                      }}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <Card className="p-6 animate-fade-in">
              <h3 className="font-semibold text-lg mb-6">Калории за неделю</h3>
              <div className="space-y-4">
                {weekData.map((day) => (
                  <div key={day.day}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{day.day}</span>
                      <span className="text-muted-foreground">{day.calories} kcal</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(day.calories / maxCalories) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Средняя калорийность</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    weekData.reduce((sum, d) => sum + d.calories, 0) / weekData.length
                  )}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    kcal/день
                  </span>
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-3 mt-4">
            <Card className="p-6 animate-fade-in">
              <h3 className="font-semibold text-lg mb-4">Рекомендации на сегодня</h3>
              <div className="space-y-3">
                {[
                  {
                    meal: 'Ужин',
                    dish: 'Запечённая рыба с овощами',
                    calories: 380,
                    time: '19:00',
                  },
                  { meal: 'Перекус', dish: 'Греческий йогурт', calories: 150, time: '16:30' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover-scale cursor-pointer"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">{item.meal}</p>
                      <p className="font-medium">{item.dish}</p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{item.calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 gap-2">
            <Button variant="ghost" className="flex-col h-16 gap-1">
              <Icon name="Camera" size={24} />
              <span className="text-xs">Сканировать</span>
            </Button>
            <Button variant="ghost" className="flex-col h-16 gap-1">
              <Icon name="Utensils" size={24} />
              <span className="text-xs">Приёмы пищи</span>
            </Button>
            <Button variant="ghost" className="flex-col h-16 gap-1">
              <Icon name="BarChart3" size={24} />
              <span className="text-xs">Аналитика</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;