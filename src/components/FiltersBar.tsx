import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

export interface SimpleFiltersValue {
  priceRange: [number, number];
  rating: number;
}

interface FiltersBarProps {
  value: SimpleFiltersValue;
  onChange: (value: SimpleFiltersValue) => void;
  maxPrice?: number;
}

const FiltersBar = ({ value, onChange, maxPrice = 1000 }: FiltersBarProps) => {
  const setPrice = (range: [number, number]) => onChange({ ...value, priceRange: range });
  const setRating = (rating: number) => onChange({ ...value, rating });

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium">Price range (NAD)</Label>
          <div className="px-2 mt-2">
            <Slider
              value={value.priceRange}
              onValueChange={(v) => setPrice([v[0], v[1]])}
              max={maxPrice}
              min={0}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>N${value.priceRange[0]}</span>
              <span>N${value.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Min Rating */}
        <div>
          <Label className="text-sm font-medium">Minimum rating</Label>
          <div className="flex gap-2 mt-2">
            {[0, 3, 4, 4.5, 5].map((r) => (
              <Button
                key={r}
                variant={value.rating === r ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRating(r)}
                className="flex items-center gap-1"
                aria-pressed={value.rating === r}
              >
                <Star className="h-3 w-3" />
                {r === 0 ? 'Any' : `${r}+`}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
