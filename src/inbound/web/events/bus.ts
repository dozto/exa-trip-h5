import EventEmitter from "eventemitter3";
import type { TripUiCommand, TripUiCommandType } from "../state/command/events";

type TripUiCommandHandler<TType extends TripUiCommandType> = (
  command: Extract<TripUiCommand, { type: TType }>
) => void | Promise<void>;

export type TripUiCommandBusErrorHandler = (
  error: unknown,
  command: TripUiCommand
) => void;

export type TripUiCommandBus = {
  emit: (command: TripUiCommand) => void;
  on: <TType extends TripUiCommandType>(
    type: TType,
    handler: TripUiCommandHandler<TType>
  ) => () => void;
};

type CreateTripUiCommandBusOptions = {
  onError?: TripUiCommandBusErrorHandler;
};

const defaultErrorHandler: TripUiCommandBusErrorHandler = (error, command) => {
  console.error("[trip-ui-command-bus] handler failed", {
    commandType: command.type,
    error
  });
};

export const createTripUiCommandBus = (
  options: CreateTripUiCommandBusOptions = {}
): TripUiCommandBus => {
  const emitter = new EventEmitter();
  const onError = options.onError ?? defaultErrorHandler;

  const emit = (command: TripUiCommand): void => {
    emitter.emit(command.type, command);
  };

  const on = <TType extends TripUiCommandType>(
    type: TType,
    handler: TripUiCommandHandler<TType>
  ): (() => void) => {
    const listener = (command: TripUiCommand) => {
      const typedCommand = command as Extract<TripUiCommand, { type: TType }>;
      Promise.resolve(handler(typedCommand)).catch((error) => {
        onError(error, command);
      });
    };

    emitter.on(type, listener);
    return () => {
      emitter.off(type, listener);
    };
  };

  return {
    emit,
    on
  };
};
