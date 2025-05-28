// @ts-ignore We use StrictEventEmitter to type EventEmitter
import EventEmitter from "microee";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import StrictEventEmitter from "strict-event-emitter-types";

/**
 * These are the types that the global event emitter can emit.
 */
interface Events {
  "dataset-added": {
    datasetIri: string;
  };
  "metadata-panel-opened": {
    datasetIri: string;
  };
}

type GlobalEventEmitter = StrictEventEmitter<EventEmitter, Events>;

const globalEventEmitter: GlobalEventEmitter = new EventEmitter();

const EventEmitterContext =
  createContext<GlobalEventEmitter>(globalEventEmitter);

export const EventEmitterProvider = ({ children }: PropsWithChildren<{}>) => {
  return (
    <EventEmitterContext.Provider value={globalEventEmitter}>
      {children}
    </EventEmitterContext.Provider>
  );
};

type EventEmitterHandler<T extends keyof Events> = (ev: Events[T]) => void;

export const useEventEmitter = <T extends keyof Events>(
  event?: T,
  callback?: EventEmitterHandler<T>
) => {
  const eventEmitterCtx = useContext(EventEmitterContext);
  const eventEmitter = eventEmitterCtx;
  useEffect(() => {
    if (!eventEmitter || !event || !callback) {
      return;
    }
    eventEmitter.on(event as unknown as keyof Events, callback);
    // eslint-disable-next-line consistent-return
    return () => {
      eventEmitter.removeListener(event, callback);
    };
  }, [eventEmitter, event, callback]);

  return eventEmitter;
};
