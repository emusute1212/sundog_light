import { Plus } from "lucide-react";

export default function AddColorButton({
    onAddColorButton,
}: {
    onAddColorButton: () => void;
}) {
    return (
        <div
            className={`p-2 rounded-lg shadow-md aspect-square w-24 group-hover:opacity-50 transition-opacity cursor-pointer group`}
            onClick={() => {
                onAddColorButton();
            }}
        >
            <Plus
                className={`rounded-lg w-full h-full group-hover:opacity-50 transition-opacity`}
            />
        </div>
    );
}
