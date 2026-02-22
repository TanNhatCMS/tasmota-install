import { LitElement } from "lit";
import type { Partition } from "../partition.js";
import "./ewt-button";
import "./ewt-textfield";
export declare class EwtLittleFSManager extends LitElement {
    partition: Partition;
    espStub: any;
    logger: any;
    onClose?: () => void;
    private _currentPath;
    private _files;
    private _fs;
    private _blockSize;
    private _usage;
    private _diskVersion;
    private _busy;
    private _selectedFile;
    private _flashProgress;
    private _isFlashing;
    private _flashOperation;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    private _openFilesystem;
    private _refreshFiles;
    private _estimateUsage;
    private _formatSize;
    private _navigateUp;
    private _navigateTo;
    private _uploadFile;
    private _createFolder;
    private _downloadFile;
    private _deleteFile;
    private _backupImage;
    private _writeToFlash;
    private _cleanup;
    private _handleFileSelect;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        "ewt-littlefs-manager": EwtLittleFSManager;
    }
}
