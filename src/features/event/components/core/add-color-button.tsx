import {Plus} from "lucide-react";

export default function AddColorButton(props: {
    onAddColorButton: () => void,
}) {
    return (
        <div
            className={`p-4 rounded-lg shadow-md aspect-square`}
            onClick={() => {
                props.onAddColorButton();
            }}
        >
            <Plus
                className={`rounded-lg w-full h-full`}
            />
        </div>
    );
}