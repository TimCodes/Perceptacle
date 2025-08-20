import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomFieldsSection from "@/components/CustomFieldsSection";

export const ConfigurationTab = ({
  editedNode,
  handleChange,
  handleCustomFieldChange,
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Label</Label>
      <Input
        value={editedNode.data.label || ""}
        onChange={(e) => handleChange("label", e.target.value)}
      />
    </div>

    <div className="space-y-2">
      <Label>Status</Label>
      <Select
        value={editedNode.data.status || "active"}
        onValueChange={(value) => handleChange("status", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="error">Error</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label>Description</Label>
      <Input
        value={editedNode.data.description || ""}
        onChange={(e) => handleChange("description", e.target.value)}
      />
    </div>

    {editedNode.data.customFields &&
      editedNode.data.customFields.length > 0 && (
        <CustomFieldsSection
          customFields={editedNode.data.customFields}
          handleCustomFieldChange={handleCustomFieldChange}
        />
      )}
  </div>
);

export default ConfigurationTab;
