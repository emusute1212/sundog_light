import {SignIn, SignInType} from "@/components/auth/signin-button";
import {useSearchParams} from "next/navigation";

export default function HostTopPage() {
    const searchParams = useSearchParams();
    const redirectUri = searchParams.get("redirectUri") ?? "/event/list"
    return (
        <SignIn
            redirectUri={redirectUri}
            type={SignInType.Google}
        />
    );
}
