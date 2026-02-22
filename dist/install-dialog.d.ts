import { LitElement, PropertyValues, TemplateResult } from "lit";
import "./components/ewt-button";
import "./components/ewt-checkbox";
import "./components/ewt-console";
import "./components/ewt-dialog";
import "./components/ewt-formfield";
import "./components/ewt-icon-button";
import "./components/ewt-textfield";
import "./components/ewt-select";
import "./components/ewt-list-item";
import "./components/ewt-littlefs-manager";
import "./pages/ewt-page-progress";
import "./pages/ewt-page-message";
import { Logger, Manifest } from "./const.js";
import { ImprovSerial } from "improv-wifi-serial-sdk/dist/serial";
export declare class EwtInstallDialog extends LitElement {
    esploader: any;
    manifestPath: string;
    firmwareFile?: File;
    baudRate?: number;
    logger: Logger;
    overrides?: {
        checkSameFirmware?: (manifest: Manifest, deviceImprov: ImprovSerial["info"]) => boolean;
    };
    private _manifest;
    private _info?;
    private _client?;
    private _state;
    private _installErase;
    private _installConfirmed;
    private _installState?;
    private _provisionForce;
    private _wasProvisioned;
    private _error?;
    private _busy;
    private _ssids?;
    private _selectedSsid;
    private _partitions?;
    private _selectedPartition?;
    private _espStub?;
    private _improvChecked;
    private _consoleInitialized;
    private _improvSupported;
    private _isUsbJtagOrOtgDevice;
    private _openConsoleAfterReconnect;
    private _visitDeviceAfterReconnect;
    private _addToHAAfterReconnect;
    private _changeWiFiAfterReconnect;
    private _ensureStub;
    private get _port();
    private _isUsbJtagOrOtg;
    private _isWebUsbWithExternalSerial;
    private _releaseReaderWriter;
    private _resetBaudrateForConsole;
    private _prepareForFlashOperations;
    private _handleFlashComplete;
    private _resetDeviceAndReleaseLocks;
    private _resetToBootloaderAndReleaseLocks;
    protected render(): TemplateResult<1>;
    _renderProgress(label: string | TemplateResult, progress?: number): TemplateResult<1>;
    _renderError(label: string): [string, TemplateResult, boolean];
    _renderRequestPortSelection(): [string, TemplateResult, boolean];
    _renderDashboard(): [string, TemplateResult, boolean, boolean];
    _renderDashboardNoImprov(): [string, TemplateResult, boolean, boolean];
    _renderProvision(): [string | undefined, TemplateResult, boolean];
    _renderAskErase(): [string | undefined, TemplateResult];
    _renderInstall(): [string | undefined, TemplateResult, boolean, boolean];
    _renderLogs(): [string | undefined, TemplateResult, boolean];
    _renderPartitions(): [string | undefined, TemplateResult, boolean];
    _renderLittleFS(): [string | undefined, TemplateResult, boolean, boolean];
    private _readPartitionTable;
    private _openFilesystem;
    private _formatSize;
    willUpdate(changedProps: PropertyValues): void;
    private _updateSsids;
    protected firstUpdated(changedProps: PropertyValues): void;
    protected updated(changedProps: PropertyValues): void;
    private _focusFormElement;
    private _initialize;
    /**
     * Switch device from bootloader mode to firmware mode.
     * For USB-JTAG/OTG devices: Requires port reconnection (sets REQUEST_PORT_SELECTION state).
     * For external serial: Resets device without port change.
     *
     * @param actionAfterReconnect - Action to perform after reconnect: 'console', 'visit', 'homeassistant', 'wifi', or null
     */
    private _switchToFirmwareMode;
    private _startInstall;
    private _confirmInstall;
    _flashFilebuffer(fileBuffer: Uint8Array): Promise<void>;
    private _doProvision;
    private _handleDisconnect;
    private _handleSelectNewPort;
    private _testImprov;
    private _handleClose;
    /**
     * Return if the device runs same firmware as manifest.
     */
    private get _isSameFirmware();
    /**
     * Return if the device runs same firmware and version as manifest.
     */
    private get _isSameVersion();
    private _closeClientWithoutEvents;
    static styles: import("lit").CSSResult[];
}
declare global {
    interface HTMLElementTagNameMap {
        "ewt-install-dialog": EwtInstallDialog;
    }
}
