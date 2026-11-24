import { useMutation } from '@tanstack/react-query';
import { Linking } from 'react-native';

import { apiGet } from '@/api/client';

import type { ReminderMessage } from './types';

async function openReminder(eventId: string): Promise<void> {
  const reminder = await apiGet<ReminderMessage>(`/events/${eventId}/reminder`);
  if (reminder.whatsappUrl) await Linking.openURL(reminder.whatsappUrl);
}

/** US-11a: one tap fetches the ready message and opens WhatsApp. The owner sends it. */
export function useReminder() {
  const mutation = useMutation({ mutationFn: openReminder });
  return {
    remind: mutation.mutate,
    remindingEventId: mutation.isPending ? mutation.variables : undefined,
    failedEventId: mutation.isError ? mutation.variables : undefined,
    errorMessage: mutation.error?.message,
  };
}
