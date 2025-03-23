import { HexColorPicker } from "react-colorful";

export function ColorPickerDialog({
    isOpen,
    defaultColor,
    onSelectColor,
    onCloseRequest,
    onDeleteRequest,
}: {
    isOpen: boolean;
    defaultColor: string;
    onSelectColor: (color: string) => void;
    onCloseRequest: () => void;
    onDeleteRequest: () => void;
}) {
    return (
        <div>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <HexColorPicker
                            color={defaultColor}
                            onChange={(color) => {
                                onSelectColor(color);
                            }}
                        />
                        <div>
                            <button
                                className="mt-2 bg-black text-white px-4 py-2 rounded-lg"
                                onClick={() => onCloseRequest()}
                            >
                                確定
                            </button>
                            <button
                                className="ms-2 mt-2 bg-red-600 text-white px-4 py-2 rounded-lg"
                                onClick={() => {
                                    onDeleteRequest();
                                    onCloseRequest();
                                }}
                            >
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
