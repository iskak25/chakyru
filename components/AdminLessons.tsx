"use client";

import { useEffect, useRef, useState } from "react";
import { saveCatalogLessons } from "@/lib/db";
import { setLiveLessons } from "@/lib/catalogStore";
import { youtubeIdFromInput, type Lesson } from "@/lib/lessons";
import { useI18n } from "@/lib/locale";
import { useCatalog } from "@/lib/useCatalog";
import { AppDialog } from "./AppDialog";

export function AdminLessons() {
  const { locale, t } = useI18n();
  const ru = locale === "ru";
  const { lessons } = useCatalog();
  const [items, setItems] = useState<Lesson[]>(lessons);
  const [selectedId, setSelectedId] = useState(lessons[0]?.id ?? "");
  const [feedback, setFeedback] = useState<"saved" | "error" | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    if (dirty.current) return;
    setItems(lessons);
  }, [lessons]);

  useEffect(() => {
    if (!items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0]?.id ?? "");
    }
  }, [items, selectedId]);

  const draft = items.find((item) => item.id === selectedId) ?? items[0];

  function patch(id: string, partial: Partial<Lesson> | { title?: Lesson["title"]; desc?: Lesson["desc"] }) {
    dirty.current = true;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  }

  async function save() {
    setBusy(true);
    try {
      // Firestore's setDoc() rejects the whole document if ANY field is
      // explicitly `undefined` (not just missing) -- so a lesson without a
      // YouTube link (in either language) must omit the key/language
      // entirely rather than setting it to undefined or an empty string.
      const next = items.map(({ youtubeId, ...item }) => {
        const ky = youtubeId?.ky ? youtubeIdFromInput(youtubeId.ky) : "";
        const linkRu = youtubeId?.ru ? youtubeIdFromInput(youtubeId.ru) : "";
        return ky || linkRu ? { ...item, youtubeId: { ...(ky ? { ky } : {}), ...(linkRu ? { ru: linkRu } : {}) } } : item;
      });
      await saveCatalogLessons(next);
      setLiveLessons(next);
      setItems(next);
      dirty.current = false;
      setFeedback("saved");
    } catch {
      setFeedback("error");
    } finally {
      setBusy(false);
    }
  }

  function addLesson() {
    const created: Lesson = {
      id: `lesson-${crypto.randomUUID().slice(0, 8)}`,
      title: { ky: "Жаңы сабак", ru: "Новый урок" },
      desc: { ky: "", ru: "" },
    };
    dirty.current = true;
    setItems((prev) => [...prev, created]);
    setSelectedId(created.id);
  }

  function remove() {
    if (!draft || items.length < 1) return;
    if (!window.confirm(t.admin.confirmDelete)) return;
    const next = items.filter((item) => item.id !== draft.id);
    dirty.current = true;
    setItems(next);
    setSelectedId(next[0]?.id ?? "");
  }

  const input = "w-full border border-ink/15 bg-transparent px-3 py-2 text-sm";

  return (
    <>
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="bg-cream-deep p-3">
        <button type="button" onClick={addLesson} className="mb-3 w-full bg-forest px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-cream">
          {t.admin.newLesson}
        </button>
        <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto">
          {items.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => setSelectedId(lesson.id)}
              className={`px-3 py-2 text-left text-sm ${
                lesson.id === selectedId ? "bg-forest text-cream" : "text-ink-soft hover:text-ink"
              }`}
            >
              {lesson.title[locale]}
            </button>
          ))}
        </div>
      </div>

      {draft ? (
        <div className="space-y-4 bg-cream-deep p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-ink-soft">
              {t.admin.titleKy}
              <input
                className={`${input} mt-1`}
                value={draft.title.ky}
                onChange={(e) => patch(draft.id, { title: { ...draft.title, ky: e.target.value } })}
              />
            </label>
            <label className="text-xs text-ink-soft">
              {t.admin.titleRu}
              <input
                className={`${input} mt-1`}
                value={draft.title.ru}
                onChange={(e) => patch(draft.id, { title: { ...draft.title, ru: e.target.value } })}
              />
            </label>
            <label className="text-xs text-ink-soft">
              {t.admin.youtubeKy}
              <input
                className={`${input} mt-1`}
                placeholder="https://youtube.com/watch?v=…  /  dQw4w9wgGcQ"
                value={draft.youtubeId?.ky ?? ""}
                onChange={(e) => patch(draft.id, { youtubeId: { ...draft.youtubeId, ky: e.target.value } })}
              />
            </label>
            <label className="text-xs text-ink-soft">
              {t.admin.youtubeRu}
              <input
                className={`${input} mt-1`}
                placeholder="https://youtube.com/watch?v=…  /  dQw4w9wgGcQ"
                value={draft.youtubeId?.ru ?? ""}
                onChange={(e) => patch(draft.id, { youtubeId: { ...draft.youtubeId, ru: e.target.value } })}
              />
            </label>
            <label className="text-xs text-ink-soft sm:col-span-2">
              {t.admin.descKy}
              <textarea
                rows={3}
                className={`${input} mt-1`}
                value={draft.desc.ky}
                onChange={(e) => patch(draft.id, { desc: { ...draft.desc, ky: e.target.value } })}
              />
            </label>
            <label className="text-xs text-ink-soft sm:col-span-2">
              {t.admin.descRu}
              <textarea
                rows={3}
                className={`${input} mt-1`}
                value={draft.desc.ru}
                onChange={(e) => patch(draft.id, { desc: { ...draft.desc, ru: e.target.value } })}
              />
            </label>
          </div>
          {draft.youtubeId?.ky || draft.youtubeId?.ru ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {draft.youtubeId?.ky ? (
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">KY</p>
                  <div className="aspect-video overflow-hidden bg-page">
                    <iframe
                      title={`${draft.title.ky} (KY)`}
                      src={`https://www.youtube-nocookie.com/embed/${youtubeIdFromInput(draft.youtubeId.ky)}`}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : null}
              {draft.youtubeId?.ru ? (
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">RU</p>
                  <div className="aspect-video overflow-hidden bg-page">
                    <iframe
                      title={`${draft.title.ru} (RU)`}
                      src={`https://www.youtube-nocookie.com/embed/${youtubeIdFromInput(draft.youtubeId.ru)}`}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="bg-forest px-5 py-2 text-[11px] uppercase tracking-[0.14em] text-cream disabled:opacity-50"
            >
              {t.admin.save}
            </button>
            <button type="button" onClick={remove} className="px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-rose">
              {t.admin.delete}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-soft">{t.admin.emptyLessons}</p>
      )}
    </div>
    {feedback ? (
      <AppDialog
        title={feedback === "saved" ? (ru ? "Сохранено" : "Сакталды") : (ru ? "Не сохранено" : "Сакталган жок")}
        onClose={() => setFeedback(null)}
      >
        <p role="status" className="my-6 text-base leading-7">{feedback === "saved" ? t.admin.saved : t.admin.error}</p>
        <button type="button" onClick={() => setFeedback(null)} className="w-full rounded-xl bg-[#302a25] p-3 text-white">
          {ru ? "Понятно" : "Түшүнүктүү"}
        </button>
      </AppDialog>
    ) : null}
    </>
  );
}
