import { useEffect, useState } from "react";
import { getSiteContent, getSiteSettings } from "./data";
import { defaultSiteContent, defaultSiteSettings } from "./defaults";
import type { SiteContent, SiteSettings } from "./types";

export function useSiteContentData() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const nextContent = await getSiteContent();
        if (!cancelled) {
          setContent(nextContent);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { content, setContent, isLoading };
}

export function useSiteSettingsData() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const nextSettings = await getSiteSettings();
        if (!cancelled) {
          setSettings(nextSettings);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, setSettings, isLoading };
}
