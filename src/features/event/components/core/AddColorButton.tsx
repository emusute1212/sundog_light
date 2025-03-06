import {Plus} from "lucide-react";

export default function AddColorButton({onAddColorButton}: {
    onAddColorButton: () => void,
}) {
    return (
        <div
            className={`p-4 rounded-lg shadow-md aspect-square`}
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