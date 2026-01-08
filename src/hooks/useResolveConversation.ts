import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { ConversationDetail } from '@/types/Product';

type UseResolvedConversationParams = {
    conversationId?: string | null;
    participantId?: string | null;
    productId?: string | null;
};


const fetchConversationById = (conversationId: string) => {
    const { user } = useWorldApp();

    return useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: async () => {
            if (!user?.id) return null;

            // Get conversation details
            const { data: conversation, error: convError } = await supabase.rpc('get_conversations_with_participant', {
                conversation_id: conversationId,
                current_user_id: user.id
            }).single();

            if (convError && convError.code !== 'PGRST116') {
                // real DB error
                throw convError;
            }

            if (!conversation) {
                // conversation simply does not exist
                return null;
            }

            // Get messages
            const { data: messages, error: msgError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (msgError) throw msgError;


            return {
                conversationDetail: transformToConversationDetail(conversation, messages),
                isPreChat: false
            }
        },
        enabled: !!user?.id && !!conversationId,
    });
};


const fetchConversationBySellerAndProduct = (conversationId:string,sellerId: string, productId: string) => {
    const { user } = useWorldApp();

    return useQuery({
        queryKey: ['conversationBySellerProduct', sellerId, productId],
        queryFn: async () => {
            if (!user?.id) return null;

            // Get conversation details
            const { data: conversation, error: convError } = await supabase.rpc('get_conversation_from_seller_and_product', {
                sellerid: sellerId,
                productid: productId,
                current_user_id: user.id
            }).single();


            if (convError && convError.code !== 'PGRST116') {
                // real DB error
                throw convError;
            }

            if (conversation) {

                const { data: messages, error: msgError } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', conversation.id)
                    .order('created_at', { ascending: true });

                if (msgError) throw msgError;

                return {

                    conversationDetail: transformToConversationDetail(conversation, messages),
                    isPrechat: false
                }
            }

            if (!conversation) {
                // conversation simply does not exist
                const { data: product, error: productError } = await supabase
                    .from('products')
                    .select('id, title, images, price, currency')
                    .eq('id', productId)
                    .single();

                if (productError && productError.code !== 'PGRST116') {
                    // real DB error
                    throw productError;
                }

                // Fetch seller from public_profiles view
                const { data: seller, error: sellerError } = await supabase
                    .from('public_profiles')
                    .select('id, username, profile_picture_url, is_verified')
                    .eq('id', sellerId)
                    .single();

                if (sellerError && sellerError.code !== 'PGRST116') {
                    // real DB error
                    throw sellerError;
                }

                if (!product || !seller) return null;

                return {
                    conversationDetail: {
                        product: {
                            id: product.id,
                            title: product.title,
                            images: product.images,
                            price: product.price,
                            currency: product.currency,
                        },
                        participant: {
                            id: seller.id,
                            username: seller.username,
                            profilePictureUrl: seller.profile_picture_url,
                            isVerified: seller.is_verified,
                        },
                        messages: []
                    } as ConversationDetail,
                    isPreChat: true

                }
            }

        },
        enabled: !!user?.id && !!sellerId && !!productId && !conversationId,
    });
};

function transformToConversationDetail(conversation, messages: Object[]): ConversationDetail {

    try {

        if (!conversation) {
            return null
        }

        return {
            id: conversation.id,
            product: {
                id: conversation.product_id,
                title: conversation.product_title,
                images: conversation.product_images,
                price: conversation.product_price,
                currency: conversation.product_currency,
            },
            participant: {
                id: conversation.participant_id,
                username: conversation.participant_username,
                profilePictureUrl: conversation.participant_profile_picture_url,
                isVerified: conversation.participant_is_verified,
                isBuyer: conversation.participant_is_buyer
            },
            messages: messages.map((msg: any) => ({
                id: msg.id,
                content: msg.content,
                senderId: msg.sender_id,
                createdAt: msg.created_at,
                isRead: msg.is_read,
            })),
        } as ConversationDetail;



    }
    catch (e) {
        return null
    }



}


export function useResolvedConversation(
    {
        conversationId,
        participantId,
        productId,
    }: UseResolvedConversationParams
) {
    const byId = fetchConversationById(conversationId ?? '');

    // 2️⃣ Try conversation by seller + product
    const bySellerProduct = fetchConversationBySellerAndProduct(
        conversationId??'',
        participantId ?? '',
        productId ?? ''
    );


    const conversationLoading =
        byId.isLoading ||
        bySellerProduct.isLoading;


    let { conversationDetail, isPreChat } = { conversationDetail: null, isPreChat: false }


    if (byId.data) {

        conversationDetail = byId.data.conversationDetail
        isPreChat = byId.data.isPreChat
    }
    else if (bySellerProduct.data) {
        conversationDetail = bySellerProduct.data.conversationDetail
        isPreChat = bySellerProduct.data.isPreChat

    }


    return {
        conversationDetail,
        isPreChat,
        conversationLoading,
        error: byId.error || bySellerProduct.error,
    };



}