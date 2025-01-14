export function BoardWrapper({
  boardId,
  children,
}: {
  boardId: string;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
