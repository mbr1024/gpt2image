export function isActiveStatus(status: string | undefined): boolean {
  return !status || status === 'submitted' || status === 'pending' || status === 'processing';
}
