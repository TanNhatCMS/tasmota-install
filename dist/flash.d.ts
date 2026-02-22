import { Logger } from "tasmota-webserial-esptool";
import { FlashState } from "./const";
export declare const flash: (onEvent: (state: FlashState) => void, esploader: any, // ESPLoader instance from tasmota-webserial-esptool
logger: Logger, manifestPath: string, eraseFirst: boolean, firmwareBuffer: Uint8Array, baudRate?: number) => Promise<void>;
