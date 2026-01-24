
import { useRouter } from 'next/router';

export default function DebugEnv() {
    const router = useRouter();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE;

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Environment Debugger</h1>
            <div className="p-4 bg-slate-100 rounded-lg">
                <p><strong>NEXT_PUBLIC_API_BASE:</strong> {apiBase || '(undefined)'}</p>
                <p><strong>Node Env:</strong> {process.env.NODE_ENV}</p>
            </div>
            <button
                onClick={() => router.push('/admin')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Go to Admin Dashboard
            </button>
        </div>
    );
}
