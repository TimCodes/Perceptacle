import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, MapPin, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { TelemetryMapService } from "@/services/telemetryMapService";

export default function TelemetryMaps() {
  const [_, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all telemetry maps from the server (all maps are public)
  const { data: maps = [], isLoading, error } = useQuery({
    queryKey: ['telemetryMaps'],
    queryFn: () => TelemetryMapService.getTelemetryMaps(),
  });

  // Filter maps based on search query
  const filteredMaps = useMemo(() => {
    return maps.filter(
      (map) =>
        map.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        map.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        map.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [maps, searchQuery]);

  const handleMapClick = (mapId: string) => {
    // Navigate to home page (diagram editor) with map ID
    setLocation(`/?mapId=${mapId}`);
  };

  return (
    <div className="p-6 h-[calc(100vh-65px)] w-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Button>
          <h1 className="text-2xl font-bold">Telemetry Maps</h1>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search maps by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Loading maps...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">
                Error loading maps. Please try again later.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {filteredMaps.map((map) => (
                  <Card
                    key={map.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary"
                    onClick={() => handleMapClick(map.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          {map.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                          <MapPin className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {map.description || "No description available"}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">
                            {map.nodes.length} nodes
                          </Badge>
                          {map.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMapClick(map.id);
                            }}
                          >
                            View Map →
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredMaps.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? `No maps found matching "${searchQuery}"`
                      : "No telemetry maps available. Create your first map!"}
                  </p>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
