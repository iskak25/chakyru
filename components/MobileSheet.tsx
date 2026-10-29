"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { RotateCcw } from "lucide-react";

const HINT_KEY = "chakyru-sheet-hint-seen";
const hintSeen = () => { try { return localStorage.getItem(HINT_KEY) === "1"; } catch { return false; } };
const markHintSeen = () => { try { localStorage.setItem(HINT_KEY, "1"); } catch { /* без хранилища подсказка просто покажется снова */ } };

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
  hint,
  history,
  children,
}: {
  /** Шаг назад/вперёд по краям от ручки: остаются под рукой, пока лист открыт. */
  history?: { canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void; undoLabel: string; redoLabel: string };
  /** Одноразовая подсказка про высоту панели (заголовок и текст); без неё не показывается. */
  hint?: { title: string; text: string; close: string };
  open: boolean;
  onClose: () => void;
  title: string;
  /** Высота при открытии и при смене содержимого: низкая, если нужен виден холст, рабочая для форм. */
  initialSnap?: number;
  children: ReactNode;
}) {
  const [snap, setSnap] = useState<number | string | null>(initialSnap);
  const [hintDone, setHintDone] = useState(hintSeen);
  const hintOpen = Boolean(hint) && !hintDone;
  function dismissHint() { setHintDone(true); markHintSeen(); }
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
      setActiveSnapPoint={(next) => {
        // Пользователь сам сдвинул панель: подсказка выполнила задачу.
        if (hintOpen && next !== snap) dismissHint();
        setSnap(next);
      }}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          // тап вне листа (холст, вкладки) обрабатываем сами, а не закрываем лист автоматически
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed inset-x-0 bottom-0 z-[55] flex h-full max-h-[97%] flex-col rounded-t-2xl border-t border-ink/10 bg-page shadow-[0_-12px_28px_rgba(15,12,10,0.12)] outline-none"
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          {history ? (
            <div className="flex shrink-0 items-center justify-between px-2">
              <button type="button" aria-label={history.undoLabel} disabled={!history.canUndo} onClick={history.onUndo} className="flex h-11 w-11 items-center justify-center disabled:opacity-25">
                <RotateCcw size={19} />
              </button>
              <Drawer.Handle className="my-2 shrink-0" />
              <button type="button" aria-label={history.redoLabel} disabled={!history.canRedo} onClick={history.onRedo} className="flex h-11 w-11 items-center justify-center disabled:opacity-25">
                <RotateCcw size={19} className="-scale-x-100" />
              </button>
            </div>
          ) : <Drawer.Handle className="my-2 shrink-0" />}
          {hint && hintOpen ? (
            <div role="note" className="mx-3 mb-2 flex shrink-0 items-start gap-2 rounded-xl bg-black/[0.05] px-3 py-2 text-xs leading-5 text-ink">
              <span aria-hidden>💡</span>
              <p className="min-w-0 flex-1"><b className="block text-[13px]">{hint.title}</b>{hint.text}</p>
              <button type="button" aria-label={hint.close} onClick={dismissHint} className="flex h-8 w-8 shrink-0 items-center justify-center text-base text-ink-soft">✕</button>
            </div>
          ) : null}
          {/* нижние 64px закрывает панель вкладок (EditorDock) */}
          <div className="min-h-0 flex-1 pb-[calc(64px+env(safe-area-inset-bottom))]">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
