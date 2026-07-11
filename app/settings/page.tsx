"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Settings, Sun, User, Bell, Shield, Bot, Puzzle, CreditCard, Keyboard, Info, ChevronDown, Check,
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

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || "general");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeTabInfo = tabs.find((t) => t.id === activeTab) || tabs[0];

  const handleTabChange = useCallback(
    (id: TabId) => {
      setActiveTab(id);
      setMobileMenuOpen(false);
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
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl min-w-0 flex-col gap-0 overflow-x-hidden p-4 lg:flex-row lg:p-6">
      <aside className="flex-shrink-0 border-b border-border lg:w-56 lg:border-b-0 lg:border-r lg:pr-4">
        <div className="flex items-center gap-2 pb-3 lg:pt-0">
          <Settings size={16} className="text-accent" />
          <h1 className="font-serif text-lg font-medium text-fg-default">Settings</h1>
        </div>
        <div className="relative pb-3 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            className="flex w-full min-h-[48px] items-center justify-between gap-2 rounded-lg border border-border bg-bg-surface px-4 py-3 text-left transition-colors active:bg-bg-hover"
          >
            <span className="flex items-center gap-2.5">
              <activeTabInfo.icon size={16} className="shrink-0 text-accent" />
              <span className="text-sm font-medium text-fg-default">{activeTabInfo.label}</span>
            </span>
            <ChevronDown size={18} className={`shrink-0 text-fg-muted transition-transform duration-150 ${mobileMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {mobileMenuOpen && (
            <>
              {/* Backdrop closes the menu on outside tap */}
              <div className="fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)} />
              <nav className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-bg-surface shadow-lg">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex w-full min-h-[48px] items-center justify-between gap-2.5 px-4 py-3 text-left transition-colors ${
                        isActive ? "bg-accent/10 text-accent" : "text-fg-default hover:bg-bg-hover"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <tab.icon size={16} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </span>
                      {isActive && <Check size={16} className="shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </div>
        <nav className="hidden lg:flex lg:flex-col lg:gap-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 lg:w-full ${
                  isActive
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-fg-muted hover:text-fg-default hover:bg-bg-hover"
                }`}
              >
                <tab.icon size={15} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto pb-12 lg:pl-8 lg:pr-0 lg:pt-0">
        {renderTab()}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}