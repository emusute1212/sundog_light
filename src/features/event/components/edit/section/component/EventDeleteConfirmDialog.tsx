export default function EventEditSubmitButton({
    onClickDeleteButton,
    onCloseDialog,
}: {
    onClickDeleteButton: () => void;
    onCloseDialog: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">イベントの削除</h3>
                <p className="mb-6">
                    このイベントを削除してもよろしいですか？この操作は取り消せません。
                </p>
                <div className="flex justify-end gap-4">
                    <button
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        onClick={() => onCloseDialog()}
                    >
                        キャンセル
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => {
                            onClickDeleteButton();
                            onCloseDialog();
                        }}
                    >
                        削除する
                    </button>
                </div>
            </div>
        </div>
    );
}
