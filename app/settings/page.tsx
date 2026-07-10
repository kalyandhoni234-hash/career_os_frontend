"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Settings, Sun, User, Bell, Shield, Bot, Puzzle, CreditCard, Keyboard, Info,
} from "lucide-react";
import {
  GeneralTab,
  AppearanceTab,
  AccountTab,
  NotificationsTab,
  PrivacySecurityTab,
  AIPreferencesTab,
  IntegrationsTab,
  BillingTab,
  KeyboardTab,
  AboutTab,
} from "./tabs";

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "appearance", label: "Appearance", icon: Sun },
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "ai", label: "AI Preferences", icon: Bot },
  { id: "integrations", label: "Integrations", icon: Puzzle },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "keyboard", label: "Keyboard Shortcuts", icon: Keyboard },
  { id: "about", label: "About", icon: Info },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || "general");

  const handleTabChange = useCallback(
    (id: TabId) => {
      setActiveTab(id);
      router.replace(`/settings?tab=${id}`, { scroll: false });
    },
    [router]
  );

  const renderTab = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab />;
      case "appearance":
        return <AppearanceTab />;
      case "account":
        return <AccountTab />;
      case "notifications":
        return <NotificationsTab />;
      case "privacy":
        return <PrivacySecurityTab />;
      case "ai":
        return <AIPreferencesTab />;
      case "integrations":
        return <IntegrationsTab />;
      case "billing":
        return <BillingTab />;
      case "keyboard":
        return <KeyboardTab />;
      case "about":
        return <AboutTab />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-0 p-0 md:flex-row md:p-6">
      <aside className="flex-shrink-0 border-b border-border md:w-56 md:border-b-0 md:border-r md:pr-4">
        <div className="flex items-center gap-2 px-4 pt-4 pb-3 md:px-0 md:pt-0">
          <Settings size={16} className="text-accent" />
          <h1 className="font-serif text-lg font-medium text-fg-default">Settings</h1>
        </div>
        <nav className="flex gap-0 overflow-x-auto px-4 pb-2 md:flex-col md:gap-0 md:overflow-visible md:px-0 md:pb-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 md:w-full ${
                  isActive
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-fg-muted hover:text-fg-default hover:bg-bg-hover"
                }`}
              >
                <tab.icon size={15} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                <span className="whitespace-nowrap md:whitespace-normal">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto px-4 pb-12 pt-4 md:pl-8 md:pr-0 md:pt-0">
        {renderTab()}
      </div>
    </div>
  );
}
