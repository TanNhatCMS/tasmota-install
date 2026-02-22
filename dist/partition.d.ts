/**
 * ESP32 Partition Table Parser
 * Based on ESP-IDF partition table format
 */
export interface Partition {
    name: string;
    type: number;
    subtype: number;
    offset: number;
    size: number;
    flags: number;
    typeName: string;
    subtypeName: string;
}
/**
 * Parse the entire partition table
 */
export declare function parsePartitionTable(data: Uint8Array): Partition[];
/**
 * Get the default partition table offset
 */
export declare function getPartitionTableOffset(): number;
/**
 * Format size in human-readable format
 */
export declare function formatSize(bytes: number): string;
