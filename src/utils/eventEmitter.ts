/**
 * Event Emitter
 * 크로스 플랫폼 이벤트 시스템 (React Native & Web)
 */

type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: Map<string, EventCallback[]>;

  constructor() {
    this.events = new Map();
  }

  /**
   * 이벤트 리스너 등록
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  /**
   * 이벤트 리스너 제거
   */
  off(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      return;
    }
    const callbacks = this.events.get(event)!;
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * 이벤트 발생
   */
  emit(event: string, ...args: any[]): void {
    if (!this.events.has(event)) {
      return;
    }
    const callbacks = this.events.get(event)!;
    callbacks.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * 한 번만 실행되는 이벤트 리스너 등록
   */
  once(event: string, callback: EventCallback): void {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }
}

// 싱글톤 인스턴스 생성
const eventEmitter = new EventEmitter();

export default eventEmitter;
