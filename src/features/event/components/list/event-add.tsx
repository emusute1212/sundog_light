import {Plus} from "lucide-react";

export default function EventAdd() {
    return (
        <div className={`flex justify-between items-center space-x-2 bg-white p-4 rounded-xl shadow-md mb-2`}>
            <Plus color="black" size={24}/>
            <span className={`w-full`}>新規追加</span>
        </div>
    );
}