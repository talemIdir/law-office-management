import React, { useState } from "react";
import { useEffect } from "react";

const services = [
  {
    id: 1,
    title: "سحب الأحكام من طرف المحامين",
    url: "https://portail.mjustice.dz/remote/login?lang=fr",
    icon: "⚖️",
    description: "منصة سحب الأحكام القضائية",
  },
  {
    id: 2,
    title: "عدم المعارضة والإستئناف والطعن بالنقض",
    url: "https://cert-nonrecours.mjustice.dz/",
    icon: "📋",
    description: "إيداع طلبات عدم المعارضة وعدم الاستئناف",
  },
  {
    id: 3,
    title: "رخص الاتصال بالمحبوسين",
    url: "https://ziyarati.mjustice.dz/",
    icon: "🔐",
    description: "إيداع طلبات رخص الزيارة الإلكترونية",
  },
  {
    id: 4,
    title: "النيابة الإلكترونية",
    url: "https://e-nyaba.mjustice.dz/choix.php",
    icon: "🏛️",
    description: "منصة النيابة العامة الإلكترونية",
  },
  {
    id: 5,
    title: "التحقق من مصدر الوثائق",
    url: "http://authentification.mjustice.dz/",
    icon: "✔️",
    description: "التحقق من صحة الوثائق الإلكترونية",
  },
];

function ElectronicServicesPage() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});

  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const handleWebviewLoad = (serviceId, isLoading, hasError = false) => {
    setLoadingStates((prev) => ({ ...prev, [serviceId]: isLoading }));
    setErrorStates((prev) => ({ ...prev, [serviceId]: hasError }));
  };

  useEffect(() => {
    const webview = document.getElementById(`webview-${selectedService.id}`);
    if (webview) {
      const handleLoadStart = () =>
        handleWebviewLoad(selectedService.id, true, false);
      const handleLoadStop = () =>
        handleWebviewLoad(selectedService.id, false, false);
      const handleLoadAbort = () =>
        handleWebviewLoad(selectedService.id, false, true);

      webview.addEventListener("did-start-loading", handleLoadStart);
      webview.addEventListener("did-stop-loading", handleLoadStop);
      webview.addEventListener("did-fail-load", handleLoadAbort);

      return () => {
        webview.removeEventListener("did-start-loading", handleLoadStart);
        webview.removeEventListener("did-stop-loading", handleLoadStop);
        webview.removeEventListener("did-fail-load", handleLoadAbort);
      };
    }
  }, [selectedService]);

  return (
    <div
      className="page-content"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <div
        style={{
          padding: "15px 20px",
          background: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
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
          الخدمات الإلكترونية لوزارة العدل
        </h1>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar with service cards */}
        <div
          style={{
            width: "320px",
            background: "#ffffff",
            borderLeft: "1px solid #dee2e6",
            overflowY: "auto",
            padding: "15px",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <p
              style={{ color: "#666", fontSize: "14px", margin: "0 0 15px 0" }}
            >
              اختر الخدمة الإلكترونية التي تريد الوصول إليها:
            </p>
          </div>

          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              style={{
                padding: "15px",
                marginBottom: "10px",
                background:
                  selectedService.id === service.id ? "#e3f2fd" : "#f8f9fa",
                border:
                  selectedService.id === service.id
                    ? "2px solid #2196f3"
                    : "1px solid #dee2e6",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (selectedService.id !== service.id) {
                  e.currentTarget.style.background = "#f0f0f0";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedService.id !== service.id) {
                  e.currentTarget.style.background = "#f8f9fa";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "24px", marginLeft: "10px" }}>
                  {service.icon}
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "600",
                    color:
                      selectedService.id === service.id ? "#1976d2" : "#333",
                  }}
                >
                  {service.title}
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#666",
                  lineHeight: "1.4",
                }}
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Main content area with webview */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
          }}
        >
          {/* Webview header */}
          <div
            style={{
              padding: "12px 20px",
              background: "#f8f9fa",
              borderBottom: "1px solid #dee2e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>{selectedService.icon}</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                {selectedService.title}
              </h2>
            </div>
            {loadingStates[selectedService.id] && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "3px solid #f3f3f3",
                    borderTop: "3px solid #2196f3",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <span style={{ color: "#666", fontSize: "13px" }}>
                  جاري التحميل...
                </span>
              </div>
            )}
          </div>

          {/* Webview or error message */}
          {errorStates[selectedService.id] ? (
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
                style={{ fontSize: "64px", marginBottom: "20px", opacity: 0.3 }}
              >
                ⚠️
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  marginBottom: "10px",
                  color: "#333",
                }}
              >
                فشل تحميل الخدمة
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "20px",
                  maxWidth: "400px",
                }}
              >
                تعذر الاتصال بالمنصة. يرجى التحقق من اتصال الإنترنت أو المحاولة
                مرة أخرى.
              </p>
              <button
                onClick={() => {
                  setErrorStates((prev) => ({ ...prev, [selectedService.id]: false }));
                  setLoadingStates((prev) => ({ ...prev, [selectedService.id]: true }));
                }}
                style={{
                  padding: "10px 30px",
                  background: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, position: "relative" }} key={selectedService.id}>
              <webview
                id={`webview-${selectedService.id}`}
                src={selectedService.url}
                partition={`persist:service-${selectedService.id}`}
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
        </div>
      </div>

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

export default ElectronicServicesPage;
