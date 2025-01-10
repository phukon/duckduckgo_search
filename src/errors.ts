export class DuckDuckGoSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuckDuckGoSearchError";
  }
}

export class RatelimitError extends DuckDuckGoSearchError {
  constructor(message: string) {
    super(message);
    this.name = "RatelimitError";
  }
}

export class TimeoutError extends DuckDuckGoSearchError {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export class ConversationLimitError extends DuckDuckGoSearchError {
  constructor(message: string) {
    super(message);
    this.name = "ConversationLimitError";
  }
}
