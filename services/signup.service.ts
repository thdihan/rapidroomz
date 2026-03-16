type signupPayload = {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
};

export const signup = async (payload: signupPayload) => {
    const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

    console.log("SIGNUP CALLED");
    const res = await fetch(`${apiBaseUrl}/api/v1/user/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        return "Signup failed.";
    }
    const data = await res.json();
    console.log(data);
    return res;
};
