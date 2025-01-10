export class DuckDuckGoSearchException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuckDuckGoSearchException';
  }
}

export class RatelimitException extends DuckDuckGoSearchException {
  constructor(message: string) {
    super(message);
    this.name = 'RatelimitException';
  }
}

export class TimeoutException extends DuckDuckGoSearchException {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutException';
  }
}

export class ConversationLimitException extends DuckDuckGoSearchException {
  constructor(message: string) {
    super(message);
    this.name = 'ConversationLimitException';
  }
}