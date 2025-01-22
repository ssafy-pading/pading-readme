import axios from 'axios';

const LANGUAGE_VERSIONS: {
    javascript: string
    typescript: string
    python: string
    java: string
    csharp: string
    php: string
} =
{
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.0.2",
    csharp: "6.12.0",
    php: "8.2.3",
}

const API = axios.create({
    baseURL: "https://emkc.org/api/v2/piston"
})

export const executeCode = async (language: string, sourceCode: string) => {
    const response = await API.post("/execute", {
        "language": language,
        "version": LANGUAGE_VERSIONS[language],
        "files": [
            {
                content: sourceCode
            }
        ]

    })
    return response.data
}