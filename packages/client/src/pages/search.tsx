import { useState } from 'react';
import { Search as SearchIcon, Filter, AlertCircle, AlertTriangle, Info, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SearchResult {
  id: string;
  timestamp: string;
  service: string;
  level: 'ERROR' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  source: 'logs' | 'service-bus' | 'database' | 'oracle' | 'mongodb';
}

// Mock data for demonstration
const mockResults: SearchResult[] = [
  {
    id: '1',
    timestamp: '06:32:45 AM',
    service: 'api-gateway',
    level: 'ERROR',
    title: 'Connection timeout to database cluster',
    message: 'Failed to establish connection within 5000ms',
    source: 'logs'
  },
  {
    id: '2',
    timestamp: '06:31:22 AM',
    service: 'microservices-mesh',
    level: 'WARNING',
    title: 'High latency detected on service-b',
    message: 'Response time exceeded 2000ms threshold',
    source: 'logs'
  },
  {
    id: '3',
    timestamp: '06:30:15 AM',
    service: 'monitoring-stack',
    level: 'INFO',
    title: 'Health check passed',
    message: 'All monitoring agents reporting healthy status',
    source: 'logs'
  },
  {
    id: '4',
    timestamp: '06:29:10 AM',
    service: 'order-processor',
    level: 'INFO',
    title: 'Message processed successfully',
    message: 'Order #12345 processed and forwarded to fulfillment',
    source: 'service-bus'
  },
  {
    id: '5',
    timestamp: '06:28:05 AM',
    service: 'data-sync',
    level: 'WARNING',
    title: 'Slow query detected',
    message: 'Query execution took 3.5s - consider optimization',
    source: 'database'
  },
  {
    id: '6',
    timestamp: '06:27:30 AM',
    service: 'auth-service',
    level: 'ERROR',
    title: 'Failed authentication attempt',
    message: 'Invalid credentials provided for user session',
    source: 'oracle'
  },
  {
    id: '7',
    timestamp: '06:26:15 AM',
    service: 'product-catalog',
    level: 'INFO',
    title: 'Document updated',
    message: 'Product catalog entry updated successfully',
    source: 'mongodb'
  },
  {
    id: '8',
    timestamp: '06:25:00 AM',
    service: 'payment-gateway',
    level: 'WARNING',
    title: 'Rate limit approaching',
    message: 'API rate limit at 85% capacity',
    source: 'service-bus'
  }
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set(['logs', 'service-bus', 'database', 'oracle', 'mongodb'])
  );
  const [results, setResults] = useState<SearchResult[]>(mockResults);

  const handleSearch = () => {
    // Filter results based on search query and filters
    let filtered = mockResults;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.service.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter((result) => result.level === levelFilter);
    }

    // Filter by sources
    filtered = filtered.filter((result) => selectedSources.has(result.source));

    // Sort results
    if (sortOrder === 'oldest') {
      filtered = [...filtered].reverse();
    }

    setResults(filtered);
  };

  const toggleSource = (source: string) => {
    const newSources = new Set(selectedSources);
    if (newSources.has(source)) {
      newSources.delete(source);
    } else {
      newSources.add(source);
    }
    setSelectedSources(newSources);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="h-4 w-4" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4" />;
      case 'INFO':
        return <Info className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-500';
      case 'WARNING':
        return 'text-yellow-500';
      case 'INFO':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'logs':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'service-bus':
        return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
      case 'database':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'oracle':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'mongodb':
        return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20';
      default:
        return '';
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] w-screen bg-background p-6 flex flex-col">
      {/* Search Header */}
      <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search logs by message, service, or details..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="h-12 px-6">
              Search
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Level:</span>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Source:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9">
                    {selectedSources.size === 5 ? 'All' : `${selectedSources.size} selected`}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Data Sources</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={selectedSources.has('logs')}
                    onCheckedChange={() => toggleSource('logs')}
                  >
                    Logs
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedSources.has('service-bus')}
                    onCheckedChange={() => toggleSource('service-bus')}
                  >
                    Service Bus
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedSources.has('database')}
                    onCheckedChange={() => toggleSource('database')}
                  >
                    Database
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedSources.has('oracle')}
                    onCheckedChange={() => toggleSource('oracle')}
                  >
                    Oracle
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedSources.has('mongodb')}
                    onCheckedChange={() => toggleSource('mongodb')}
                  >
                    MongoDB
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort:</span>
              <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {results.length} of {mockResults.length} logs
          </p>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-6">
          {results.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your search query or filters</p>
              </div>
            </div>
          ) : (
            results.map((result) => (
              <div
                key={result.id}
                className="bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Level Icon */}
                  <div className={`mt-1 ${getLevelColor(result.level)}`}>
                    {getLevelIcon(result.level)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium uppercase text-sm ${getLevelColor(result.level)}`}>
                          {result.level}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {result.service}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                      </div>
                      <Badge className={`text-xs ${getSourceBadgeColor(result.source)}`}>
                        {result.source}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-base mb-1">{result.title}</h3>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  );
}
