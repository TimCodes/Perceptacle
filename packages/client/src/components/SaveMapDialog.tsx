import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ReactFlowNode, ReactFlowEdge, SaveMapDialogData } from '@/types/telemetryMap';

interface SaveMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveMapDialogData) => void;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  isLoading?: boolean;
}

export function SaveMapDialog({
  isOpen,
  onClose,
  onSave,
  nodes,
  edges,
  isLoading = false,
}: SaveMapDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      isPublic,
      tags,
    });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsPublic(false);
    setTags([]);
    setTagInput('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Telemetry Map</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Map Statistics */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Nodes: {nodes.length}</span>
              <span>Connections: {edges.length}</span>
            </div>
          </div>
          
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter map name"
              className="w-full"
            />
          </div>
          
          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full"
            />
          </div>
          
          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add tag and press Enter"
              className="w-full"
            />
          </div>
          
          {/* Public Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="public"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(!!checked)}
            />
            <label htmlFor="public" className="text-sm">
              Make this map public (others can view and copy)
            </label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Map'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
