import axios, { AxiosResponse } from "axios";
import { Eventing } from "./Eventing";

export class Collection<T, K> {
  models: T[] = [];
  events: Eventing = new Eventing();

  constructor(
    public rootUrl: string,
    public deserialize: (json: K) => T,
  ) {}

  get on() {
    return this.events.on;
  }

  get trigger() {
    return this.events.trigger;
  }

  async fetch(): Promise<void> {
    try {
      const response: AxiosResponse = await axios.get(this.rootUrl);
      const data = response.data;
      data.forEach((value: K) => {
        const deserializedValue = this.deserialize(value);
        this.models.push(deserializedValue);
      });
      this.trigger("change");
    } catch (error) {
      console.log(error);
    }
  }
}
