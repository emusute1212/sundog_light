import {Plus} from "lucide-react";

export default function AddColorButton({onAddColorButton}: {
    onAddColorButton: () => void,
}) {
    return (
        <div
            className={`p-2 rounded-lg shadow-md aspect-square w-24`}
            onClick={() => {
                onAddColorButton();
            }}
        >
            <Plus
                className={`rounded-lg w-full h-full`}
            />
        </div>
    );
}