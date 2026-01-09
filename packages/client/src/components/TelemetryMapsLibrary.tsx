import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Calendar, 
  Users, 
  Trash2, 
  Eye,
  Copy,
  Clock
} from 'lucide-react';
import { TelemetryMap } from '@/types/telemetryMap';
import { TelemetryMapService } from '@/services/telemetryMapService';
import { useToast } from '@/hooks/use-toast';

interface TelemetryMapsLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadMap: (map: TelemetryMap) => void;
  userId?: string;
}

export function TelemetryMapsLibrary({
  isOpen,
  onClose,
  onLoadMap,
  userId,
}: TelemetryMapsLibraryProps) {
  const [myMaps, setMyMaps] = useState<TelemetryMap[]>([]);
  const [publicMaps, setPublicMaps] = useState<TelemetryMap[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('my-maps');
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadMaps();
    }
  }, [isOpen, userId]);

  const loadMaps = async () => {
    setIsLoading(true);
    try {
      const allMaps = await TelemetryMapService.getTelemetryMaps(userId);
      
      // All maps are public, but separate user's own maps for convenience
      setMyMaps(userId ? allMaps.filter(map => map.createdBy === userId) : []);
      setPublicMaps(allMaps);
    } catch (error) {
      console.error('Failed to load maps:', error);
      toast({
        title: 'Error',
        description: 'Failed to load telemetry maps. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMap = async (mapId: string) => {
    if (!userId) return;
    
    if (confirm('Are you sure you want to delete this map?')) {
      try {
        await TelemetryMapService.deleteTelemetryMap(mapId, userId);
        setMyMaps(myMaps.filter(map => map.id !== mapId));
        toast({
          title: 'Success',
          description: 'Telemetry map deleted successfully.',
        });
      } catch (error) {
        console.error('Failed to delete map:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete telemetry map. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const filteredMaps = (maps: TelemetryMap[]) => {
    return maps.filter(map =>
      map.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      map.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      map.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const MapCard = ({ map, showActions = false }: { map: TelemetryMap; showActions?: boolean }) => (
    <div className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{map.name}</h3>
          {map.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{map.description}</p>
          )}
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteMap(map.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(map.createdAt)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {map.nodes.length} nodes
          </div>
          {map.createdAt !== map.updatedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Updated {formatDate(map.updatedAt)}
            </div>
          )}
        </div>
      </div>
      
      {map.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {map.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          onClick={() => {
            onLoadMap(map);
            onClose();
          }}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          Load Map
        </Button>
        {!showActions && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Create a copy of the map for the current user
              const mapCopy = {
                ...map,
                name: `${map.name} (Copy)`,
                id: '',
                createdBy: userId || '',
              };
              onLoadMap(mapCopy);
              onClose();
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Telemetry Maps Library</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search maps by name, description, or tags..."
              className="pl-10"
            />
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-maps">My Maps ({myMaps.length})</TabsTrigger>
              <TabsTrigger value="public-maps">Public Maps ({publicMaps.length})</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading maps...</div>
              ) : (
                <>
                  <TabsContent value="my-maps" className="space-y-4 mt-0">
                    {filteredMaps(myMaps).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No maps match your search.' : 'No saved maps yet.'}
                      </div>
                    ) : (
                      filteredMaps(myMaps).map((map) => (
                        <MapCard key={map.id} map={map} showActions={true} />
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="public-maps" className="space-y-4 mt-0">
                    {filteredMaps(publicMaps).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No public maps match your search.' : 'No public maps available.'}
                      </div>
                    ) : (
                      filteredMaps(publicMaps).map((map) => (
                        <MapCard key={map.id} map={map} showActions={false} />
                      ))
                    )}
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
