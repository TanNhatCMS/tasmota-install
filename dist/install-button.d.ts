import type { FlashState } from "./const";
import type { EwtInstallDialog } from "./install-dialog";
export declare class InstallButton extends HTMLElement {
    static isSupported: boolean;
    static isAllowed: boolean;
    static observedAttributes: string[];
    private static style;
    manifest?: string;
    firmwareFile?: File;
    eraseFirst?: boolean;
    hideProgress?: boolean;
    showLog?: boolean;
    logConsole?: boolean;
    baudRate?: number;
    state?: FlashState;
    renderRoot?: ShadowRoot;
    overrides: EwtInstallDialog["overrides"];
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    connectedCallback(): void;
}
