import { useMutation,useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { toast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

export const useCreateConversation = () => {
  const { user } = useWorldApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, sellerId }: { productId: string; sellerId: string;message:string}) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          product_id: productId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select()
        .single();

      if (error && error.code === '23505') {
        // Unique violation → fetch the existing conversation
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .eq('product_id', productId)
          .eq('buyer_id', user.id)
          .eq('seller_id', sellerId)
          .single();

        return existing;
      }

      if (error) throw error;
      return data;

    },
    onMutate: async ({ message,sellerId,productId }) => {
      await queryClient.cancelQueries({
        queryKey: ['conversationBySellerProduct',sellerId,productId],
      });

      const previousConversation = queryClient.getQueryData([
        'conversationBySellerProduct',
        sellerId, productId
      ]);

      const optimisticMessage = {
        id: `optimistic-${nanoid()}`,
        content:message,
        senderId: user!.id,
        createdAt: new Date().toISOString(),
        isRead: true,
        optimistic: true,
        status: 'sending',
      };

      queryClient.setQueryData(
        ['conversationBySellerProduct', sellerId,productId],
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
    },
    onError: (error) => {
      toast({
        title: 'Failed to start conversation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
