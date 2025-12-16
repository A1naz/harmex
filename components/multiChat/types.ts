export interface Chat {
  id: number;
  name: string;
  provider?: string;
  type?: 'chat' | 'video' | 'audio' | 'image';
  messages: Message[];
  input: string;
}

export interface Message {
  id: number;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

