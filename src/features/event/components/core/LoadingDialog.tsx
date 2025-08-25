export function LoadingDialog({ message = "処理中..." }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 shadow-xl">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    );
}
