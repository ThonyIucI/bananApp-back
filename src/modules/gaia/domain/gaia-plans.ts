export const GAIA_PLAN_LIMITS = {
  free: {
    dailyInteractions: 30,
    contextMessages: 8,
    sttMode: 'on-device' as const,
    tts: 'native' as const,
    communityAlerts: 'receive' as const,
    crud: 'limited' as const,
  },
  pro: {
    dailyInteractions: 150,
    contextMessages: 12,
    sttMode: 'on-device' as const,
    tts: 'enhanced' as const,
    communityAlerts: 'receive-emit' as const,
    crud: 'full' as const,
  },
  promax: {
    dailyInteractions: 500,
    contextMessages: 20,
    sttMode: 'gemini-audio' as const,
    tts: 'enhanced' as const,
    communityAlerts: 'receive-emit' as const,
    crud: 'full' as const,
  },
} as const;

export type TGaiaPlan = keyof typeof GAIA_PLAN_LIMITS;
