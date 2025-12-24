
export interface HttpRequestOptions {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
}

export interface HttpResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
}

export class HttpActionService {
    /**
     * Execute an HTTP request
     */
    async executeRequest(options: HttpRequestOptions): Promise<HttpResponse> {
        const { url, method, headers = {}, body } = options;

        try {
            console.log(`Executing HTTP Action: ${method} ${url}`);

            const fetchOptions: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
            }

            const response = await fetch(url, fetchOptions);

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            // Convert Headers object to plain record
            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            return {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                data
            };
        } catch (error) {
            console.error('Error executing HTTP action:', error);
            throw error;
        }
    }
}
