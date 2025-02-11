import axios from 'axios';

export type ChatMessage = {
    id: string;
    projectId: number;
    username: string;
    content: string;
    createdAt: string;
};

export type FetchChatMessagesResponse = ChatMessage[];

export const getChatMessages = async (
  groupId: number,
  projectId: number
): Promise<FetchChatMessagesResponse> => {
  const endpoint = `https://${import.meta.env.VITE_APP_API_BASE_URL}/v1/chat/groups/${groupId}/projects/${projectId}`;

  try {
    const response = await axios.get<FetchChatMessagesResponse>(endpoint, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch chat messages:', error);
    throw error;
  }
};
