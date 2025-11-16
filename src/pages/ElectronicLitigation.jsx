import React, { useEffect, useRef, useState } from "react";

function ElectronicLitigationPage() {
  const webviewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const webview = webviewRef.current;

    if (webview) {
      const handleLoadStart = () => {
        setIsLoading(true);
        setHasError(false);
      };

      const handleLoadStop = () => {
        setIsLoading(false);
      };

      const handleLoadAbort = () => {
        setIsLoading(false);
        setHasError(true);
      };

      webview.addEventListener("did-start-loading", handleLoadStart);
      webview.addEventListener("did-stop-loading", handleLoadStop);
      webview.addEventListener("did-fail-load", handleLoadAbort);

      return () => {
        webview.removeEventListener("did-start-loading", handleLoadStart);
        webview.removeEventListener("did-stop-loading", handleLoadStop);
        webview.removeEventListener("did-fail-load", handleLoadAbort);
      };
    }
  }, []);

  return (
    <div
      className="page-content"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          padding: "15px 20px",
          background: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            margin: 0,
            color: "#333",
            fontWeight: "600",
          }}
        >
          منصة التقاضي الإلكتروني
        </h1>
        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid #3498db",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span style={{ color: "#666", fontSize: "14px" }}>
              جاري التحميل...
            </span>
          </div>
        )}
      </div>

      {hasError ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            textAlign: "center",
            padding: "40px",
          }}
        >
          <div
            style={{
              fontSize: "80px",
              marginBottom: "20px",
              opacity: 0.3,
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              fontSize: "24px",
              marginBottom: "15px",
              color: "#333",
            }}
          >
            فشل تحميل المنصة
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#666",
              marginBottom: "20px",
            }}
          >
            تعذر الاتصال بمنصة التقاضي الإلكتروني. يرجى التحقق من اتصال الإنترنت
            والمحاولة مرة أخرى.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              if (webviewRef.current) {
                webviewRef.current.reload();
              }
            }}
            style={{
              padding: "10px 30px",
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, position: "relative" }}>
          <webview
            ref={webviewRef}
            src="https://tadjrib.mjustice.dz/login.php"
            partition="persist:litigation"
            allowpopups="true"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          />
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default ElectronicLitigationPage;
