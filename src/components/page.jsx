import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

export default function UxLens() {
    const [step, setStep] = useState(1);

    const [prodInputType, setProdInputType] = useState("url");
    const [designInputType, setDesignInputType] = useState("image");

    const [prodURL, setProdURL] = useState("");
    const [prodImage, setProdImage] = useState(null);
    const [designImage, setDesignImage] = useState(null);
    const [figmaToken, setFigmaToken] = useState("");
    const [sessionToken, setSessionToken] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            const res = await fetch("https://pixel-probe-backend.onrender.com/api/start", {
                method: "POST",
            });
            const data = await res.json();
            setSessionToken(data.sessionId);
            console.log("Session ID:", data.sessionId);
        }
        fetchSession();
    }, []);

    const ConnectToFigma = () => {
        toast.info("Figma connection feature coming soon!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    const compareDesigns = async () => {
        setLoading(true);
        if (!designImage) {
            toast.error("Please upload a design screenshot first.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setLoading(false);
            return;
        }

        if (!prodImage) {
            toast.error("Please upload a production screenshot first.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setLoading(false);
            return;
        }


        const formData = new FormData();
        formData.append("prod", prodImage);
        formData.append("design", designImage);

        const toBase64 = (file) =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(",")[1]);
                reader.onerror = (error) => reject(error);
            });


        try {
            const base64ProdImage = await toBase64(prodImage);
            const base64DesignImage = await toBase64(designImage);
            const response = await fetch("https://pixel-probe-backend.onrender.com/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prodImage: base64ProdImage,
                    DesImage: base64DesignImage,
                    sessionId: sessionToken
                })
            });

            const result = await response.json();

            if (result.error) {
                toast.error(`Error: ${result.error}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                setLoading(false);
                return;
            }

            setComparisonResult(result.comparison || result);
            setLoading(false);
            console.log("Server response:", result);
        } catch (err) {
            console.error("Error uploading file:", err);
            setLoading(false);
        }
    }

    const analyzeScreenshots = async () => {
        setLoading(true);
        const url = prodURL.trim();
        if (!url) {
            toast.error("Please enter a valid production URL.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setLoading(false);
            return;
        }

        const res = await fetch("https://pixel-probe-backend.onrender.com/api/screenshot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url, sessionId: sessionToken }),
        })

        const result = await res.json();

        if (result.error) {
            toast.error(`Error: ${result.error}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setLoading(false);
            return;
        }


        console.log("Screenshot Analysis Result:", result);
        setAnalysisResult(result.analysis);
        setPreviewImage(result.image)
        setLoading(false);

    };

    const handleProdImage = (e) => {
        setProdImage(e.target.files[0]);
    };

    const handleDesignImage = (e) => {
        setDesignImage(e.target.files[0]);
    }


    return (
        <>
            <ToastContainer />
            <div className={`w-full min-h-screen bg-gray-50 p-3 sm:p-6 ${loading ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="max-w-7xl mx-auto bg-white shadow-sm rounded-xl p-4 sm:p-6 border border-gray-200">

                    {/* Header - Always visible on mobile */}
                    <div className="mb-6">
                        <h1 className="text-xl sm:text-2xl font-semibold mb-4">Pixel Probe AI</h1>

                        {/* Step Indicator - Responsive */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                                onClick={() => setStep(1)}
                                className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${step === 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                1. Production
                            </button>

                            <button
                                onClick={() => setStep(2)}
                                className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${step === 2 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                2. Design
                            </button>
                        </div>
                    </div>

                    {/* Content Grid - Stacks on mobile, grid on desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT PANEL - Input Controls */}
                        <div className="lg:border-r lg:pr-6">
                            {step === 1 && (
                                <>
                                    <h2 className="text-lg font-medium mb-3">Production Version</h2>
                                    <label className="text-sm font-medium">Choose Input</label>

                                    {/* URL option */}
                                    <div className="mt-3">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                checked={prodInputType === "url"}
                                                onChange={() => setProdInputType("url")}
                                            />
                                            <span className="text-sm">Website URL</span>
                                        </label>

                                        {prodInputType === "url" && (
                                            <>
                                                <input
                                                    type="text"
                                                    placeholder="https://prod-site.com"
                                                    className="w-full mt-2 px-3 py-2 border rounded-md text-sm"
                                                    value={prodURL}
                                                    onChange={(e) => setProdURL(e.target.value)}
                                                />
                                                <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 cursor-pointer" onClick={() => analyzeScreenshots()}>
                                                    Upload Production
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Image option */}
                                    <div className="mt-6">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                checked={prodInputType === "image"}
                                                onChange={() => setProdInputType("image")}
                                            />
                                            <span className="text-sm">Upload Screenshot</span>
                                        </label>

                                        {prodInputType === "image" && (
                                            <div className="mt-3">
                                                <input type="file" className="w-full border rounded-md p-2 text-sm" onChange={handleProdImage} />
                                                <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2 className="text-lg font-medium mb-3">Design Version</h2>
                                    <label className="text-sm font-medium">Choose Input</label>

                                    {/* Upload Design Screenshot */}
                                    <div className="mt-3">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                checked={designInputType === "image"}
                                                onChange={() => setDesignInputType("image")}
                                            />
                                            <span className="text-sm">Upload Design Screenshot</span>
                                        </label>

                                        {designInputType === "image" && (
                                            <div className="mt-3">
                                                <input type="file" className="w-full border rounded-md p-2 text-sm" onChange={handleDesignImage} />
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, Figma exports</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Figma Connect */}
                                    <div className="mt-6">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                checked={designInputType === "figma"}
                                                onChange={() => setDesignInputType("figma")}
                                            />
                                            <span className="text-sm">Connect Figma</span>
                                        </label>

                                        {designInputType === "figma" && (
                                            <button onClick={() => ConnectToFigma()} className="w-full mt-3 border border-blue-600 text-blue-600 py-2 rounded-md hover:bg-blue-50">
                                                Connect Figma
                                            </button>
                                        )}
                                    </div>

                                    {/* Analyze Button */}
                                    <button className="w-full mt-6 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 cursor-pointer" onClick={() => compareDesigns()}>
                                        Analyze Consistency
                                    </button>
                                </>
                            )}
                        </div>

                        {/* MIDDLE PANEL - Preview */}
                        <div className="lg:col-span-1 lg:px-6 lg:border-r">
                            <h2 className="text-xl font-semibold mb-4">Preview</h2>
                            {previewImage || prodImage || designImage ? (
                                <div className="space-y-4">
                                    {/* Preview Image */}
                                    {previewImage && (
                                        <div>
                                            <h4 className="font-medium mb-2 text-sm">Preview</h4>
                                            <img
                                                src={`data:image/png;base64,${previewImage}`}
                                                alt="Screenshot preview"
                                                className="w-full rounded-lg shadow"
                                            />
                                        </div>
                                    )}

                                    {/* Production Image */}
                                    {prodImage && (
                                        <div>
                                            <h4 className="font-medium mb-2 text-sm">Production</h4>
                                            <img
                                                src={prodImage ? URL.createObjectURL(prodImage) : null}
                                                alt="Production screenshot"
                                                className="w-full rounded-lg shadow"
                                            />
                                        </div>
                                    )}

                                    {/* Design Image */}
                                    {designImage && (
                                        <div>
                                            <h4 className="font-medium mb-2 text-sm">Design</h4>
                                            <img
                                                src={designImage ? URL.createObjectURL(designImage) : null}
                                                alt="Design screenshot"
                                                className="w-full rounded-lg shadow"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="border rounded-xl p-6 bg-white text-center text-gray-400">
                                    <p className="text-sm">No preview yet. Upload production and design.</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT PANEL - Results */}
                        <div className="space-y-4 lg:col-span-1">
                            <h2 className="text-xl font-semibold mb-4">Results</h2>

                            {(!analysisResult && !comparisonResult) ? (
                                <div className="border rounded-xl p-6 bg-white text-gray-400 text-center">
                                    <p className="text-sm">Results will appear here.</p>
                                </div>
                            ) : (
                                analysisResult ?
                                    <>
                                        <div className="border rounded-xl p-4 bg-white">
                                            <p className="text-sm text-gray-500">Overall UX Score</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm">Summary</span>
                                                <span className="text-4xl font-bold text-blue-600">
                                                    {Math.round(analysisResult.UX_score * 10)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* DYNAMIC SECTIONS */}
                                        {[
                                            "hierarchy",
                                            "readability",
                                            "spacing",
                                            "color_issues"
                                        ].map((section) =>
                                            analysisResult[section] ? (
                                                <div key={section} className="border rounded-xl p-4 bg-white">
                                                    <h3 className="font-semibold capitalize text-base">
                                                        {section.replace("_", " ")}
                                                    </h3>

                                                    {/* Strengths */}
                                                    {analysisResult[section].strengths?.length > 0 && (
                                                        <div className="mt-3">
                                                            <h4 className="text-sm font-medium text-green-700">
                                                                Strengths
                                                            </h4>
                                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-sm text-gray-700">
                                                                {analysisResult[section].strengths.map((item, i) => (
                                                                    <li key={i}>{item}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Issues */}
                                                    {analysisResult[section].issues?.length > 0 && (
                                                        <div className="mt-4">
                                                            <h4 className="text-sm font-medium text-red-700">Issues</h4>
                                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-sm text-gray-700">
                                                                {analysisResult[section].issues.map((item, i) => (
                                                                    <li key={i}>{item}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null
                                        )}
                                    </> :
                                    <div className="space-y-6">
                                        {/* Overall Change */}
                                        {comparisonResult.overall_change && (
                                            <div className="border rounded-xl p-4 bg-gray-50">
                                                <h3 className="font-semibold mb-2 text-base">Overall Change</h3>
                                                <p className="text-gray-700 text-sm">{comparisonResult.overall_change}</p>
                                            </div>
                                        )}

                                        {/* Sections */}
                                        {[
                                            { key: "improvements", title: "Improvements", color: "green-700" },
                                            { key: "regressions", title: "Regressions", color: "red-700" },
                                            { key: "spacing_changes", title: "Spacing Changes", color: "blue-700" },
                                            { key: "color_changes", title: "Color Changes", color: "purple-700" },
                                            { key: "typography_changes", title: "Typography Changes", color: "orange-700" },
                                            { key: "missing_elements", title: "Missing Elements", color: "yellow-700" },
                                            { key: "recommendations", title: "Recommendations", color: "teal-700" },
                                        ].map((section) =>
                                            comparisonResult[section.key]?.length > 0 ? (
                                                <div key={section.key} className="border rounded-xl p-4 bg-white">
                                                    <h3 className="font-semibold mb-2 text-base">{section.title}</h3>
                                                    <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
                                                        {comparisonResult[section.key].map((item, i) => (
                                                            <li key={i} className={`text-${section.color}`}>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null
                                        )}
                                    </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <ClipLoader
                        color="#ffffff"
                        loading={loading}
                        size={100}
                    />
                </div>
            )}
        </>
    );
}