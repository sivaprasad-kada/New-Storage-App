import { useEffect } from "react";

function GithubCallback() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code && window.opener) {
            // send code to main window
            window.opener.postMessage({ code }, window.location.origin);
            window.close(); // close popup after sending
        }
    }, []);

    return <div>Authenticating...</div>;
}

export default GithubCallback;
