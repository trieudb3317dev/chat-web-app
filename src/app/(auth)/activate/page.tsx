import ActivateComponent from "./ActivateComponent";

export default function ActivatePage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = (searchParams && (searchParams as any).token) || null;
  return <ActivateComponent token={token} />;
}
