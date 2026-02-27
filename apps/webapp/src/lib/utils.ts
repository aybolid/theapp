export async function copyToClipboard(
  text: string,
  hooks?: { onSuccess?: () => void; onError?: () => void },
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    hooks?.onSuccess?.();
    return true;
  } catch {
    hooks?.onError?.();
    return false;
  }
}
