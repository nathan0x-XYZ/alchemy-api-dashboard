import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from '@/components/status-indicator';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface EndpointStats {
  successRate: number;
  avgResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
}

interface EndpointCardProps {
  name: string;
  method: HTTPMethod;
  path: string;
  description: string;
  stats: EndpointStats;
  isActive: boolean;
}

export function EndpointCard({
  name,
  method,
  path,
  description,
  stats,
  isActive
}: EndpointCardProps) {
  const methodColors = {
    GET: 'bg-blue-500/20 text-blue-400',
    POST: 'bg-green-500/20 text-green-400',
    PUT: 'bg-yellow-500/20 text-yellow-400',
    DELETE: 'bg-red-500/20 text-red-400',
    PATCH: 'bg-purple-500/20 text-purple-400'
  };

  const getHealthStatus = (stats: EndpointStats) => {
    if (stats.errorRate > 5) return 'error';
    if (stats.avgResponseTime > 1000) return 'warning';
    return 'healthy';
  };

  const formatResponseTime = (ms: number) => {
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  };

  const status = getHealthStatus(stats);

  return (
    <Card className="bg-gray-900 text-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">{name}</h3>
              <StatusIndicator
                variant={isActive ? 'healthy' : 'neutral'}
                size="sm"
              >
                {isActive ? 'Active' : 'Inactive'}
              </StatusIndicator>
            </div>
            <p className="text-gray-400 text-sm">
              {description}
            </p>
          </div>
        </div>

        {/* Method and Path */}
        <div className="flex items-center gap-2 font-mono text-sm mb-8">
          <Badge className={methodColors[method]}>{method}</Badge>
          <code className="px-3 py-1 rounded-md bg-gray-800 flex-1 overflow-x-auto whitespace-nowrap">
            {path}
          </code>
        </div>

        {/* Stats */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-[10px] uppercase tracking-widest">Success Rate</div>
                <div className="font-mono text-2xl">{stats.successRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-400 text-[10px] uppercase tracking-widest">Response Time</div>
                <div className="font-mono text-2xl">{formatResponseTime(stats.avgResponseTime)}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-[10px] uppercase tracking-widest">REQ/MIN</div>
                <div className="font-mono text-2xl">{stats.requestsPerMinute}</div>
              </div>
              <div>
                <div className="text-gray-400 text-[10px] uppercase tracking-widest">Error Rate</div>
                <div className="font-mono text-2xl">{stats.errorRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
