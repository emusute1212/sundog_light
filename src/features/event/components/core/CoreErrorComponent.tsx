import { CoreError } from "../../types/core-error";

export default function CoreErrorComponent({
    coreError,
}: {
    coreError: CoreError;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                <h2 className="text-red-800 text-lg font-semibold mb-2">
                    エラーが発生しました
                </h2>
                <p className="text-red-600">
                    エラーコード：{coreError.errorCode}
                </p>
                <p className="text-red-600">{coreError.errorMessage}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    再読み込み
                </button>
            </div>
        </div>
    );
}
