/** Renders structured data. `<` is escaped so the payload can never close the script tag. */
export default function JsonLd({ data }: { data: object | undefined }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
