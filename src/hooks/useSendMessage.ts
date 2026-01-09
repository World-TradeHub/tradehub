import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { toast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

export const useSendMessage = () => {
  const { user } = useWorldApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content}: { conversationId: string; content: string,sellerId:string,productId:string,isFirstMessage:boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Insert message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // Update conversation's last_message_at
      const { error: convError } = await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (convError) throw convError;

      return message;
    },
    onMutate: async ({ conversationId, content,isFirstMessage }) => {
      if(!isFirstMessage){
      await queryClient.cancelQueries({
        queryKey: ['conversation', conversationId],
      });

      const previousConversation = queryClient.getQueryData([
        'conversation',
        conversationId,
      ]);

      const optimisticMessage = {
        id: `optimistic-${nanoid()}`,
        content,
        senderId: user!.id,
        createdAt: new Date().toISOString(),
        isRead: true,
        optimistic: true,
        status: 'sending',
      };

      queryClient.setQueryData(
        ['conversation', conversationId],
        (old: any) => {
          if (!old?.conversationDetail) return old;

          return {
            ...old,
            conversationDetail: {
              ...old.conversationDetail,
              messages: [
                ...old.conversationDetail.messages,
                optimisticMessage,
              ],
            },
          };
        }
      );

      return { previousConversation };
    }
    },
    onSettled: (_data, _, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.conversationId] });

      queryClient.invalidateQueries({ queryKey: ['conversationBySellerProduct', variables.sellerId,variables.productId] });
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
