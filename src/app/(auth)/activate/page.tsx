import ActivateComponent from "./ActivateComponent";

export default async function ActivatePage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  // In some Next versions `searchParams` may be a Promise; await it safely.
  const sp = await (searchParams as any);
  const token = (sp && (sp as any).token) ?? null;
  return <ActivateComponent token={token} />;
}
