import {providerMap, signIn} from "@/auth";

export default function HostLoginPage({searchParams}: {
    searchParams: Promise<{ callbackUrl: string | undefined }>
}) {
    return (
        <div className="flex flex-col gap-2">
            {Object.values(providerMap).map((provider) => (
                <form
                    key={provider.id}
                    action={async () => {
                        "use server"
                        await signIn(provider.id, {
                            redirectTo: (await searchParams)?.callbackUrl ?? "/event/list",
                        })
                    }}
                >
                    <button type="submit">
                        <span>Sign in with {provider.name}</span>
                    </button>
                </form>
            ))}
        </div>
    );
}
