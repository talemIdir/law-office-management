import React, { useState, useEffect } from "react";
import {
  clientAPI,
  caseAPI,
  selectFile,
  copyDocumentFile,
} from "../utils/api";
import { showError } from "../utils/toast";

/**
 * Document Modal Component
 * Reusable modal for creating/editing documents
 * Can be pre-populated with clientId and caseId
 */
function DocumentModal({ document, onClose, onSave, preSelectedClientId, preSelectedCaseId }) {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    documentType: "other",
    filePath: "",
    fileName: "",
    fileSize: 0,
    notes: "",
    clientId: preSelectedClientId || "",
    caseId: preSelectedCaseId || "",
    ...document,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter cases when clientId changes
    if (formData.clientId) {
      const clientCases = cases.filter(
        (c) => c.clientId === parseInt(formData.clientId)
      );
      setFilteredCases(clientCases);

      // Reset caseId if the selected case doesn't belong to the new client
      const currentCaseValid = clientCases.some(
        (c) => c.id === parseInt(formData.caseId)
      );
      if (!currentCaseValid && formData.caseId) {
        setFormData({ ...formData, caseId: "" });
      }
    } else {
      setFilteredCases([]);
      if (formData.caseId) {
        setFormData({ ...formData, caseId: "" });
      }
    }
  }, [formData.clientId, cases]);

  const loadData = async () => {
    const [clientsResult, casesResult] = await Promise.all([
      clientAPI.getAll(),
      caseAPI.getAll(),
    ]);
    if (clientsResult.success) setClients(clientsResult.data);
    if (casesResult.success) setCases(casesResult.data);
  };

  const handleSelectFile = async () => {
    try {
      const result = await selectFile();
      if (result.success && result.data) {
        setSelectedFile(result.data);
        setFormData({
          ...formData,
          fileName: result.data.fileName,
          fileSize: result.data.fileSize,
        });
      }
    } catch (error) {
      console.log(error);
      showError("فشل في اختيار الملف");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that client and case are selected for file copying
    if (selectedFile && (!formData.clientId || !formData.caseId)) {
      showError("يجب اختيار الموكل والقضية عند رفع ملف");
      return;
    }

    let finalFormData = { ...formData };

    // If a file was selected, copy it to the documents folder
    if (selectedFile && formData.clientId && formData.caseId) {
      try {
        // Get client and case names for folder structure
        const client = clients.find(
          (c) => c.id === parseInt(formData.clientId)
        );
        const caseData = cases.find((c) => c.id === parseInt(formData.caseId));

        if (!client || !caseData) {
          showError("لم يتم العثور على بيانات الموكل أو القضية");
          return;
        }

        const clientName =
          client.type === "company"
            ? client.companyName
            : `${client.firstName}_${client.lastName}`;
        const caseNumber = caseData.caseNumber;

        // Copy file to organized folder structure
        const copyResult = await copyDocumentFile(
          selectedFile.filePath,
          clientName,
          caseNumber,
          formData.title
        );

        if (copyResult.success && copyResult.data) {
          finalFormData.filePath = copyResult.data.filePath;
          finalFormData.fileName = copyResult.data.fileName;
          finalFormData.fileSize = copyResult.data.fileSize;
        } else {
          showError("فشل في نسخ الملف: " + copyResult.error);
          return;
        }
      } catch (error) {
        showError("حدث خطأ أثناء نسخ الملف");
        return;
      }
    }

    onSave(finalFormData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {document ? "تعديل بيانات مستند" : "إضافة مستند جديد"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label required">عنوان المستند</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">وصف المستند</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description || ""}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label required">نوع المستند</label>
              <select
                name="documentType"
                className="form-select"
                value={formData.documentType}
                onChange={handleChange}
                required
              >
                <option value="contract">عقد</option>
                <option value="court_filing">صك محكمة</option>
                <option value="evidence">دليل</option>
                <option value="correspondence">مراسلة</option>
                <option value="id_document">وثيقة هوية</option>
                <option value="power_of_attorney">توكيل</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{preSelectedClientId ? "الموكل (محدد مسبقاً)" : "الموكل"}</label>
                <select
                  name="clientId"
                  className="form-select"
                  value={formData.clientId}
                  onChange={handleChange}
                  disabled={!!preSelectedClientId}
                >
                  <option value="">اختر الموكل</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.type === "company"
                        ? client.companyName
                        : `${client.firstName} ${client.lastName}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{preSelectedCaseId ? "القضية (محددة مسبقاً)" : "القضية"}</label>
                <select
                  name="caseId"
                  className="form-select"
                  value={formData.caseId}
                  onChange={handleChange}
                  disabled={!formData.clientId || !!preSelectedCaseId}
                >
                  <option value="">
                    {formData.clientId ? "اختر القضية" : "اختر الموكل أولاً"}
                  </option>
                  {filteredCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">اختيار الملف</label>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleSelectFile}
                >
                  📎 اختيار ملف
                </button>
                {selectedFile && (
                  <span style={{ color: "#28a745", fontSize: "14px" }}>
                    ✓ {selectedFile.fileName} (
                    {Math.round(selectedFile.fileSize / 1024)} KB)
                  </span>
                )}
              </div>
              <small
                style={{
                  color: "#666",
                  fontSize: "12px",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                سيتم حفظ الملف في: documents/اسم_الموكل/رقم_القضية/عنوان_المستند
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={formData.notes || ""}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {document ? "حفظ التعديلات" : "إضافة مستند"}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DocumentModal;
