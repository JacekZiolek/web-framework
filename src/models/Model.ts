import { AxiosPromise, AxiosResponse } from "axios";

interface ModelAttributes<T> {
  get<K extends keyof T>(key: K): T[K];
  set(value: T): void;
  getAll(): T;
}

interface Sync<T> {
  fetch(id: number): AxiosPromise;
  save(data: T): AxiosPromise;
}

interface Events {
  on(eventName: string, callback: () => void): void;
  trigger(eventName: string): void;
}

export interface HasId {
  id?: number;
}

export class Model<T extends HasId> {
  constructor(
    private attributes: ModelAttributes<T>,
    private events: Events,
    private sync: Sync<T>,
  ) {}

  on = this.events.on;
  trigger = this.events.trigger;
  get = this.attributes.get;

  set(update: T): void {
    this.attributes.set(update);
    this.events.trigger("change");
  }

  async fetch(): Promise<void> {
    const id = this.get("id");
    if (typeof id !== "number") {
      throw new Error("Cannot fetch without an id.");
    }
    try {
      const response: AxiosResponse = await this.sync.fetch(id);
      this.set(response.data);
    } catch (err) {
      console.log("try block", err);
    }
  }

  async save(): Promise<void> {
    try {
      await this.sync.save(this.attributes.getAll());
      this.trigger("save");
    } catch {
      this.trigger("error");
    }
  }
}
