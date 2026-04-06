'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Gift, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PrizeInput } from '@/lib/giveaway';

import { CardSectionHeader } from './card-section-header';

interface PrizeSetupCardProps {
  prizes: PrizeInput[];
  onChangePrizes: (prizes: PrizeInput[]) => void;
}

export function PrizeSetupCard({ prizes, onChangePrizes }: PrizeSetupCardProps) {
  const [prizesRef] = useAutoAnimate<HTMLDivElement>();

  const totalPrizeCount = prizes.reduce((sum, p) => sum + p.quantity, 0);

  const addPrize = () => {
    onChangePrizes([
      ...prizes,
      { id: crypto.randomUUID(), name: `${prizes.length + 1} 獎`, quantity: 1 },
    ]);
  };

  const updatePrize = (index: number, field: 'name' | 'quantity', value: string | number) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    onChangePrizes(updated);
  };

  const removePrize = (index: number) => {
    if (prizes.length <= 1) return;
    onChangePrizes(prizes.filter((_, i) => i !== index));
  };

  return (
    <Card className="flex flex-col gap-3 p-4">
      <CardSectionHeader
        action={
          <Button size="xs" variant="ghost" onClick={addPrize}>
            <Plus className="h-3 w-3" />
            新增
          </Button>
        }
        icon={Gift}
        title="獎項設定"
      />

      <div ref={prizesRef} className="space-y-2">
        {prizes.map((prize, i) => (
          <div key={prize.id} className="flex items-center gap-2">
            <Input
              className="text-body h-10 flex-1"
              placeholder="獎項名稱"
              value={prize.name}
              onChange={(e) => updatePrize(i, 'name', e.target.value)}
            />
            <Input
              className="text-body h-10 w-16"
              min={1}
              type="number"
              value={prize.quantity}
              onChange={(e) => updatePrize(i, 'quantity', parseInt(e.target.value) || 1)}
            />
            <Button
              disabled={prizes.length <= 1}
              size="icon-sm"
              variant="ghost"
              onClick={() => removePrize(i)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-caption">共 {totalPrizeCount} 個名額</p>
    </Card>
  );
}
