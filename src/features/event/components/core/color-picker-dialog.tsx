import {HexColorPicker} from "react-colorful";

export function ColorPickerDialog({isOpen, defaultColor, onSelectColor, onCloseRequest}: {
    isOpen: boolean,
    defaultColor: string,
    onSelectColor: (color: string) => void,
    onCloseRequest: () => void,
}) {
    return (
        <div>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <HexColorPicker
                            color={defaultColor}
                            onChange={(color) => {
                                onSelectColor(color)
                            }}
                        />
                        <button
                            className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg"
                            onClick={() => onCloseRequest()}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}