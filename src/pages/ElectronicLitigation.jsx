import React from "react";

function ElectronicLitigationPage() {
  return (
    <div className="page-content">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            fontSize: "120px",
            marginBottom: "30px",
            opacity: 0.3,
          }}
        >
          🔒
        </div>
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "20px",
            color: "#333",
          }}
        >
          التقاضي الإلكتروني
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "#666",
            marginBottom: "30px",
            maxWidth: "600px",
            lineHeight: "1.6",
          }}
        >
          هذه الخدمة غير متاحة حالياً
        </p>
        <div
          style={{
            background: "#f0f4f8",
            padding: "20px 30px",
            borderRadius: "8px",
            maxWidth: "500px",
          }}
        >
          <p
            style={{
              fontSize: "16px",
              color: "#555",
              margin: 0,
            }}
          >
            سيتم فتح منصة التقاضي الإلكتروني قريباً. يرجى المتابعة معنا للحصول على
            آخر التحديثات.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ElectronicLitigationPage;
