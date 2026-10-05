// ======================================================
// CODING EXECUTION SERVICE
// ======================================================

const LANGUAGE_IDS = {
    JavaScript: 63,
    Python: 71,
    Java: 62,
};


// ======================================================
// GET LANGUAGE ID
// ======================================================

function getLanguageId(language) {

    const languageId =
        LANGUAGE_IDS[language];

    if (!languageId) {
        throw new Error(
            `Unsupported programming language: ${language}`
        );
    }

    return languageId;
}


// ======================================================
// SUBMIT CODE TO JUDGE0
// ======================================================

async function createSubmission({
    code,
    language,
    input,
    expectedOutput,
}) {

    const languageId =
        getLanguageId(language);

    const baseUrl =
        process.env.JUDGE0_API_URL ||
        "https://ce.judge0.com";


    const response =
        await fetch(
            `${baseUrl}/submissions?base64_encoded=true&wait=false`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({

                    source_code:
                        Buffer.from(code).toString("base64"),

                    language_id:
                        languageId,

                    stdin:
                        Buffer.from(input).toString("base64"),

                    expected_output:
                        Buffer
                            .from(expectedOutput)
                            .toString("base64"),

                    cpu_time_limit: 2,

                    memory_limit: 128000,

                }),
            }
        );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Judge0 submission failed: ${errorText}`
        );

    }


    const data =
        await response.json();


    if (!data.token) {

        throw new Error(
            "Judge0 did not return a submission token."
        );

    }


    return data.token;
}


// ======================================================
// GET SUBMISSION RESULT
// ======================================================

async function getSubmissionResult(token) {

    const baseUrl =
        process.env.JUDGE0_API_URL ||
        "https://ce.judge0.com";


    const response =
        await fetch(
            `${baseUrl}/submissions/${token}?base64_encoded=true`
        );


    if (!response.ok) {

        throw new Error(
            "Failed to get Judge0 result."
        );

    }


    return await response.json();
}


// ======================================================
// WAIT FOR RESULT
// ======================================================

async function waitForResult(token) {

    const maxAttempts = 30;

    for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt++
    ) {

        const result =
            await getSubmissionResult(token);


        // 1 = In Queue
        // 2 = Processing

        if (
            result.status &&
            result.status.id !== 1 &&
            result.status.id !== 2
        ) {

            return result;

        }


        await new Promise(
            (resolve) =>
                setTimeout(resolve, 500)
        );

    }


    throw new Error(
        "Code execution timed out."
    );
}


// ======================================================
// DECODE JUDGE0 OUTPUT
// ======================================================

function decodeBase64(value) {

    if (!value) {
        return "";
    }

    try {

        return Buffer
            .from(value, "base64")
            .toString("utf8");

    } catch {

        return value;

    }
}


// ======================================================
// RUN ONE TEST CASE
// ======================================================

export async function executeTestCase({
    code,
    language,
    input,
    expectedOutput,
}) {

    const token =
        await createSubmission({

            code,
            language,
            input,
            expectedOutput,

        });


    const result =
        await waitForResult(token);


    const statusId =
        result.status?.id;


    const stdout =
        decodeBase64(
            result.stdout
        ).trim();


    const stderr =
        decodeBase64(
            result.stderr
        ).trim();


    const compileOutput =
        decodeBase64(
            result.compile_output
        ).trim();


    return {

        passed:
            statusId === 3,

        statusId,

        status:
            result.status?.description ||
            "Unknown",

        output:
            stdout,

        error:
            stderr ||
            compileOutput ||
            "",

        executionTime:
            result.time || null,

        memory:
            result.memory || null,

    };
}

// ======================================================
// RUN CODING QUESTION
// ======================================================

export async function runCodingController(
    req,
    res
) {

    try {

        const {
            problemId,
            code,
        } = req.body;


        if (!problemId || !code) {

            return res.status(400).json({

                success: false,

                message:
                    "Problem ID and code are required.",

            });

        }


        const problem =
            await CodingProblem.findOne({

                _id: problemId,

                firebaseUid:
                    req.user.uid,

            });


        if (!problem) {

            return res.status(404).json({

                success: false,

                message:
                    "Coding problem not found.",

            });

        }


        const results = [];


        // ==================================================
        // ONLY PUBLIC TEST CASES
        // ==================================================

        for (
            const testCase
            of problem.publicTestCases
        ) {

            const result =
                await executeTestCase({

                    code,

                    language:
                        problem.language,

                    input:
                        testCase.input,

                    expectedOutput:
                        testCase.expectedOutput,

                });


            results.push({

                passed:
                    result.passed,

                status:
                    result.status,

                output:
                    result.output,

                error:
                    result.error,

            });

        }


        const passed =
            results.filter(
                (result) =>
                    result.passed
            ).length;


        return res.status(200).json({

            success: true,

            type: "run",

            passed,

            total:
                results.length,

            results,

        });


    } catch (error) {

        console.error(
            "Run coding error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Code execution failed.",

        });

    }

}

// ======================================================
// SUBMIT CODING SOLUTION
// ======================================================

export async function submitCodingController(
    req,
    res
) {

    try {

        const {
            problemId,
            code,
        } = req.body;


        if (!problemId || !code) {

            return res.status(400).json({

                success: false,

                message:
                    "Problem ID and code are required.",

            });

        }


        const problem =
            await CodingProblem.findOne({

                _id: problemId,

                firebaseUid:
                    req.user.uid,

            });


        if (!problem) {

            return res.status(404).json({

                success: false,

                message:
                    "Coding problem not found.",

            });

        }


        const results = [];


        // ==================================================
        // RUN HIDDEN TEST CASES
        // ==================================================

        for (
            const testCase
            of problem.hiddenTestCases
        ) {

            const result =
                await executeTestCase({

                    code,

                    language:
                        problem.language,

                    input:
                        testCase.input,

                    expectedOutput:
                        testCase.expectedOutput,

                });


            results.push({

                passed:
                    result.passed,

                status:
                    result.status,

                output:
                    result.output,

                error:
                    result.error,

            });

        }


        const passed =
            results.filter(
                (result) =>
                    result.passed
            ).length;


        const total =
            results.length;


        const score =
            total > 0
                ? Math.round(
                    (passed / total) * 100
                )
                : 0;


        return res.status(200).json({

            success: true,

            type: "submit",

            passed,

            total,

            score,

            results,

        });


    } catch (error) {

        console.error(
            "Submit coding error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Code submission failed.",

        });

    }

}