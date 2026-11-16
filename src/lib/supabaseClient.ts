import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Validation checks
const isPlaceholderUrl =
  !rawUrl ||
  rawUrl === 'https://your-project-id.supabase.co' ||
  rawUrl.includes('your-project');

const isPlaceholderKey =
  !rawKey ||
  rawKey === 'your-anon-public-key' ||
  rawKey === 'your-public-client-key' ||
  rawKey.length < 20;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !isPlaceholderUrl &&
  !isPlaceholderKey &&
  rawUrl.startsWith('https://')
);

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  urlConfigured: boolean;
  keyConfigured: boolean;
  urlValue?: string;
  errorMessage?: string;
}

export const supabaseConfigStatus: SupabaseConfigStatus = {
  isConfigured: isSupabaseConfigured,
  urlConfigured: Boolean(rawUrl && !isPlaceholderUrl && rawUrl.startsWith('https://')),
  keyConfigured: Boolean(rawKey && !isPlaceholderKey),
  urlValue: rawUrl || undefined,
  errorMessage: !isSupabaseConfigured
    ? !rawUrl || isPlaceholderUrl
      ? 'VITE_SUPABASE_URL is not configured or uses placeholder value.'
      : 'VITE_SUPABASE_ANON_KEY is not configured or uses placeholder value.'
    : undefined,
};

// Safe fallback credentials so imports never trigger hard crash when unconfigured
const resolvedUrl = isSupabaseConfigured
  ? rawUrl!
  : 'https://placeholder-project.supabase.co';

const resolvedKey = isSupabaseConfigured
  ? rawKey!
  : 'placeholder-anon-key-preventing-hard-crash';

export const supabase: SupabaseClient<Database> = createClient<Database>(
  resolvedUrl,
  resolvedKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Diagnostic ping to test live connectivity to the Supabase endpoint
 */
export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
  latencyMs: number;
}> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message: 'Supabase credentials are not configured in your .env file.',
      latencyMs: 0,
    };
  }

  const startTime = performance.now();

  try {
    // Probe the public Supabase auth health endpoint
    const { error } = await supabase.auth.getSession();
    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      return {
        ok: false,
        message: `Connected to API but received auth error: ${error.message}`,
        latencyMs,
      };
    }

    return {
      ok: true,
      message: `Successfully connected to ${new URL(rawUrl!).hostname} (${latencyMs}ms)`,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - startTime);
    const message = err instanceof Error ? err.message : 'Unknown network failure';
    return {
      ok: false,
      message: `Connection failed: ${message}`,
      latencyMs,
    };
  }
}
