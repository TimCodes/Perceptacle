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

export const CustomFieldsSection = ({
  customFields,
  handleCustomFieldChange,
}) => (
  <div className="space-y-4">
    <h3 className="font-medium">Custom Fields</h3>
    <div className="space-y-4">
      {customFields.map((field, index) => (
        <div key={index} className="space-y-2">
          <Label>{field.name}</Label>
          {field.type === "select" ? (
            <Select
              value={field.value || ""}
              onValueChange={(value) =>
                handleCustomFieldChange(field.name, value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={field.type === "number" ? "number" : "text"}
              value={field.value || ""}
              onChange={(e) =>
                handleCustomFieldChange(field.name, e.target.value)
              }
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

export default CustomFieldsSection;
