import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { Badge } from '@/shared/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  Filter,
  Users,
  Compass,
  Zap,
} from 'lucide-react';

const GOLD_PALETTE = [
  '#D6A64F',
  '#E4B866',
  '#F5D084',
  '#A87A1F',
  '#916918',
  '#6B655A',
  '#3B82F6',
  '#10B981',
  '#EC4899',
  '#8B5CF6',
];

export const AdminInsightsPage: React.FC = () => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: () => adminApi.getAllActivities(),
  });

  // 1. Event Type Frequency Distribution
  const eventDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach((act) => {
      counts[act.event] = (counts[act.event] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [activities]);

  // 2. Conversion Funnel: VIEW_PRODUCT -> ADD_TO_CART -> BEGIN_CHECKOUT -> PURCHASE
  const funnelData = useMemo(() => {
    const views = activities.filter((a) => a.event === 'VIEW_PRODUCT').length;
    const cartAdds = activities.filter((a) => a.event === 'ADD_TO_CART').length;
    const checkouts = activities.filter((a) => a.event === 'BEGIN_CHECKOUT').length;
    const purchases = activities.filter((a) => a.event === 'PURCHASE').length;

    return [
      { stage: 'Product Views', count: views || 1 },
      { stage: 'Cart Additions', count: cartAdds },
      { stage: 'Checkouts Initiated', count: checkouts },
      { stage: 'Completed Orders', count: purchases },
    ];
  }, [activities]);

  // 3. Activity Timeline (grouped by day/hour)
  const timelineData = useMemo(() => {
    const buckets: Record<string, number> = {};
    activities.forEach((a) => {
      const dateKey = a.createdAt ? a.createdAt.substring(0, 10) : 'Recent';
      buckets[dateKey] = (buckets[dateKey] || 0) + 1;
    });

    return Object.entries(buckets).map(([date, count]) => ({
      date,
      events: count,
    }));
  }, [activities]);

  // 4. Recommendation Engagement Insights
  const recData = useMemo(() => {
    const impressions = activities.filter((a) => a.event === 'VIEW_RECOMMENDATION').length;
    const clicks = activities.filter((a) => a.event === 'CLICK_RECOMMENDATION').length;
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0';

    return { impressions, clicks, ctr };
  }, [activities]);

  // 5. User Frequency Segmentation (RFM proxy)
  const rfmFrequencyData = useMemo(() => {
    const userEventCounts: Record<number, number> = {};
    activities.forEach((a) => {
      userEventCounts[a.userId] = (userEventCounts[a.userId] || 0) + 1;
    });

    let singleAction = 0;
    let engaged = 0;
    let highIntent = 0;
    let powerUsers = 0;

    Object.values(userEventCounts).forEach((c) => {
      if (c === 1) singleAction++;
      else if (c <= 3) engaged++;
      else if (c <= 7) highIntent++;
      else powerUsers++;
    });

    return [
      { name: '1 Action (Bouncers)', value: singleAction || 1 },
      { name: '2-3 Actions (Browsers)', value: engaged || 1 },
      { name: '4-7 Actions (High Intent)', value: highIntent || 1 },
      { name: '8+ Actions (Power Buyers)', value: powerUsers || 1 },
    ];
  }, [activities]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Intelligence Dashboard
            </h1>
            <Badge variant="gold">
              <Sparkles className="h-3 w-3 mr-1 text-gold" />
              Real-Time Decision Engine
            </Badge>
          </div>
          <p className="text-xs text-muted mt-1">
            Analyzing customer events, RFM cohorts, recommendation click-throughs, and purchase funnels.
          </p>
        </div>

        <div className="text-xs text-muted bg-surface-secondary px-3 py-1.5 rounded border border-border">
          Total Telemetry Events Logged: <strong className="text-foreground">{activities.length}</strong>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Row: Conversion Funnel & Event Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Conversion Funnel */}
            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gold" />
                  <span>Commerce Conversion Funnel</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Progression from product discovery to checkout and purchase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2724" />
                      <XAxis type="number" stroke="#9B958A" fontSize={11} />
                      <YAxis
                        type="category"
                        dataKey="stage"
                        stroke="#F3EFE7"
                        fontSize={11}
                        width={110}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#151412',
                          borderColor: '#2A2724',
                          color: '#F3EFE7',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#D6A64F" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Event Distribution Bar Chart */}
            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gold" />
                  <span>Activity Frequency by Event</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Aggregated telemetry across all active customer actions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventDistribution.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2724" />
                      <XAxis
                        dataKey="name"
                        stroke="#9B958A"
                        fontSize={10}
                        interval={0}
                        tickFormatter={(v) => v.replace(/_/g, ' ')}
                      />
                      <YAxis stroke="#9B958A" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#151412',
                          borderColor: '#2A2724',
                          color: '#F3EFE7',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#E4B866" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Row: Activity Timeline & RFM Segmentation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline */}
            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gold" />
                  <span>Activity Timeline (Daily Velocity)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Event volume velocity trends over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2724" />
                      <XAxis dataKey="date" stroke="#9B958A" fontSize={11} />
                      <YAxis stroke="#9B958A" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#151412',
                          borderColor: '#2A2724',
                          color: '#F3EFE7',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="events"
                        stroke="#D6A64F"
                        strokeWidth={2}
                        dot={{ fill: '#D6A64F', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* RFM Cohort Segmentation (PieChart) */}
            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold" />
                  <span>Customer RFM Frequency Cohorts</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  User engagement grouping based on recorded interaction density.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rfmFrequencyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {rfmFrequencyData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={GOLD_PALETTE[index % GOLD_PALETTE.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#151412',
                          borderColor: '#2A2724',
                          color: '#F3EFE7',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '11px', color: '#9B958A' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Recommendation Engine Performance */}
          <Card className="border-gold/30 bg-gold/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-gold">
                  <Compass className="h-5 w-5" />
                  <span>Recommendation System Performance</span>
                </CardTitle>
                <Badge variant="gold">CTR: {recData.ctr}%</Badge>
              </div>
              <CardDescription className="text-xs">
                Performance tracking of personalized suggestions across storefront and detail pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="p-4 rounded-md border border-border bg-surface space-y-1">
                  <span className="text-[11px] text-muted uppercase tracking-wider">
                    Impressions (VIEW_REC)
                  </span>
                  <p className="font-serif text-2xl font-bold text-foreground">
                    {recData.impressions}
                  </p>
                </div>

                <div className="p-4 rounded-md border border-border bg-surface space-y-1">
                  <span className="text-[11px] text-muted uppercase tracking-wider">
                    Engagements (CLICK_REC)
                  </span>
                  <p className="font-serif text-2xl font-bold text-gold">
                    {recData.clicks}
                  </p>
                </div>

                <div className="p-4 rounded-md border border-border bg-surface space-y-1">
                  <span className="text-[11px] text-muted uppercase tracking-wider">
                    Click-Through Rate (CTR)
                  </span>
                  <p className="font-serif text-2xl font-bold text-emerald-400">
                    {recData.ctr}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
