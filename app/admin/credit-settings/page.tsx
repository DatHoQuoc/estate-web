"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BotMessageSquare,
  CircleDollarSign,
  Loader2,
  RefreshCcw,
  Save,
  Settings2,
} from "lucide-react";
import { AdminSectionScaffold } from "@/components/admin/AdminSectionScaffold";
import { StatsCard } from "@/components/common/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/hooks/use-toast";
import {
  bulkUpdateAdminCreditSettings,
  getAdminCreditSettings,
  resetDailyAiChatCountForUser,
  updateAdminCreditSetting,
  type AdminCreditSetting,
  type AdminCreditSettingKey,
  type BulkAdminCreditSettingsPayload,
} from "@/lib/api-client";

const SETTING_META: Record<
  AdminCreditSettingKey,
  {
    title: string;
    helper: string;
    unit: string;
  }
> = {
  POST_COST_BASIC: {
    title: "Base Post Cost",
    helper: "Charged for a standard listing post.",
    unit: "VND",
  },
  POST_COST_PREMIUM_ADD: {
    title: "Premium Add-on Cost",
    helper: "Additional charge to upgrade to premium post.",
    unit: "VND",
  },
  AI_CHAT_FREE_LIMIT: {
    title: "Free AI Messages / Day",
    helper: "Number of AI assistant messages allowed at zero cost per user/day.",
    unit: "messages",
  },
  AI_CHAT_COST_PER_MSG: {
    title: "AI Message Cost (Above Free Limit)",
    helper: "Credit amount charged for each additional AI message.",
    unit: "credits",
  },
};

const ORDERED_KEYS: AdminCreditSettingKey[] = [
  "POST_COST_BASIC",
  "POST_COST_PREMIUM_ADD",
  "AI_CHAT_FREE_LIMIT",
  "AI_CHAT_COST_PER_MSG",
];

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const parseNumber = (raw: string) => {
  if (!raw.trim()) return NaN;
  return Number(raw.replaceAll(",", "").replaceAll(" ", ""));
};

export default function AdminCreditSettingsPage() {
  const [settings, setSettings] = useState<AdminCreditSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<AdminCreditSettingKey | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [userIdToReset, setUserIdToReset] = useState("");
  const [formValues, setFormValues] = useState<Record<AdminCreditSettingKey, string>>({
    POST_COST_BASIC: "",
    POST_COST_PREMIUM_ADD: "",
    AI_CHAT_FREE_LIMIT: "",
    AI_CHAT_COST_PER_MSG: "",
  });
  const [descriptions, setDescriptions] = useState<Record<AdminCreditSettingKey, string>>({
    POST_COST_BASIC: "",
    POST_COST_PREMIUM_ADD: "",
    AI_CHAT_FREE_LIMIT: "",
    AI_CHAT_COST_PER_MSG: "",
  });

  const settingsByKey = useMemo(() => {
    return settings.reduce((acc, item) => {
      acc[item.settingKey] = item;
      return acc;
    }, {} as Record<AdminCreditSettingKey, AdminCreditSetting>);
  }, [settings]);

  const syncFormFromSettings = (items: AdminCreditSetting[]) => {
    const nextValues: Record<AdminCreditSettingKey, string> = {
      POST_COST_BASIC: "",
      POST_COST_PREMIUM_ADD: "",
      AI_CHAT_FREE_LIMIT: "",
      AI_CHAT_COST_PER_MSG: "",
    };
    const nextDescriptions: Record<AdminCreditSettingKey, string> = {
      POST_COST_BASIC: "",
      POST_COST_PREMIUM_ADD: "",
      AI_CHAT_FREE_LIMIT: "",
      AI_CHAT_COST_PER_MSG: "",
    };

    items.forEach((item) => {
      nextValues[item.settingKey] = String(item.value ?? "");
      nextDescriptions[item.settingKey] = item.description || "";
    });

    setFormValues(nextValues);
    setDescriptions(nextDescriptions);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdminCreditSettings();
      setSettings(data);
      syncFormFromSettings(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load settings";
      toast({ title: "Load failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSingleUpdate = async (key: AdminCreditSettingKey) => {
    const value = parseNumber(formValues[key]);
    if (!Number.isFinite(value) || value < 0) {
      toast({
        title: "Invalid value",
        description: "Value must be a number greater than or equal to 0.",
        variant: "destructive",
      });
      return;
    }

    setSavingKey(key);
    try {
      await updateAdminCreditSetting(key, {
        value,
        description: descriptions[key] || undefined,
      });
      await loadSettings();
      toast({ title: "Setting updated", description: `${SETTING_META[key].title} has been saved.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update setting";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  const handleBulkUpdate = async () => {
    const payload: BulkAdminCreditSettingsPayload = {
      postCostBasic: parseNumber(formValues.POST_COST_BASIC),
      postCostPremiumAdd: parseNumber(formValues.POST_COST_PREMIUM_ADD),
      aiChatFreeLimit: parseNumber(formValues.AI_CHAT_FREE_LIMIT),
      aiChatCostPerMsg: parseNumber(formValues.AI_CHAT_COST_PER_MSG),
    };

    if (Object.values(payload).some((value) => !Number.isFinite(value) || value < 0)) {
      toast({
        title: "Invalid bulk values",
        description: "All settings in bulk update must be valid numbers greater than or equal to 0.",
        variant: "destructive",
      });
      return;
    }

    setBulkSaving(true);
    try {
      await bulkUpdateAdminCreditSettings(payload);
      await loadSettings();
      toast({ title: "Bulk update complete", description: "All pricing and AI settings were updated." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bulk update failed";
      toast({ title: "Bulk update failed", description: message, variant: "destructive" });
    } finally {
      setBulkSaving(false);
    }
  };

  const handleResetDailyUsage = async () => {
    if (!userIdToReset.trim()) {
      toast({ title: "User ID required", description: "Enter a user ID to reset daily AI usage.", variant: "destructive" });
      return;
    }

    setResetLoading(true);
    try {
      await resetDailyAiChatCountForUser(userIdToReset.trim());
      toast({ title: "Daily usage reset", description: `AI daily count was reset for ${userIdToReset.trim()}.` });
      setUserIdToReset("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reset failed";
      toast({ title: "Reset failed", description: message, variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  const postCostBasic = settingsByKey.POST_COST_BASIC?.value ?? 0;
  const postCostPremium = settingsByKey.POST_COST_PREMIUM_ADD?.value ?? 0;
  const freeLimit = settingsByKey.AI_CHAT_FREE_LIMIT?.value ?? 0;
  const aiPerMsg = settingsByKey.AI_CHAT_COST_PER_MSG?.value ?? 0;

  return (
    <AdminSectionScaffold
      eyebrow="Administration"
      title="Credit Settings"
      description="Manage listing pricing knobs and AI usage credit policy from one dedicated section."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Base Post Cost" value={formatVnd(postCostBasic)} icon={<CircleDollarSign className="h-5 w-5" />} variant="default" />
        <StatsCard title="Premium Add-On" value={formatVnd(postCostPremium)} icon={<Settings2 className="h-5 w-5" />} variant="info" />
        <StatsCard title="AI Free Messages" value={freeLimit} icon={<BotMessageSquare className="h-5 w-5" />} variant="success" />
        <StatsCard title="AI Cost / Message" value={aiPerMsg} icon={<CircleDollarSign className="h-5 w-5" />} variant="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Credit Pricing Settings</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Update each policy independently, including optional description notes.
              </p>
            </div>
            <Button variant="outline" onClick={loadSettings} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setting</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORDERED_KEYS.map((key) => {
                  const meta = SETTING_META[key];
                  return (
                    <TableRow key={key}>
                      <TableCell className="align-top">
                        <p className="font-medium text-foreground">{meta.title}</p>
                        <p className="mt-1 max-w-65 whitespace-normal text-xs text-muted-foreground">{meta.helper}</p>
                        <Badge variant="outline" className="mt-2">{key}</Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          <Input
                            value={formValues[key]}
                            onChange={(event) => {
                              setFormValues((prev) => ({ ...prev, [key]: event.target.value }));
                            }}
                            inputMode="decimal"
                          />
                          <p className="text-xs text-muted-foreground">Unit: {meta.unit}</p>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Textarea
                          className="min-h-20"
                          value={descriptions[key]}
                          onChange={(event) => {
                            setDescriptions((prev) => ({ ...prev, [key]: event.target.value }));
                          }}
                          placeholder="Optional note for admins"
                        />
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <Button
                          onClick={() => handleSingleUpdate(key)}
                          disabled={savingKey !== null || loading}
                        >
                          {savingKey === key ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Update</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-basic">Base post cost</Label>
                <Input
                  id="bulk-basic"
                  value={formValues.POST_COST_BASIC}
                  onChange={(event) => {
                    setFormValues((prev) => ({ ...prev, POST_COST_BASIC: event.target.value }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-premium">Premium add-on cost</Label>
                <Input
                  id="bulk-premium"
                  value={formValues.POST_COST_PREMIUM_ADD}
                  onChange={(event) => {
                    setFormValues((prev) => ({ ...prev, POST_COST_PREMIUM_ADD: event.target.value }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-limit">AI free message limit</Label>
                <Input
                  id="bulk-limit"
                  value={formValues.AI_CHAT_FREE_LIMIT}
                  onChange={(event) => {
                    setFormValues((prev) => ({ ...prev, AI_CHAT_FREE_LIMIT: event.target.value }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-msg-cost">AI cost per message</Label>
                <Input
                  id="bulk-msg-cost"
                  value={formValues.AI_CHAT_COST_PER_MSG}
                  onChange={(event) => {
                    setFormValues((prev) => ({ ...prev, AI_CHAT_COST_PER_MSG: event.target.value }));
                  }}
                />
              </div>
              <Button className="w-full" onClick={handleBulkUpdate} disabled={bulkSaving || loading}>
                {bulkSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Apply Bulk Update
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reset Daily AI Count</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="reset-user">User ID</Label>
              <Input
                id="reset-user"
                placeholder="550e8400-e29b-41d4-a716-446655440001"
                value={userIdToReset}
                onChange={(event) => setUserIdToReset(event.target.value)}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResetDailyUsage}
                disabled={resetLoading}
              >
                {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                Reset User Daily Count
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSectionScaffold>
  );
}