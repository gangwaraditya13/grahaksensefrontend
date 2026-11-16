import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  phase: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  phase,
}) => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <Card className="border-border/80">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="gold">Scheduled for {phase}</Badge>
            <Construction className="h-5 w-5 text-gold" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
