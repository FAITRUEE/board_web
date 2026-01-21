import { useQuery } from '@tanstack/react-query';
import * as categoryService from '@/services/categoryService';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CategorySelectProps {
  value?: number;
  onChange: (categoryId: number | undefined) => void;
  required?: boolean;
}

export const CategorySelect = ({ value, onChange, required = false }: CategorySelectProps) => {
  // ✅ 직접 useQuery 사용
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const handleValueChange = (val: string) => {
    if (val === "none") {
      onChange(undefined);
    } else {
      onChange(parseInt(val));
    }
  };

  const selectedCategory = categories?.find(cat => cat.id === value);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>카테고리</Label>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="category">
        카테고리 {required && <span className="text-red-500">*</span>}
      </Label>
      <Select 
        value={value?.toString() || "none"} 
        onValueChange={handleValueChange}
      >
        <SelectTrigger id="category">
          <SelectValue>
            {selectedCategory ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCategory.icon}</span>
                <Badge 
                  variant="outline" 
                  style={{ 
                    backgroundColor: `${selectedCategory.color}20`,
                    borderColor: selectedCategory.color,
                    color: selectedCategory.color
                  }}
                >
                  {selectedCategory.name}
                </Badge>
              </div>
            ) : (
              <span className="text-gray-500">카테고리 선택</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem value="none">
              <span className="text-gray-500">카테고리 없음</span>
            </SelectItem>
          )}
          {categories?.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <Badge 
                  variant="outline"
                  style={{ 
                    backgroundColor: `${category.color}20`,
                    borderColor: category.color,
                    color: category.color
                  }}
                >
                  {category.name}
                </Badge>
                <span className="text-xs text-gray-500 ml-2">
                  {category.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};