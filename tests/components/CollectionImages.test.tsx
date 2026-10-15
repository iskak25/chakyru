// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { collectionDesigns, collectionTemplate } from '@/lib/collectionTemplates';
import { inviteFromTemplate } from '@/lib/templateCanvas';
import { CollectionInvite } from '@/components/CollectionInvite';
import { LocaleProvider } from '@/lib/locale';

afterEach(cleanup);
Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }) });
class Observer { observe() {} unobserve() {} disconnect() {} }
(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = Observer;

describe('collection images', () => {
  it('every rendered local image of every collection design exists', () => {
    const bad: string[] = [];
    for (const design of collectionDesigns) {
      const inv = inviteFromTemplate(collectionTemplate(design));
      const { container, unmount } = render(<LocaleProvider><CollectionInvite invitation={inv} design={design} locale="ru" /></LocaleProvider>);
      for (const img of container.querySelectorAll('img')) {
        const src = img.getAttribute('src') || '';
        if (!src.startsWith('/')) continue;
        if (/\/\.[a-z]+$/.test(src) || !existsSync(join(process.cwd(), 'public', src.split('?')[0]))) bad.push(`${design.id} -> ${src}`);
      }
      unmount();
    }
    expect(bad).toEqual([]);
  }, 120_000);
});
