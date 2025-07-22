import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";

export default function Settings() {
  const [_, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 h-[calc(100vh-65px)] w-screen">
      {/* <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div> */}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Canvas Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="snap-to-grid">Snap to Grid</Label>
              <Switch
                id="snap-to-grid"
                checked={true}
                onCheckedChange={() => {}}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-minimap">Show Minimap</Label>
              <Switch
                id="show-minimap"
                checked={false}
                onCheckedChange={() => {}}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
