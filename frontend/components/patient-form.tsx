"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { fieldGroups, fieldMeta } from "@/lib/patient-config";
import type { PatientFormValues } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PatientFormProps {
  form: UseFormReturn<PatientFormValues>;
}

export function PatientForm({ form }: PatientFormProps) {
  return (
    <div className="grid gap-4">
      {fieldGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.fields.map((fieldName) => {
              const meta = fieldMeta[fieldName];
              const error = form.formState.errors[fieldName]?.message;

              return (
                <div key={fieldName} className="space-y-2">
                  <Label htmlFor={fieldName}>{meta.label}</Label>
                  {meta.type === "number" ? (
                    <Input
                      id={fieldName}
                      type="number"
                      step={meta.step}
                      {...form.register(fieldName, { valueAsNumber: true })}
                    />
                  ) : (
                    <Controller
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                        <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {meta.options.map((option) => (
                              <SelectItem key={`${fieldName}-${option.value}`} value={String(option.value)}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                  {error ? <p className="text-xs text-danger">{error}</p> : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
