export interface Chat {
  id: number;
  name: string;
  messages: Message[];
  input: string;
}

export interface Message {
  id: number;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

