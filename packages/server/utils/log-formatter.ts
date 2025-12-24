import { ResourceLog } from '../services/azure';

/**
 * Utility class to format logs from various sources into a standardized string format
 * suitable for LLM context or UI display.
 */
export class LogFormatter {
    /**
     * Format Azure Resource Logs into a readable string
     */
    static formatAzureLogs(logs: ResourceLog[], maxLines: number = 100): string {
        if (!logs || logs.length === 0) {
            return 'No logs found.';
        }

        const formatted = logs
            .slice(0, maxLines)
            .map(log => {
                const timestamp = log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp;
                const level = log.level ? `[${log.level.toUpperCase()}]` : '[INFO]';
                // Sanitize message to avoid breaking markdown/context too much
                const message = (log.message || '').replace(/\r?\n/g, ' ');
                return `${timestamp} ${level} ${message}`;
            })
            .join('\n');

        return formatted;
    }

    /**
     * Format generic text logs (like K8s logs)
     * Assumes input is a single string with newlines or array of strings
     */
    static formatTextLogs(logs: string | string[], maxLines: number = 100): string {
        if (!logs) return 'No logs found.';

        let logLines: string[];

        if (Array.isArray(logs)) {
            logLines = logs;
        } else {
            logLines = logs.split('\n');
        }

        // Filter empty lines and take most recent if too many (assuming chronologically ordered)
        const validLines = logLines.filter(l => l.trim().length > 0);

        if (validLines.length === 0) return 'No logs found.';

        // If we have too many lines, maybe we want the last N lines (tail)
        const displayLines = validLines.slice(-maxLines);

        return displayLines.join('\n');
    }

    /**
     * Format MongoDB logs (slow queries)
     */
    static formatMongoLogs(logs: any[], maxLines: number = 50): string {
        if (!logs || logs.length === 0) {
            return 'No slow query logs found.';
        }

        return logs
            .slice(0, maxLines)
            .map(log => {
                const timestamp = log.ts ? new Date(log.ts).toISOString() : new Date().toISOString();
                const duration = log.millis ? `${log.millis}ms` : '?ms';
                const ns = log.ns ? `[${log.ns}]` : '[]';
                const op = log.op || 'query';
                // Summarize query shape if possible, or just stringify the query/command
                const query = JSON.stringify(log.query || log.command || {}).substring(0, 200);

                return `${timestamp} [SLOW_QUERY] ${ns} (${duration}) ${op}: ${query}`;
            })
            .join('\n');
    }
}
