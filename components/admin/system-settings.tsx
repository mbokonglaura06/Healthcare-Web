// components/admin/system-settings.tsx

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button"; // assumes you have shadcn/ui
import { Input } from "@/components/ui/input";   // assumes you have shadcn/ui
import { Label } from "@/components/ui/label";   // assumes you have shadcn/ui
import { useState } from "react";

const settingsSchema = z.object({
  siteName: z.string().min(2, "Site name is too short"),
  contactEmail: z.string().email("Invalid email address"),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SystemSettings() {
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "Healthcare App",
      contactEmail: "support@example.com",
    },
  });

  const onSubmit = (data: SettingsForm) => {
    console.log("Saved settings:", data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">System Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="siteName">Site Name</Label>
          <Input id="siteName" {...register("siteName")} />
          {errors.siteName && (
            <p className="text-sm text-red-500">{errors.siteName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input id="contactEmail" type="email" {...register("contactEmail")} />
          {errors.contactEmail && (
            <p className="text-sm text-red-500">{errors.contactEmail.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full">
          Save Settings
        </Button>
      </form>

      {saved && (
        <p className="mt-3 text-green-600 text-center">Settings saved!</p>
      )}
    </div>
  );
}
