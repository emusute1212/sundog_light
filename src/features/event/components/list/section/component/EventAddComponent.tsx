import {Plus} from "lucide-react";
import Link from "next/link";

export default function EventAddComponent() {
    return (
        <Link
            className={`flex justify-between items-center space-x-2 bg-white p-4 rounded-xl shadow-md mb-2`}
            href={{
                pathname: `/event/create`,
            }}
        >
            <Plus color="black" size={24}/>
            <span className={`w-full`}>新規追加</span>
        </Link>
    );
}