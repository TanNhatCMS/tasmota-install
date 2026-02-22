import { getChipFamilyName } from "./util/chip-family-name";
import { sleep } from "./util/sleep";
import { corsProxyFetch } from "./util/cors-proxy";
export const flash = async (onEvent, esploader, // ESPLoader instance from tasmota-webserial-esptool
logger, manifestPath, eraseFirst, firmwareBuffer, baudRate) => {
    let manifest;
    let build;
    let chipFamily;
    let chipVariant = null;
    const fireStateEvent = (stateUpdate) => onEvent({
        ...stateUpdate,
        manifest,
        build,
        chipFamily,
        chipVariant,
    });
    var manifestProm = null;
    var manifestURL = "";
    try {
        manifestProm = JSON.parse(manifestPath);
    }
    catch {
        manifestURL = new URL(manifestPath, location.toString()).toString();
        manifestProm = corsProxyFetch(manifestURL).then((resp) => resp.json());
    }
    // Use the provided ESPLoader instance - NO port logic here!
    // For debugging
    window.esploader = esploader;
    fireStateEvent({
        state: "initializing" /* FlashStateType.INITIALIZING */,
        message: "Initializing...",
        details: { done: false },
    });
    // Only initialize if not already done
    if (!esploader.chipFamily) {
        try {
            await esploader.initialize();
        }
        catch (err) {
            logger.error(err);
            fireStateEvent({
                state: "error" /* FlashStateType.ERROR */,
                message: "Failed to initialize. Try resetting your device or holding the BOOT button while clicking INSTALL.",
                details: { error: "failed_initialize" /* FlashError.FAILED_INITIALIZING */, details: err },
            });
            if (esploader.connected) {
                await esploader.disconnect();
            }
            return;
        }
    }
    chipFamily = getChipFamilyName(esploader);
    chipVariant = esploader.chipVariant;
    fireStateEvent({
        state: "initializing" /* FlashStateType.INITIALIZING */,
        message: `Initialized. Found ${chipFamily}${chipVariant ? ` (${chipVariant})` : ""}`,
        details: { done: true },
    });
    fireStateEvent({
        state: "manifest" /* FlashStateType.MANIFEST */,
        message: "Fetching manifest...",
        details: { done: false },
    });
    try {
        manifest = await manifestProm;
    }
    catch (err) {
        fireStateEvent({
            state: "error" /* FlashStateType.ERROR */,
            message: `Unable to fetch manifest: ${err}`,
            details: { error: "fetch_manifest_failed" /* FlashError.FAILED_MANIFEST_FETCH */, details: err },
        });
        await esploader.disconnect();
        return;
    }
    build = manifest.builds.find((b) => {
        // Match chipFamily and optionally chipVariant
        if (b.chipFamily !== chipFamily) {
            return false;
        }
        // If build specifies chipVariant, it must match
        if (b.chipVariant && b.chipVariant !== chipVariant) {
            return false;
        }
        return true;
    });
    if (!build) {
        fireStateEvent({
            state: "error" /* FlashStateType.ERROR */,
            message: `Your ${chipFamily}${chipVariant ? ` (${chipVariant})` : ""} is not supported by this firmware.`,
            details: { error: "not_supported" /* FlashError.NOT_SUPPORTED */, details: chipFamily },
        });
        await esploader.disconnect();
        return;
    }
    fireStateEvent({
        state: "manifest" /* FlashStateType.MANIFEST */,
        message: "Manifest fetched",
        details: { done: true },
    });
    fireStateEvent({
        state: "preparing" /* FlashStateType.PREPARING */,
        message: "Preparing installation...",
        details: { done: false },
    });
    // The esploader passed in is always a stub (from _ensureStub())
    // Baudrate was already set in _ensureStub()
    const espStub = esploader;
    // Verify stub has chipFamily (should be copied in _ensureStub)
    if (!espStub.chipFamily) {
        logger.error("Stub missing chipFamily - this should not happen!");
        fireStateEvent({
            state: "error" /* FlashStateType.ERROR */,
            message: "Internal error: Stub not properly initialized",
            details: {
                error: "failed_initialize" /* FlashError.FAILED_INITIALIZING */,
                details: "Missing chipFamily",
            },
        });
        return;
    }
    // Fetch firmware files
    const filePromises = build.parts.map(async (part) => {
        const url = new URL(part.path, manifestURL || location.toString()).toString();
        const resp = await corsProxyFetch(url);
        if (!resp.ok) {
            throw new Error(`Downlading firmware ${part.path} failed: ${resp.status}`);
        }
        return resp.arrayBuffer();
    });
    // If firmwareBuffer is provided, use it instead of fetching
    if (firmwareBuffer) {
        filePromises.push(Promise.resolve(firmwareBuffer.buffer));
    }
    const files = [];
    let totalSize = 0;
    for (const prom of filePromises) {
        try {
            const data = await prom;
            files.push(data);
            totalSize += data.byteLength;
        }
        catch (err) {
            fireStateEvent({
                state: "error" /* FlashStateType.ERROR */,
                message: err.message,
                details: { error: "failed_firmware_download" /* FlashError.FAILED_FIRMWARE_DOWNLOAD */, details: err },
            });
            await esploader.disconnect();
            return;
        }
    }
    fireStateEvent({
        state: "preparing" /* FlashStateType.PREPARING */,
        message: "Installation prepared",
        details: { done: true },
    });
    // CRITICAL: Erase MUST be done BEFORE writing, if requested
    if (eraseFirst) {
        fireStateEvent({
            state: "erasing" /* FlashStateType.ERASING */,
            message: "Erasing flash...",
            details: { done: false },
        });
        try {
            logger.log("Erasing flash memory. Please wait...");
            await espStub.eraseFlash();
            logger.log("Flash erased successfully");
            fireStateEvent({
                state: "erasing" /* FlashStateType.ERASING */,
                message: "Flash erased",
                details: { done: true },
            });
        }
        catch (err) {
            logger.error(`Flash erase failed: ${err.message}`);
            fireStateEvent({
                state: "error" /* FlashStateType.ERROR */,
                message: `Failed to erase flash: ${err.message}`,
                details: { error: "write_failed" /* FlashError.WRITE_FAILED */, details: err },
            });
            await esploader.disconnect();
            return;
        }
    }
    fireStateEvent({
        state: "writing" /* FlashStateType.WRITING */,
        message: `Writing progress: 0 %`,
        details: {
            bytesTotal: totalSize,
            bytesWritten: 0,
            percentage: 0,
        },
    });
    let lastPct = 0;
    let totalBytesWritten = 0;
    try {
        for (let i = 0; i < build.parts.length; i++) {
            const part = build.parts[i];
            const data = files[i];
            await espStub.flashData(data, (bytesWritten, bytesTotal) => {
                const newPct = Math.floor(((totalBytesWritten + bytesWritten) / totalSize) * 100);
                if (newPct === lastPct) {
                    return;
                }
                lastPct = newPct;
                fireStateEvent({
                    state: "writing" /* FlashStateType.WRITING */,
                    message: `Writing progress: ${newPct} %`,
                    details: {
                        bytesTotal: totalSize,
                        bytesWritten: totalBytesWritten + bytesWritten,
                        percentage: newPct,
                    },
                });
            }, part.offset);
            totalBytesWritten += data.byteLength;
        }
    }
    catch (err) {
        fireStateEvent({
            state: "error" /* FlashStateType.ERROR */,
            message: err.message,
            details: { error: "write_failed" /* FlashError.WRITE_FAILED */, details: err },
        });
        await esploader.disconnect();
        return;
    }
    fireStateEvent({
        state: "writing" /* FlashStateType.WRITING */,
        message: "Writing complete",
        details: {
            bytesTotal: totalSize,
            bytesWritten: totalSize,
            percentage: 100,
        },
    });
    await sleep(100);
    // DON'T release locks after flash!
    // Keep the stub and locks so the port can be used again
    // (e.g., for Improv, Manage Filesystem, or another flash)
    fireStateEvent({
        state: "finished" /* FlashStateType.FINISHED */,
        message: "All done!",
    });
};
