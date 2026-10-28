"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Drawer } from "vaul";

/** Положения листа: низкое (холст виден), рабочее для форм и сеток, почти весь экран. «Свернут» — закрыт, виден только тулбар. */
export const SHEET_SNAPS = [0.45, 0.75, 0.9];
export const SHEET_LOW = SHEET_SNAPS[0];
export const SHEET_WORK = SHEET_SNAPS[1];

/**
 * Нижний лист телефона (vaul, 3 положения: свернут / половина / почти весь экран).
 * Не модальный: холст остаётся доступен для касаний. Закрывается свайпом вниз;
 * тап по холсту и системную «Назад» обрабатывает EditorDock.
 */
export function MobileSheet({
  open,
  onClose,
  title,
  initialSnap = SHEET_LOW,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Высота при открытии и при смене содержимого: низкая, если нужен виден холст, рабочая для форм. */
  initialSnap?: number;
  children: ReactNode;
}) {
  const [snap, setSnap] = useState<number | string | null>(initialSnap);
  useEffect(() => {
    if (open) setSnap(initialSnap);
  }, [open, initialSnap]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      modal={false}
      dismissible
      snapPoints={SHEET_SNAPS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          // тап вне листа (холст, вкладки) обрабатываем сами, а не закрываем лист автоматически
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed inset-x-0 bottom-0 z-[55] flex h-full max-h-[97%] flex-col rounded-t-2xl border-t border-ink/10 bg-page shadow-[0_-12px_28px_rgba(15,12,10,0.12)] outline-none"
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <Drawer.Handle className="my-2 shrink-0" />
          {/* нижние 64px закрывает панель вкладок (EditorDock) */}
          <div className="min-h-0 flex-1 pb-[calc(64px+env(safe-area-inset-bottom))]">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
