"use client";

import type { ComponentProps } from "react";
import { InvitationLanguageProvider } from "./InvitationLanguage";

import { formatOf } from "@/lib/templates";
import { useCatalog } from "@/lib/useCatalog";
import { useI18n } from "@/lib/locale";
import type { Invitation } from "@/lib/types";
import { type InvitePatch } from "./CanvasEdit";
import { PhotoInvite } from "./PhotoInvite";
import { Site3D } from "./Site3D";
import type { WeddingPartInfo } from "@/lib/weddingEditor";
import { getPinterestDesign } from "@/lib/pinterestTemplates";
import { PinterestInvite } from "./PinterestInvite";
import { ThemedSiteInvite } from "./ThemedSiteInvite";
import { FamilySiteInvite } from "./FamilySiteInvite";

export function MediaStage({
  invitation,
  locale,
  compact,
  onChange,
  onSelect,
}: {
  invitation: Invitation;
  locale: string;
  compact?: boolean;
  onChange?: InvitePatch;
  onSelect?: (id: string | null) => void;
}) {
  useCatalog();
  return (
    <PhotoInvite invitation={invitation} locale={locale} compact={compact} onChange={onChange} onSelect={onSelect} />
  );
}

function FormatInviteContent({
  invitation,
  locale,
  compact,
  interactive,
  onChange,
  onReload,
  selected,
  onSelect,
  onPartsChange,
  startOpen,
}: {
  invitation: Invitation;
  locale: string;
  compact?: boolean;
  interactive?: boolean;
  onChange?: InvitePatch;
  onReload?: () => void;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  onPartsChange?: (parts: WeddingPartInfo[]) => void;
  startOpen?: boolean;
}) {
  const { t } = useI18n();
  useCatalog();
  const format = formatOf(invitation.templateId);
  const pinterest = getPinterestDesign(invitation);
  if (pinterest?.eventType === "jentek" || pinterest?.eventType === "tushoo") return <FamilySiteInvite invitation={invitation} design={pinterest} locale={locale} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} startOpen={startOpen} />;
  if (pinterest?.themed) return <ThemedSiteInvite invitation={invitation} design={pinterest} locale={locale} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} startOpen={startOpen} />;
  if (pinterest) return <PinterestInvite invitation={invitation} design={pinterest} locale={locale} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} />;

  if (format === "site3d") {
    const variant = onChange ? "editor" : compact && !interactive ? "preview" : "guest";
    return (
      <div className={compact && !onChange && !interactive ? "h-full" : "h-auto"}>
        <Site3D
          invitation={invitation}
          locale={locale}
          onChange={onChange}
          onReload={onReload}
          variant={variant}
          labels={t.site3d}
          selected={selected}
          onSelect={onSelect}
          onPartsChange={onPartsChange}
          startOpen={startOpen}
          framed={!!compact}
        />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <MediaStage
        invitation={invitation}
        locale={locale}
        compact={compact}
        onChange={onChange}
        onSelect={onSelect}
      />
    </div>
  );
}

export function FormatInvite(props: ComponentProps<typeof FormatInviteContent>) {
  return <InvitationLanguageProvider locale={props.locale}><FormatInviteContent {...props}/></InvitationLanguageProvider>;
}
