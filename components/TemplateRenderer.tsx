"use client";

import { FormatInvite } from "@/components/FormatInvite";
import type { Invitation } from "@/lib/types";
import type { InvitePatch } from "@/components/CanvasEdit";

export function TemplateRenderer({
  templateId,
  data,
  locale,
  compact,
  interactive,
  onChange,
  onReload,
  onSelect,
  startOpen,
}: {
  templateId: string;
  data: Invitation;
  locale: string;
  compact?: boolean;
  interactive?: boolean;
  onChange?: InvitePatch;
  onReload?: () => void;
  onSelect?: (id: string | null) => void;
  startOpen?: boolean;
}) {
  return (
    <FormatInvite
      invitation={{ ...data, templateId }}
      locale={locale}
      compact={compact}
      interactive={interactive}
      onChange={onChange}
      onReload={onReload}
      onSelect={onSelect}
      startOpen={startOpen}
    />
  );
}
