export type ChatSendWaitStateInput = {
  sendButtonDisabled: boolean;
  requestFailureText: string | null;
};

export function resolveChatSendWaitState(input: ChatSendWaitStateInput): string {
  if (input.requestFailureText) {
    return input.requestFailureText;
  }

  if (input.sendButtonDisabled) {
    return "pending";
  }

  return "ok";
}
