/**
 * Detect filesystem type by reading partition header
 */
export declare function detectFilesystemType(espStub: any, offset: number, size: number, logger?: any): Promise<string>;
