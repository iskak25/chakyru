import type { Metadata } from "next";
import { templates } from "@/lib/templates";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const tpl = templates.find((item) => item.id === id);
  if (!tpl) return {};
  const is3d = tpl.format === "site3d";
  const title = `${tpl.name.ky} — ${is3d ? "3D той чакыруу" : "той чакыруу"} | Toichakyru`;
  const description = `${tpl.name.ky} (${tpl.name.ru}): ${is3d ? "3D чакыруу, 3д приглашение на той" : "онлайн той чакыруу, электронное приглашение"}. Аттарды жана датаны жазып, WhatsApp аркылуу жөнөтүңүз.`;
  const url = `https://toichakyru.com/templates/${id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: "Toichakyru", title, description, images: ["/icon.png"] },
  };
}

export default async function TemplateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tpl = templates.find((item) => item.id === id);
  if (!tpl) return children;
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: tpl.name.ky,
            description: `${tpl.name.ky} (${tpl.name.ru}) — онлайн той чакыруу шаблону`,
            url: `https://toichakyru.com/templates/${id}`,
            brand: { "@type": "Brand", name: "Toichakyru" },
            offers: {
              "@type": "Offer",
              price: tpl.priceSom,
              priceCurrency: "KGS",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
    </>
  );
}
