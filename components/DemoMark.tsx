"use client";

function Band({ className }: { className: string }) {
  // Палитра сайта: тёмный эспрессо, кремовый текст, золотой акцент, шрифт с засечками.
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-40 flex h-10 select-none items-center justify-center gap-3 overflow-hidden bg-espresso/90 text-cream backdrop-blur-sm ${className}`}
    >
      <span className="h-px w-8 bg-gold/70" />
      <span className="whitespace-nowrap font-serif text-[15px] uppercase tracking-[0.22em] sm:text-base">
        Той чакыруу <span className="mx-1 text-gold">·</span> <span className="text-gold">ДЕМО</span>
      </span>
      <span className="h-px w-8 bg-gold/70" />
    </div>
  );
}

/**
 * Отметка неоплаченного предпросмотра: две спокойные полосы «Той чакыруу · ДЕМО» вверху и внизу
 * окна в стиле сайта. Они закреплены (fixed) и не прокручиваются вместе со страницей, не
 * перехватывают касания. Это отдельный слой отображения: он не попадает в фото и в сохранённое
 * содержимое страницы. `editor` сдвигает полосы, чтобы не закрывать панели редактора.
 */
export function DemoWatermark({ editor = false }: { editor?: boolean }) {
  return (
    <div aria-hidden data-demo-watermark>
      {/* Простая крупная надпись по центру: светлая заливка с тёмной обводкой читается на любом фоне */}
      <div className="pointer-events-none fixed inset-0 z-40 flex select-none items-center justify-center">
        <span
          className="font-serif uppercase tracking-[0.3em]"
          style={{
            fontSize: "clamp(56px, 20vw, 160px)",
            color: "rgba(255,255,255,0.38)",
            WebkitTextStroke: "1.5px rgba(15,12,10,0.4)",
            textShadow: "0 2px 20px rgba(15,12,10,0.25)",
          }}
        >
          ДЕМО
        </span>
      </div>
      <Band className={editor ? "top-14 sm:top-16" : "top-0"} />
      <Band className={editor ? "bottom-[calc(104px+env(safe-area-inset-bottom))] sm:bottom-0" : "bottom-0"} />
    </div>
  );
}

export function demoNote(locale: string) {
  return locale === "ru"
    ? "Это демоверсия. После оплаты отметка исчезнет, и вы сможете поделиться страницей."
    : "Бул — демо версия. Төлөгөндөн кийин белги жоголот жана барак менен бөлүшө аласыз.";
}
