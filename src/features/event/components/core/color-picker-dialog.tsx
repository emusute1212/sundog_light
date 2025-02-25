import {HexColorPicker} from "react-colorful";

export function ColorPickerDialog(props: {
    isOpen: boolean,
    defaultColor: string,
    onSelectColor: (color: string) => void,
    onCloseRequest: () => void,
}) {
    return (
        <div>
            {props.isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <HexColorPicker
                            color={props.defaultColor}
                            onChange={(color) => {
                                props.onSelectColor(color)
                            }}
                        />
                        <button
                            className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg"
                            onClick={() => props.onCloseRequest()}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}